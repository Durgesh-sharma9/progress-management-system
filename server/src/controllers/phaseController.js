const Phase = require('../models/Phase');
const Project = require('../models/Project');

// Helper to calculate progress metrics
const calculateMetrics = async (projectId, developerId = null) => {
  // Project Overall Metrics
  const allPhases = await Phase.find({ projectId });
  const total = allPhases.length;
  const completed = allPhases.filter((p) => p.completed).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Developer Specific Metrics (if developerId is provided)
  let devProgress = 0;
  let devTotal = 0;
  let devCompleted = 0;

  if (developerId) {
    const devPhases = allPhases.filter(
      (p) => p.developerId.toString() === developerId.toString()
    );
    devTotal = devPhases.length;
    devCompleted = devPhases.filter((p) => p.completed).length;
    devProgress =
      devTotal > 0 ? Math.round((devCompleted / devTotal) * 100) : 0;
  }

  return {
    project: { total, completed, pending: total - completed, progress },
    developer: {
      total: devTotal,
      completed: devCompleted,
      pending: devTotal - devCompleted,
      progress: devProgress,
    },
  };
};

// @desc    Get all phases belonging to the logged-in developer
// @route   GET /api/phases/my
// @access  Private (Developer only)
exports.getMyPhases = async (req, res, next) => {
  try {
    const phases = await Phase.find({ developerId: req.user._id })
      .populate('projectId', 'name status')
      .populate('developerId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: phases.length,
      data: phases,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get phases by project ID
// @route   GET /api/phases/project/:projectId
// @access  Private
exports.getPhasesByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { view } = req.query; // 'all' or default

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    let query = { projectId };

    // If developer and not requesting team-wide view, filter to their own
    if (req.user.role === 'developer' && view !== 'all') {
      query.developerId = req.user._id;
    }

    const phases = await Phase.find(query)
      .populate('developerId', 'name email role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: phases.length,
      data: phases,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new phase
// @route   POST /api/phases
// @access  Private (Developer only)
exports.createPhase = async (req, res, next) => {
  try {
    const { title, description, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Phase title and project ID are required',
      });
    }

    // Verify developer is assigned to this project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isAssigned = project.developers.some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this project',
      });
    }

    const phase = await Phase.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      projectId,
      developerId: req.user._id,
      completed: false,
    });

    const populated = await Phase.findById(phase._id).populate(
      'developerId',
      'name email role'
    );
    const metrics = await calculateMetrics(projectId, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Phase created successfully',
      data: populated,
      metrics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle phase completion checkbox
// @route   PATCH /api/phases/:id/toggle
// @access  Private (Assigned Developers)
exports.togglePhase = async (req, res, next) => {
  try {
    const phase = await Phase.findById(req.params.id);

    if (!phase) {
      return res.status(404).json({ success: false, message: 'Phase not found' });
    }

    // Verify user is assigned to this project or is Admin
    const project = await Project.findById(phase.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isAssigned = project.developers.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this project',
      });
    }

    phase.completed = !phase.completed;
    phase.completedAt = phase.completed ? new Date() : null;
    await phase.save();

    const populated = await Phase.findById(phase._id).populate(
      'developerId',
      'name email role'
    );
    const metrics = await calculateMetrics(phase.projectId, req.user._id);

    res.status(200).json({
      success: true,
      message: phase.completed ? 'Phase marked as completed' : 'Phase marked as pending',
      data: populated,
      metrics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update phase title & description
// @route   PUT /api/phases/:id
// @access  Private (Developer only - Owner)
exports.updatePhase = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    let phase = await Phase.findById(req.params.id);

    if (!phase) {
      return res.status(404).json({ success: false, message: 'Phase not found' });
    }

    // Ensure only the owning developer can update
    if (phase.developerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit another developer\'s phase',
      });
    }

    if (title) phase.title = title.trim();
    if (description !== undefined) phase.description = description.trim();
    await phase.save();

    const populated = await Phase.findById(phase._id).populate(
      'developerId',
      'name email role'
    );

    res.status(200).json({
      success: true,
      message: 'Phase updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete phase
// @route   DELETE /api/phases/:id
// @access  Private (Developer only - Owner)
exports.deletePhase = async (req, res, next) => {
  try {
    const phase = await Phase.findById(req.params.id);

    if (!phase) {
      return res.status(404).json({ success: false, message: 'Phase not found' });
    }

    // Ensure only the owning developer can delete
    if (phase.developerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete another developer\'s phase',
      });
    }

    const projectId = phase.projectId;
    await Phase.findByIdAndDelete(phase._id);
    const metrics = await calculateMetrics(projectId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Phase deleted successfully',
      metrics,
    });
  } catch (error) {
    next(error);
  }
};
