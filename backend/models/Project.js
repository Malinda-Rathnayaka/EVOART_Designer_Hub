const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    url: { type: String, default: '' },
    publicId: { type: String, default: null },
    storageType: {
      type: String,
      enum: ['cloudinary', 'local'],
      default: 'local',
    },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a project title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a project description'],
      trim: true,
    },
    category: {
      type: String,
      default: 'General Design',
      trim: true,
    },
    initialPrice: {
      type: Number,
      required: [true, 'Please provide an initial project price'],
      min: [1, 'Initial price must be at least 1'],
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide a project deadline'],
    },
    biddingStatus: {
      type: String,
      enum: ['open', 'closed'],
      default: 'closed',
    },
    status: {
      type: String,
      enum: ['draft', 'open_for_bidding', 'bidding_closed', 'assigned', 'completed', 'cancelled'],
      default: 'draft',
    },
    referenceFiles: [fileSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    winningBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      default: null,
    },
    winningDesigner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Designer',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for bids count
projectSchema.virtual('bids', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'project',
  justOne: false,
});

module.exports = mongoose.model('Project', projectSchema);
