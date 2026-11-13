const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const Submission = require('../models/Submission');
const User = require('../models/User');
const {
  uploadDeliverableFile,
  getGoogleDriveConfig,
} = require('./googleDriveService');

const MAX_ACTIVE_ASSIGNMENTS = 3;
const ACTIVE_STATUSES = ['in_progress', 'under_review', 'revision_requested'];

/**
 * Checks if a designer is eligible for a new assignment based on the 3-active-assignment limit.
 */
const getDesignerActiveCount = async (designerId) => {
  return await Assignment.countDocuments({
    designer: designerId,
    status: { $in: ACTIVE_STATUSES },
  });
};

/**
 * Validates whether the designer has reached their maximum quota
 */
const checkDesignerCapacity = async (designerId) => {
  const activeCount = await getDesignerActiveCount(designerId);
  return {
    allowed: activeCount < MAX_ACTIVE_ASSIGNMENTS,
    activeCount,
    maxLimit: MAX_ACTIVE_ASSIGNMENTS,
    remainingSlots: Math.max(0, MAX_ACTIVE_ASSIGNMENTS - activeCount),
  };
};

/**
 * Awards an assignment to a winning designer for a project.
 * Enforces the strict maximum 3 active assignments rule.
 */
const awardAssignment = async ({ projectId, bidId, adminNotes = '' }) => {
  // Try using transactions if replica set is active; otherwise fall back to atomic sequence
  let session = null;
  const isReplicaSet =
    mongoose.connection.client &&
    mongoose.connection.client.topology &&
    mongoose.connection.client.topology.description &&
    mongoose.connection.client.topology.description.type !== 'Single';

  if (isReplicaSet) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  try {
    // 1. Fetch and validate project
    const project = await Project.findById(projectId).session(session);
    if (!project) {
      throw new Error('Project not found');
    }
    if (project.winningBid || project.status === 'assigned' || project.status === 'completed') {
      throw new Error('This project has already been awarded');
    }

    // 2. Fetch and validate bid
    const bid = await Bid.findById(bidId).populate('designer').session(session);
    if (!bid) {
      throw new Error('Bid not found');
    }
    if (bid.project.toString() !== projectId.toString()) {
      throw new Error('Selected bid does not belong to this project');
    }

    const designerId = bid.designer._id || bid.designer;

    // 3. Enforce 3 active assignments cap strictly
    const activeCount = await Assignment.countDocuments({
      designer: designerId,
      status: { $in: ACTIVE_STATUSES },
    }).session(session);

    if (activeCount >= MAX_ACTIVE_ASSIGNMENTS) {
      throw new Error(
        `Designer has reached the maximum allowed limit of ${MAX_ACTIVE_ASSIGNMENTS} active assignments. They must complete or have existing assignments cancelled before taking on new ones.`
      );
    }

    // 4. Create assignment
    const assignment = new Assignment({
      project: project._id,
      designer: designerId,
      winningBid: bid._id,
      agreedPrice: bid.amount,
      status: 'in_progress',
      adminNotes,
      awardedAt: new Date(),
    });
    await assignment.save({ session });

    // 5. Update Project status
    project.winningBid = bid._id;
    project.winningDesigner = designerId;
    project.status = 'assigned';
    // Bidding is also closed once awarded
    project.biddingStatus = 'closed';
    await project.save({ session });

    // 6. Update Bid status
    bid.status = 'accepted';
    await bid.save({ session });

    // Mark other bids for this project as rejected
    await Bid.updateMany(
      { project: project._id, _id: { $ne: bid._id } },
      { $set: { status: 'rejected' } },
      { session }
    );

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    return assignment;
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};

/**
 * Handles designer uploading design deliverable files
 */
const submitDesignWork = async ({
  assignmentId,
  designerId,
  files,
  comments,
}) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }

  if (assignment.designer.toString() !== designerId.toString()) {
    throw new Error('Unauthorized: You are not assigned to this project');
  }

  if (!['in_progress', 'revision_requested'].includes(assignment.status)) {
    throw new Error(
      `Cannot submit work for an assignment with status: ${assignment.status}`
    );
  }

  if (!files || files.length === 0) {
    throw new Error('At least one deliverable file must be uploaded');
  }

  // Count existing submissions for version number
  const existingSubmissionsCount = await Submission.countDocuments({
    assignment: assignment._id,
  });
  const version = existingSubmissionsCount + 1;

  // Logical Area: Upload deliverable files to Google Drive (if link configured in .env)
  const fileData = [];
  for (const file of files) {
    const uploadedFile = await uploadDeliverableFile(file);
    fileData.push(uploadedFile);
  }

  const driveConfig = getGoogleDriveConfig();

  const submission = new Submission({
    assignment: assignment._id,
    project: assignment.project,
    designer: designerId,
    version,
    files: fileData,
    comments,
    driveFolderUrl: driveConfig.folderLink || '',
    status: 'submitted',
  });
  await submission.save();

  // Note: Uploading does NOT release slot; status moves to under_review
  assignment.status = 'under_review';
  await assignment.save();

  return submission;
};

/**
 * Admin reviews submission: Approve or Request Revision
 */
const reviewSubmission = async ({
  submissionId,
  adminId,
  decision,
  adminFeedback = '',
}) => {
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    throw new Error('Submission not found');
  }

  const assignment = await Assignment.findById(submission.assignment);
  if (!assignment) {
    throw new Error('Associated assignment not found');
  }

  const project = await Project.findById(assignment.project);

  submission.reviewedAt = new Date();
  submission.reviewedBy = adminId;
  submission.adminFeedback = adminFeedback;

  if (decision === 'approve') {
    submission.status = 'approved';
    assignment.status = 'approved';
    assignment.completedAt = new Date();

    if (project) {
      project.status = 'completed';
      await project.save();
    }
  } else if (decision === 'request_revision') {
    submission.status = 'revision_requested';
    assignment.status = 'revision_requested';
  } else {
    throw new Error('Invalid decision. Must be "approve" or "request_revision"');
  }

  await submission.save();
  await assignment.save();

  return { submission, assignment };
};

/**
 * Admin formally cancels an assignment.
 * Releasing the assignment slot.
 */
const cancelAssignment = async ({ assignmentId, adminId, reason = '' }) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }

  if (['approved', 'cancelled'].includes(assignment.status)) {
    throw new Error(
      `Assignment cannot be cancelled because it is already ${assignment.status}`
    );
  }

  assignment.status = 'cancelled';
  assignment.cancelledAt = new Date();
  assignment.cancellationReason = reason;
  await assignment.save();

  // Also update project status to cancelled
  const project = await Project.findById(assignment.project);
  if (project) {
    project.status = 'cancelled';
    await project.save();
  }

  return assignment;
};

module.exports = {
  MAX_ACTIVE_ASSIGNMENTS,
  ACTIVE_STATUSES,
  getDesignerActiveCount,
  checkDesignerCapacity,
  awardAssignment,
  submitDesignWork,
  reviewSubmission,
  cancelAssignment,
};
