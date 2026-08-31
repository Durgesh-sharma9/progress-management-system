const express = require('express');
const router = express.Router();
const {
  getMyPhases,
  getPhasesByProject,
  createPhase,
  updatePhase,
  deletePhase,
  togglePhase,
} = require('../controllers/phaseController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .post(protect, authorize('developer'), createPhase);

router.get('/my', protect, authorize('developer'), getMyPhases);
router.get('/project/:projectId', protect, getPhasesByProject);

router
  .route('/:id')
  .put(protect, authorize('developer'), updatePhase)
  .delete(protect, authorize('developer'), deletePhase);

router.patch('/:id/toggle', protect, authorize('developer'), togglePhase);

module.exports = router;
