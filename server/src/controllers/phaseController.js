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
      .sort({ order: 1, createdAt: 1 });

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
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: phases.length,
      data: phases,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new phase (supports inserting in the middle)
// @route   POST /api/phases
// @access  Private (Developer only)
exports.createPhase = async (req, res, next) => {
  try {
    const { title, description, notes, projectId, insertPosition } = req.body;

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

    const existingPhases = await Phase.find({
      projectId,
      developerId: req.user._id,
    }).sort({ order: 1, createdAt: 1 });

    let targetOrder = existingPhases.length;

    if (
      typeof insertPosition === 'number' &&
      insertPosition >= 0 &&
      insertPosition <= existingPhases.length
    ) {
      targetOrder = insertPosition;
      // Shift subsequent phases up by 1
      for (let i = insertPosition; i < existingPhases.length; i++) {
        existingPhases[i].order = i + 1;
        await existingPhases[i].save();
      }
    }

    const phase = await Phase.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      notes: notes ? notes.trim() : '',
      projectId,
      developerId: req.user._id,
      order: targetOrder,
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

// @desc    Update phase title, description, & notes
// @route   PUT /api/phases/:id
// @access  Private (Developer only - Owner)
exports.updatePhase = async (req, res, next) => {
  try {
    const { title, description, notes } = req.body;
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
    if (notes !== undefined) phase.notes = notes.trim();
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

// @desc    Update developer notes / work logs on phase
// @route   PATCH /api/phases/:id/notes
// @access  Private (Developer only - Owner)
exports.updatePhaseNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    let phase = await Phase.findById(req.params.id);

    if (!phase) {
      return res.status(404).json({ success: false, message: 'Phase not found' });
    }

    if (phase.developerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update notes on another developer\'s phase',
      });
    }

    phase.notes = notes !== undefined ? notes.trim() : '';
    await phase.save();

    const populated = await Phase.findById(phase._id).populate(
      'developerId',
      'name email role'
    );

    res.status(200).json({
      success: true,
      message: 'Developer notes saved successfully',
      data: populated,
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

    // Ensure developer cannot check off another developer's phase
    if (req.user.role !== 'admin' && phase.developerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only check off your own deliverable phases.',
      });
    }

    const { notes } = req.body;
    phase.completed = !phase.completed;
    phase.completedAt = phase.completed ? new Date() : null;
    if (notes !== undefined) {
      phase.notes = notes.trim();
    }
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

// @desc    Bulk create phases (Paster / Quick Import)
// @route   POST /api/phases/bulk
// @access  Private (Developer only)
exports.bulkCreatePhases = async (req, res, next) => {
  try {
    const { projectId, phases } = req.body;

    if (!projectId || !Array.isArray(phases) || phases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and a non-empty phases list are required',
      });
    }

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

    const validPhases = phases
      .map((p) => {
        if (typeof p === 'string') {
          return { title: p.trim(), description: '' };
        }
        return {
          title: (p.title || '').trim(),
          description: (p.description || '').trim(),
        };
      })
      .filter((p) => p.title.length > 0);

    if (validPhases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid phase titles found to import',
      });
    }

    const existingCount = await Phase.countDocuments({
      projectId,
      developerId: req.user._id,
    });

    const createdDocs = await Phase.insertMany(
      validPhases.map((p, idx) => ({
        title: p.title,
        description: p.description,
        projectId,
        developerId: req.user._id,
        order: existingCount + idx,
        completed: false,
      }))
    );

    const metrics = await calculateMetrics(projectId, req.user._id);

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdDocs.length} deliverable phases`,
      count: createdDocs.length,
      data: createdDocs,
      metrics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move a phase up or down in the sequence
// @route   PATCH /api/phases/:id/move
// @access  Private (Developer only - Owner)
exports.movePhase = async (req, res, next) => {
  try {
    const { direction } = req.body; // 'up' or 'down'
    const phase = await Phase.findById(req.params.id);

    if (!phase) {
      return res.status(404).json({ success: false, message: 'Phase not found' });
    }

    if (phase.developerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to move another developer's phase",
      });
    }

    // Get all phases for this developer in this project sorted in order
    const phases = await Phase.find({
      projectId: phase.projectId,
      developerId: phase.developerId,
    }).sort({ order: 1, createdAt: 1 });

    // Normalize orders to ensure clean sequence
    for (let i = 0; i < phases.length; i++) {
      if (phases[i].order !== i) {
        phases[i].order = i;
        await phases[i].save();
      }
    }

    const currentIndex = phases.findIndex(
      (p) => p._id.toString() === phase._id.toString()
    );

    if (currentIndex === -1) {
      return res.status(400).json({ success: false, message: 'Phase not in list' });
    }

    if (direction === 'up' && currentIndex > 0) {
      const targetIndex = currentIndex - 1;
      phases[currentIndex].order = targetIndex;
      phases[targetIndex].order = currentIndex;

      await phases[currentIndex].save();
      await phases[targetIndex].save();
    } else if (direction === 'down' && currentIndex < phases.length - 1) {
      const targetIndex = currentIndex + 1;
      phases[currentIndex].order = targetIndex;
      phases[targetIndex].order = currentIndex;

      await phases[currentIndex].save();
      await phases[targetIndex].save();
    }

    const updatedPhases = await Phase.find({
      projectId: phase.projectId,
      developerId: phase.developerId,
    })
      .populate('developerId', 'name email role')
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      message: `Phase moved ${direction} successfully`,
      data: updatedPhases,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder an array of phases
// @route   PUT /api/phases/reorder
// @access  Private (Developer only)
exports.reorderPhases = async (req, res, next) => {
  try {
    const { phaseIds, projectId } = req.body;
    if (!Array.isArray(phaseIds)) {
      return res.status(400).json({ success: false, message: 'phaseIds must be an array' });
    }

    await Promise.all(
      phaseIds.map(async (id, index) => {
        await Phase.updateOne(
          { _id: id, developerId: req.user._id },
          { $set: { order: index } }
        );
      })
    );

    const updatedPhases = await Phase.find({
      projectId,
      developerId: req.user._id,
    })
      .populate('developerId', 'name email role')
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      message: 'Phases reordered successfully',
      data: updatedPhases,
    });
  } catch (error) {
    next(error);
  }
};


