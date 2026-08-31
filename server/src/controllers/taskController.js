const Task = require('../models/Task');
const Phase = require('../models/Phase');
const Project = require('../models/Project');

// Helper to calculate progress metrics after a task operation
const calculateProgressMetrics = async (projectId, phaseId, developerId) => {
  // 1. Phase Progress
  const phaseTotal = await Task.countDocuments({ phaseId });
  const phaseCompleted = await Task.countDocuments({ phaseId, completed: true });
  const phaseProgress = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;

  // 2. Developer Progress in Project
  const devTotal = await Task.countDocuments({ projectId, developerId });
  const devCompleted = await Task.countDocuments({ projectId, developerId, completed: true });
  const developerProgress = devTotal > 0 ? Math.round((devCompleted / devTotal) * 100) : 0;

  // 3. Overall Project Progress
  const projectTotal = await Task.countDocuments({ projectId });
  const projectCompleted = await Task.countDocuments({ projectId, completed: true });
  const projectProgress = projectTotal > 0 ? Math.round((projectCompleted / projectTotal) * 100) : 0;

  return {
    phase: {
      total: phaseTotal,
      completed: phaseCompleted,
      progress: phaseProgress,
    },
    developer: {
      total: devTotal,
      completed: devCompleted,
      progress: developerProgress,
    },
    project: {
      total: projectTotal,
      completed: projectCompleted,
      progress: projectProgress,
    },
  };
};

// @desc    Get tasks with optional filters
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { projectId, phaseId, completed } = req.query;
    let query = {};

    if (req.user.role === 'developer') {
      query.developerId = req.user._id;
    }

    if (projectId) query.projectId = projectId;
    if (phaseId) query.phaseId = phaseId;
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }

    const tasks = await Task.find(query)
      .populate('projectId', 'name status')
      .populate('phaseId', 'title')
      .populate('developerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks for a specific project
// @route   GET /api/tasks/project/:projectId
// @access  Private
exports.getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    let query = { projectId };

    if (req.user.role === 'developer') {
      query.developerId = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('phaseId', 'title')
      .populate('developerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Developer only)
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, phaseId } = req.body;

    if (!title || !projectId || !phaseId) {
      return res.status(400).json({
        success: false,
        message: 'Task title, project ID, and phase ID are required',
      });
    }

    // Verify the phase exists and belongs to this developer
    const phase = await Phase.findById(phaseId);
    if (!phase) {
      return res.status(404).json({ success: false, message: 'Phase not found' });
    }

    if (phase.developerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only add tasks to your own phase',
      });
    }

    const task = await Task.create({
      title,
      description: description || '',
      projectId,
      phaseId,
      developerId: req.user._id,
      completed: false,
    });

    const metrics = await calculateProgressMetrics(projectId, phaseId, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
      metrics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (Developer only - Owner)
exports.updateTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.developerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit another developer\'s task',
      });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle task completion (Checkbox trigger)
// @route   PATCH /api/tasks/:id/toggle
// @access  Private (Developer only - Owner)
exports.toggleTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.developerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to toggle another developer\'s task',
      });
    }

    // Toggle status and timestamp
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();

    // Recalculate automatic progress values across Phase, Developer, and Project
    const metrics = await calculateProgressMetrics(
      task.projectId,
      task.phaseId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: task.completed ? 'Task marked as completed' : 'Task marked as pending',
      data: task,
      metrics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Developer only - Owner)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.developerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete another developer\'s task',
      });
    }

    const { projectId, phaseId } = task;
    await Task.findByIdAndDelete(task._id);

    const metrics = await calculateProgressMetrics(projectId, phaseId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      metrics,
    });
  } catch (error) {
    next(error);
  }
};
