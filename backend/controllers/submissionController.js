const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const {
  submitDesignWork,
  reviewSubmission,
} = require('../services/assignmentService');

// @desc    Designer uploads completed design or revised files
// @route   POST /api/submissions/assignment/:assignmentId
// @access  Private (Designer only)
const createSubmission = async (req, res, next) => {
  try {
    const { comments } = req.body;
    const { assignmentId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one design deliverable file to upload',
      });
    }

    const submission = await submitDesignWork({
      assignmentId,
      designerId: req.user._id,
      files: req.files,
      comments: comments ? comments.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Design files uploaded successfully. Assignment is now under admin review.',
      data: submission,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all submissions for an assignment
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private (Admin or assigned Designer)
const getSubmissions = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Role check: Designer can only view submissions for their own assignment
    if (
      req.user.role === 'designer' &&
      assignment.designer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view submissions for this assignment',
      });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('designer', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ version: 1 });

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin reviews submission: approve or request revisions
// @route   POST /api/submissions/:id/review
// @access  Private (Admin only)
const reviewSubmissionController = async (req, res, next) => {
  try {
    const { decision, adminFeedback } = req.body;
    const submissionId = req.params.id;

    if (!['approve', 'request_revision'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be either "approve" or "request_revision"',
      });
    }

    if (decision === 'request_revision' && (!adminFeedback || !adminFeedback.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide constructive feedback explaining what revisions are needed.',
      });
    }

    const result = await reviewSubmission({
      submissionId,
      adminId: req.user._id,
      decision,
      adminFeedback: adminFeedback ? adminFeedback.trim() : '',
    });

    const isSlotReleased = decision === 'approve';

    res.json({
      success: true,
      message:
        decision === 'approve'
          ? 'Design successfully approved! The project is marked completed and the designer’s assignment slot is now released.'
          : 'Revision requested. The designer has been notified and can submit revised files.',
      slotReleased: isSlotReleased,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSubmission,
  getSubmissions,
  reviewSubmissionController,
};
