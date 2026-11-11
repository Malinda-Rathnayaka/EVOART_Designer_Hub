const express = require('express');
const router = express.Router();
const {
  awardProject,
  getAdminAssignments,
  getDesignerAssignments,
  getAssignmentById,
  cancelAssignmentController,
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Award winning bid
router.post('/award', authorize('admin'), awardProject);

// Admin view all assignments
router.get('/admin', authorize('admin'), getAdminAssignments);

// Designer view awarded assignments
router.get('/my-assignments', authorize('designer'), getDesignerAssignments);

// View specific assignment (ownership enforced)
router.get('/:id', getAssignmentById);

// Admin cancel assignment formally
router.post('/:id/cancel', authorize('admin'), cancelAssignmentController);

module.exports = router;
