const express = require('express');
const router = express.Router();
const {
  getDevelopers,
  createDeveloper,
  deleteDeveloper,
  getUserById,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/developers')
  .get(protect, authorize('admin'), getDevelopers)
  .post(protect, authorize('admin'), createDeveloper);

router.delete('/developers/:id', protect, authorize('admin'), deleteDeveloper);
router.get('/:id', protect, getUserById);

module.exports = router;
