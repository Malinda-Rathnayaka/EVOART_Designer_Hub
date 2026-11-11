const Bid = require('../models/Bid');
const Project = require('../models/Project');

// @desc    Submit a new bid on a project
// @route   POST /api/bids
// @access  Private (Designer only)
const submitBid = async (req, res, next) => {
  try {
    const { projectId, amount, proposalText, deliveryDays } = req.body;

    if (!projectId || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and bid amount are required',
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Bid amount must be a positive number',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // 1. Check if bidding is open
    if (project.biddingStatus !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Bidding is currently closed for this project',
      });
    }

    // 2. Validate bid must be LOWER than the initial project price
    if (numericAmount >= project.initialPrice) {
      return res.status(400).json({
        success: false,
        message: `Your bid ($${numericAmount}) must be strictly lower than the initial project price ($${project.initialPrice})`,
      });
    }

    // 3. Check for existing bid by this designer
    const existingBid = await Bid.findOne({
      project: projectId,
      designer: req.user._id,
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a bid for this project. You can update your existing bid instead.',
        bidId: existingBid._id,
      });
    }

    const bid = await Bid.create({
      project: projectId,
      designer: req.user._id,
      amount: numericAmount,
      proposalText: proposalText ? proposalText.trim() : '',
      deliveryDays: Number(deliveryDays) || 3,
      status: 'submitted',
    });

    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      data: bid,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing bid (while bidding is open)
// @route   PUT /api/bids/:id
// @access  Private (Designer only)
const updateBid = async (req, res, next) => {
  try {
    const { amount, proposalText, deliveryDays } = req.body;
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found',
      });
    }

    // Authorization: only the owner of the bid can update it
    if (bid.designer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify another designer’s bid',
      });
    }

    const project = await Project.findById(bid.project);
    if (!project || project.biddingStatus !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update bid: Bidding is closed for this project',
      });
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Bid amount must be a positive number',
        });
      }
      if (numericAmount >= project.initialPrice) {
        return res.status(400).json({
          success: false,
          message: `Your updated bid ($${numericAmount}) must be strictly lower than the initial project price ($${project.initialPrice})`,
        });
      }
      bid.amount = numericAmount;
    }

    if (proposalText !== undefined) bid.proposalText = proposalText.trim();
    if (deliveryDays !== undefined) bid.deliveryDays = Number(deliveryDays);

    await bid.save();

    res.json({
      success: true,
      message: 'Bid updated successfully',
      data: bid,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get designer's own bids
// @route   GET /api/bids/my-bids
// @access  Private (Designer only)
const getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ designer: req.user._id })
      .populate('project', 'title initialPrice deadline status biddingStatus category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bids.length,
      data: bids,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bids for a project (ADMIN ONLY)
// @route   GET /api/bids/project/:projectId
// @access  Private (Admin only)
const getProjectBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ project: req.params.projectId })
      .populate('designer', 'name email bio skills')
      .sort({ amount: 1 }); // Lowest bid first

    res.json({
      success: true,
      count: bids.length,
      data: bids,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single bid by ID (Protected by strict ownership or admin role)
// @route   GET /api/bids/:id
// @access  Private
const getBidById = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('project', 'title initialPrice deadline')
      .populate('designer', 'name email');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found',
      });
    }

    // Bid Privacy Enforcement:
    // If user is a designer, they MUST be the owner of the bid!
    if (
      req.user.role === 'designer' &&
      bid.designer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view another designer’s bid details.',
      });
    }

    res.json({
      success: true,
      data: bid,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitBid,
  updateBid,
  getMyBids,
  getProjectBids,
  getBidById,
};
