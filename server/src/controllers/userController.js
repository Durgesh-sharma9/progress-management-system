const User = require('../models/User');
const Project = require('../models/Project');
const Phase = require('../models/Phase');

// @desc    Get all developers with aggregated statistics
// @route   GET /api/users/developers
// @access  Private (Admin only)
exports.getDevelopers = async (req, res, next) => {
  try {
    const developers = await User.find({ role: 'developer' }).select('-password').sort({ name: 1 });

    const enriched = await Promise.all(
      developers.map(async (dev) => {
        const assignedProjects = await Project.find({
          developers: dev._id,
        }).select('_id name projectType status');

        const totalPhases = await Phase.countDocuments({
          developerId: dev._id,
        });
        const completedPhases = await Phase.countDocuments({
          developerId: dev._id,
          completed: true,
        });
        const progress =
          totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

        return {
          _id: dev._id,
          name: dev.name,
          email: dev.email,
          role: dev.role,
          joiningDate: dev.joiningDate || dev.createdAt,
          createdAt: dev.createdAt,
          assignedProjects,
          assignedProjectsCount: assignedProjects.length,
          totalPhases,
          completedPhases,
          totalTasks: totalPhases,
          completedTasks: completedPhases,
          pendingTasks: totalPhases - completedPhases,
          progress,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a developer by Admin
// @route   POST /api/users/developers
// @access  Private (Admin only)
exports.createDeveloper = async (req, res, next) => {
  try {
    const { name, email, password, joiningDate } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const developer = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'developer',
      joiningDate: joiningDate ? new Date(joiningDate) : Date.now(),
    });

    res.status(201).json({
      success: true,
      message: 'Developer account created successfully',
      data: {
        _id: developer._id,
        name: developer.name,
        email: developer.email,
        role: developer.role,
        joiningDate: developer.joiningDate || developer.createdAt,
        createdAt: developer.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a developer by Admin
// @route   DELETE /api/users/developers/:id
// @access  Private (Admin only)
exports.deleteDeveloper = async (req, res, next) => {
  try {
    const developer = await User.findById(req.params.id);
    if (!developer || developer.role !== 'developer') {
      return res.status(404).json({ success: false, message: 'Developer not found' });
    }

    // Remove from assigned projects
    await Project.updateMany(
      { developers: developer._id },
      { $pull: { developers: developer._id } }
    );

    // Remove phases
    await Phase.deleteMany({ developerId: developer._id });
    await User.findByIdAndDelete(developer._id);

    res.status(200).json({
      success: true,
      message: 'Developer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user details
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
