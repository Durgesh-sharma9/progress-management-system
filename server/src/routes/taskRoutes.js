const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTasksByProject,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getTasks);
router.get('/project/:projectId', protect, getTasksByProject);
router.post('/', protect, authorize('developer'), createTask);
router.put('/:id', protect, authorize('developer'), updateTask);
router.patch('/:id/toggle', protect, authorize('developer'), toggleTask);
router.delete('/:id', protect, authorize('developer'), deleteTask);

module.exports = router;
