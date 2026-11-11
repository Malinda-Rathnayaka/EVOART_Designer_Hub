const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getSubmissions,
  reviewSubmissionController,
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSubmissions } = require('../middleware/uploadMiddleware');

router.use(protect);

// Designer uploads deliverables
router.post(
  '/assignment/:assignmentId',
  authorize('designer'),
  uploadSubmissions.array('files', 10),
  createSubmission
);

// Get submissions for assignment (Admin or assigned Designer)
router.get('/assignment/:assignmentId', getSubmissions);

// Admin review submission (Approve / Request Revision)
router.post('/:id/review', authorize('admin'), reviewSubmissionController);

module.exports = router;
