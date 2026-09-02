const express = require('express');
const router = express.Router();
const {
  getMyPhases,
  getPhasesByProject,
  createPhase,
  bulkCreatePhases,
  updatePhase,
  updatePhaseNotes,
  deletePhase,
  togglePhase,
} = require('../controllers/phaseController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .post(protect, authorize('developer'), createPhase);

router.post('/bulk', protect, authorize('developer'), bulkCreatePhases);

router.get('/my', protect, authorize('developer'), getMyPhases);
router.get('/project/:projectId', protect, getPhasesByProject);

router
  .route('/:id')
  .put(protect, authorize('developer'), updatePhase)
  .delete(protect, authorize('developer'), deletePhase);

router.patch('/:id/toggle', protect, authorize('developer'), togglePhase);
router.patch('/:id/notes', protect, authorize('developer'), updatePhaseNotes);

module.exports = router;
