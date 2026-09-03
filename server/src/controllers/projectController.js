const Project = require('../models/Project');
const Phase = require('../models/Phase');
const User = require('../models/User');

// Helper to compute progress for a list of projects
const enrichProjectsWithProgress = async (projects, userId = null, userRole = 'admin') => {
  return await Promise.all(
    projects.map(async (project) => {
      const projObj = project.toObject();

      // Overall Project Phase Metrics
      const totalPhases = await Phase.countDocuments({ projectId: project._id });
      const completedPhases = await Phase.countDocuments({
        projectId: project._id,
        completed: true,
      });
      const overallProgress =
        totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

      projObj.totalPhases = totalPhases;
      projObj.completedPhases = completedPhases;
      projObj.totalTasks = totalPhases; // Keep backwards compatible alias
      projObj.completedTasks = completedPhases;
      projObj.overallProgress = overallProgress;
      projObj.developerCount = project.developers ? project.developers.length : 0;
      projObj.projectType =
        project.projectType ||
        (project.developers && project.developers.length > 1 ? 'Group' : 'Standalone');

      // If requested by a developer, attach their personal progress
      if (userRole === 'developer' && userId) {
        const myTotalPhases = await Phase.countDocuments({
          projectId: project._id,
          developerId: userId,
        });
        const myCompletedPhases = await Phase.countDocuments({
          projectId: project._id,
          developerId: userId,
          completed: true,
        });
        const myProgress =
          myTotalPhases > 0
            ? Math.round((myCompletedPhases / myTotalPhases) * 100)
            : 0;

        projObj.myTotalPhases = myTotalPhases;
        projObj.myCompletedPhases = myCompletedPhases;
        projObj.myTotalTasks = myTotalPhases;
        projObj.myCompletedTasks = myCompletedPhases;
        projObj.myPendingTasks = myTotalPhases - myCompletedPhases;
        projObj.myProgress = myProgress;
      }

      return projObj;
    })
  );
};

