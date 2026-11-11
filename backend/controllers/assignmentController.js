const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const {
  awardAssignment,
  cancelAssignment,
  getDesignerActiveCount,
} = require('../services/assignmentService');

// @desc    Admin awards project assignment to winning bidder
// @route   POST /api/assignments/award
// @access  Private (Admin only)
const awardProject = async (req, res, next) => {
  try {
    const { projectId, bidId, adminNotes } = req.body;

    if (!projectId || !bidId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and Bid ID are required to award an assignment',
      });
    }

    const assignment = await awardAssignment({
      projectId,
      bidId,
      adminNotes,
    });

    const populated = await Assignment.findById(assignment._id)
      .populate('project')
      .populate('designer', 'name email')
      .populate('winningBid');

    res.status(201).json({
      success: true,
      message: 'Project assignment successfully awarded',
      data: populated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get assignments for admin (all assignments)
// @route   GET /api/assignments/admin
// @access  Private (Admin only)
const getAdminAssignments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const assignments = await Assignment.find(filter)
      .populate('project')
      .populate('designer', 'name email bio skills')
      .populate('winningBid')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current designer's awarded assignments
// @route   GET /api/assignments/my-assignments
// @access  Private (Designer only)
const getDesignerAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ designer: req.user._id })
      .populate('project')
      .populate('winningBid')
      .sort({ updatedAt: -1 });

    const activeCount = await getDesignerActiveCount(req.user._id);

    res.json({
      success: true,
      count: assignments.length,
      activeAssignmentsCount: activeCount,
      maxAllowedAssignments: 3,
      hasReachedLimit: activeCount >= 3,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignment by ID (with ownership check)
// @route   GET /api/assignments/:id
// @access  Private
const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('project')
      .populate('designer', 'name email bio skills')
      .populate('winningBid');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Role check: Designer can only view their own assignment
    if (
      req.user.role === 'designer' &&
      assignment.designer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view this assignment',
      });
    }

    // Include submissions history
    const submissions = await Submission.find({
      assignment: assignment._id,
    }).sort({ version: 1 });

    res.json({
      success: true,
      data: {
        ...assignment.toObject(),
        submissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin formally cancels an assignment (releases slot)
// @route   POST /api/assignments/:id/cancel
// @access  Private (Admin only)
const cancelAssignmentController = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const assignment = await cancelAssignment({
      assignmentId: req.params.id,
      adminId: req.user._id,
      reason,
    });

    res.json({
      success: true,
      message: 'Assignment has been formally cancelled and the designer slot released.',
      data: assignment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  awardProject,
  getAdminAssignments,
  getDesignerAssignments,
  getAssignmentById,
  cancelAssignmentController,
};
