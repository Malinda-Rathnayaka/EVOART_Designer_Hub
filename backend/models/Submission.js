const mongoose = require('mongoose');

const submissionFileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Submission must belong to an assignment'],
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Submission must reference a project'],
      index: true,
    },
    designer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Designer',
      required: [true, 'Submission must reference the designer'],
      index: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    files: {
      type: [submissionFileSchema],
      validate: [
        function (val) {
          return val && val.length > 0;
        },
        'At least one deliverable file must be uploaded',
      ],
    },
    comments: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['submitted', 'approved', 'revision_requested'],
      default: 'submitted',
    },
    adminFeedback: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Submission', submissionSchema);
