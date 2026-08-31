const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignDeveloper,
  removeDeveloper,
  getAdminDashboardStats,
  getDeveloperDashboardStats,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

// Dashboard statistics
router.get('/admin/dashboard-stats', protect, authorize('admin'), getAdminDashboardStats);
router.get('/developer/dashboard-stats', protect, authorize('developer'), getDeveloperDashboardStats);

// Main project CRUD
router
  .route('/')
  .get(protect, getAllProjects)
  .post(protect, authorize('admin'), createProject);

router
  .route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorize('admin'), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

// Developer assignment to project
router.post('/:id/developers', protect, authorize('admin'), assignDeveloper);
router.delete(
  '/:id/developers/:developerId',
  protect,
  authorize('admin'),
  removeDeveloper
);

module.exports = router;
