const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Assignment must have an associated project'],
      unique: true,
      index: true,
    },
    designer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Designer',
      required: [true, 'Assignment must be awarded to a designer'],
      index: true,
    },
    winningBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      required: [true, 'Assignment must reference the winning bid'],
    },
    agreedPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'under_review', 'revision_requested', 'approved', 'cancelled'],
      default: 'in_progress',
      index: true,
    },
    awardedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for submissions
assignmentSchema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'assignment',
});

// Helper static to count active assignments for a designer
assignmentSchema.statics.countActiveForDesigner = async function (designerId) {
  return await this.countDocuments({
    designer: designerId,
    status: { $in: ['in_progress', 'under_review', 'revision_requested'] },
  });
};

module.exports = mongoose.model('Assignment', assignmentSchema);
