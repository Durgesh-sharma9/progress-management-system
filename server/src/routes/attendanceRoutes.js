const express = require('express');
const router = express.Router();
const {
  getWorkspaceConfig,
  updateWorkspaceConfig,
  punchIn,
  punchOut,
  getMyAttendanceToday,
  getMyAttendanceHistory,
  getAdminAttendanceOverview,
  getAdminMonthlyCalendar,
  getHolidays,
  createOrUpdateHoliday,
  deleteHoliday,
  adminManualAttendanceUpdate,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// Public to authenticated users (Admin & Dev)
router.get('/config', protect, getWorkspaceConfig);
router.get('/today', protect, getMyAttendanceToday);
router.post('/punch-in', protect, punchIn);
router.post('/punch-out', protect, punchOut);
router.get('/my-history', protect, getMyAttendanceHistory);
router.get('/holidays', protect, getHolidays);

// Admin-only routes
router.put('/config', protect, authorize('admin'), updateWorkspaceConfig);
router.get('/admin/overview', protect, authorize('admin'), getAdminAttendanceOverview);
router.get('/admin/monthly-calendar', protect, authorize('admin'), getAdminMonthlyCalendar);
router.post('/holidays', protect, authorize('admin'), createOrUpdateHoliday);
router.delete('/holidays/:id', protect, authorize('admin'), deleteHoliday);
router.post('/admin/manual', protect, authorize('admin'), adminManualAttendanceUpdate);

module.exports = router;