// @desc    Get all projects (Admin: all, Developer: assigned only)
// @route   GET /api/projects
// @access  Private
exports.getAllProjects = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'developer') {
      query.developers = req.user._id;
    }

    const projects = await Project.find(query)
      .populate('developers', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const enriched = await enrichProjectsWithProgress(
      projects,
      req.user._id,
      req.user.role
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

// @desc    Get single project by ID with full developer metrics
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('developers', 'name email role createdAt')
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // If developer, verify assignment
    if (req.user.role === 'developer') {
      const isAssigned = project.developers.some(
        (dev) => dev._id.toString() === req.user._id.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not assigned to this project',
        });
      }
    }

    const projObj = project.toObject();

    // Total Project metrics
    const totalPhases = await Phase.countDocuments({ projectId: project._id });
    const completedPhases = await Phase.countDocuments({
      projectId: project._id,
      completed: true,
    });
    const overallProgress =
      totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

    projObj.totalPhases = totalPhases;
    projObj.completedPhases = completedPhases;
    projObj.totalTasks = totalPhases;
    projObj.completedTasks = completedPhases;
    projObj.overallProgress = overallProgress;
    projObj.projectType =
      project.projectType ||
      (project.developers && project.developers.length > 1 ? 'Group' : 'Standalone');

    // Developer breakdown stats
    const developerStats = await Promise.all(
      project.developers.map(async (dev) => {
        const devTotalPhases = await Phase.countDocuments({
          projectId: project._id,
          developerId: dev._id,
        });
        const devCompletedPhases = await Phase.countDocuments({
          projectId: project._id,
          developerId: dev._id,
          completed: true,
        });
        const devProgress =
          devTotalPhases > 0
            ? Math.round((devCompletedPhases / devTotalPhases) * 100)
            : 0;

        return {
          developer: {
            _id: dev._id,
            name: dev.name,
            email: dev.email,
            role: dev.role,
            createdAt: dev.createdAt,
          },
          phasesCount: devTotalPhases,
          totalPhases: devTotalPhases,
          completedPhases: devCompletedPhases,
          totalTasks: devTotalPhases,
          completedTasks: devCompletedPhases,
          pendingTasks: devTotalPhases - devCompletedPhases,
          progress: devProgress,
        };
      })
    );

    projObj.developerStats = developerStats;

    // Attach current user's personal progress if developer
    if (req.user.role === 'developer') {
      const myStat = developerStats.find(
        (s) => s.developer._id.toString() === req.user._id.toString()
      );
      projObj.myProgress = myStat ? myStat.progress : 0;
      projObj.myTotalPhases = myStat ? myStat.totalPhases : 0;
      projObj.myCompletedPhases = myStat ? myStat.completedPhases : 0;
      projObj.myTotalTasks = myStat ? myStat.totalTasks : 0;
      projObj.myCompletedTasks = myStat ? myStat.completedTasks : 0;
      projObj.myPendingTasks = myStat ? myStat.pendingTasks : 0;
    }

    res.status(200).json({
      success: true,
      data: projObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin only)
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, status, projectType, category, techStack, developers } = req.body;

    const devs = Array.isArray(developers) ? developers : [];
    const determinedType =
      projectType || (devs.length > 1 ? 'Group' : 'Standalone');

    const project = await Project.create({
      name,
      description,
      status: status || 'Planning',
      projectType: determinedType,
      category: category || 'Web App',
      techStack: Array.isArray(techStack) ? techStack : [],
      developers: devs,
      createdBy: req.user._id,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('developers', 'name email role')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Admin only)
exports.updateProject = async (req, res, next) => {
  try {
    const { name, description, status, projectType, category, techStack, developers } = req.body;

    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (projectType) project.projectType = projectType;
    if (category) project.category = category;
    if (techStack !== undefined) project.techStack = Array.isArray(techStack) ? techStack : [];
    if (developers !== undefined) {
      project.developers = developers;
      if (!projectType && developers.length > 1) {
        project.projectType = 'Group';
      }
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('developers', 'name email role')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project (and associated phases)
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Cascade delete phases in this project
    await Phase.deleteMany({ projectId: project._id });
    await Project.findByIdAndDelete(project._id);

    res.status(200).json({
      success: true,
      message: 'Project and all associated phases deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign developer to a project
// @route   POST /api/projects/:id/developers
// @access  Private (Admin only)
exports.assignDeveloper = async (req, res, next) => {
  try {
    const { developerId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const developer = await User.findById(developerId);
    if (!developer || developer.role !== 'developer') {
      return res.status(400).json({ success: false, message: 'Valid developer ID required' });
    }

    const alreadyAssigned = project.developers.some(
      (id) => id.toString() === developerId
    );
    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: 'Developer is already assigned to this project',
      });
    }

    project.developers.push(developerId);
    if (project.developers.length > 1 && project.projectType !== 'Group') {
      project.projectType = 'Group';
    }
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('developers', 'name email role')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: `${developer.name} assigned to project successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove developer from a project
// @route   DELETE /api/projects/:id/developers/:developerId
// @access  Private (Admin only)
exports.removeDeveloper = async (req, res, next) => {
  try {
    const { id, developerId } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.developers = project.developers.filter(
      (devId) => devId.toString() !== developerId
    );
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('developers', 'name email role')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Developer removed from project successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/projects/admin/dashboard-stats
// @access  Private (Admin only)
exports.getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'In Progress' });
    const planningProjects = await Project.countDocuments({ status: 'Planning' });
    const completedProjects = await Project.countDocuments({ status: 'Completed' });
    const totalDevelopers = await User.countDocuments({ role: 'developer' });

    const allProjectsForStats = await Project.find({}, 'projectType developers');
    let standaloneProjects = 0;
    let groupProjects = 0;
    allProjectsForStats.forEach((p) => {
      const type =
        p.projectType ||
        (p.developers && p.developers.length > 1 ? 'Group' : 'Standalone');
      if (type === 'Group') {
        groupProjects++;
      } else {
        standaloneProjects++;
      }
    });

    const recentProjects = await Project.find()
      .populate('developers', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    const enrichedRecent = await enrichProjectsWithProgress(recentProjects);

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        planningProjects,
        completedProjects,
        standaloneProjects,
        groupProjects,
        totalDevelopers,
        recentProjects: enrichedRecent,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Developer Dashboard Stats
// @route   GET /api/projects/developer/dashboard-stats
// @access  Private (Developer only)
exports.getDeveloperDashboardStats = async (req, res, next) => {
  try {
    const myProjects = await Project.find({ developers: req.user._id })
      .populate('developers', 'name email')
      .sort({ createdAt: -1 });

    const totalMyPhases = await Phase.countDocuments({ developerId: req.user._id });
    const completedMyPhases = await Phase.countDocuments({
      developerId: req.user._id,
      completed: true,
    });
    const pendingMyPhases = totalMyPhases - completedMyPhases;

    const enrichedProjects = await enrichProjectsWithProgress(
      myProjects,
      req.user._id,
      'developer'
    );

    res.status(200).json({
      success: true,
      data: {
        totalProjects: myProjects.length,
        totalPhases: totalMyPhases,
        completedPhases: completedMyPhases,
        pendingPhases: pendingMyPhases,
        totalTasks: totalMyPhases,
        completedTasks: completedMyPhases,
        pendingTasks: pendingMyPhases,
        myProjects: enrichedProjects,
      },
    });
  } catch (error) {
    next(error);
  }
};
