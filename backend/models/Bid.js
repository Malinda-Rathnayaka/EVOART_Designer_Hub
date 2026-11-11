const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Bid must belong to a project'],
      index: true,
    },
    designer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Designer',
      required: [true, 'Bid must belong to a designer'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a bid amount'],
      min: [1, 'Bid amount must be at least 1'],
    },
    proposalText: {
      type: String,
      trim: true,
      default: '',
    },
    deliveryDays: {
      type: Number,
      default: 3,
      min: [1, 'Estimated delivery time must be at least 1 day'],
    },
    status: {
      type: String,
      enum: ['submitted', 'accepted', 'rejected', 'withdrawn'],
      default: 'submitted',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bids from the same designer on the same project
bidSchema.index({ project: 1, designer: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);
