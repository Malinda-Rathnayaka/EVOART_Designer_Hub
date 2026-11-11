const Project = require('../models/Project');
const Bid = require('../models/Bid');
const Assignment = require('../models/Assignment');

// @desc    Create a new project with reference files
// @route   POST /api/projects
// @access  Private (Admin only)
const createProject = async (req, res, next) => {
  try {
    const { title, description, category, initialPrice, deadline, biddingStatus } = req.body;

    if (!title || !description || !initialPrice || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, initial price, and deadline',
      });
    }

    if (Number(initialPrice) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Initial price must be greater than 0',
      });
    }

    // Process reference files if uploaded
    const referenceFiles = (req.files || []).map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    }));

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      category: category ? category.trim() : 'General Design',
      initialPrice: Number(initialPrice),
      deadline: new Date(deadline),
      biddingStatus: biddingStatus === 'open' ? 'open' : 'closed',
      status: biddingStatus === 'open' ? 'open_for_bidding' : 'draft',
      referenceFiles,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects (filtered according to role and bid privacy)
// @route   GET /api/projects
// @access  Private (Admin or Designer)
const getProjects = async (req, res, next) => {
  try {
    const { status, biddingStatus, category } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (biddingStatus) filter.biddingStatus = biddingStatus;

    if (req.user.role === 'designer') {
      // Designers see projects that are either open for bidding or assigned to them
      if (!filter.biddingStatus && !filter.status) {
        filter.$or = [
          { biddingStatus: 'open' },
          { winningDesigner: req.user._id },
        ];
      }
    }

    const projects = await Project.find(filter)
      .populate('createdBy', 'name email')
      .populate('winningDesigner', 'name email')
      .sort({ createdAt: -1 });

    // For designers, attach their personal bid if one exists (BID PRIVACY: NEVER EXPOSE OTHERS' BIDS)
    let enrichedProjects = projects.map((p) => p.toObject());

    if (req.user.role === 'designer') {
      const projectIds = projects.map((p) => p._id);
      const myBids = await Bid.find({
        project: { $in: projectIds },
        designer: req.user._id,
      });

      const bidMap = {};
      myBids.forEach((b) => {
        bidMap[b.project.toString()] = b;
      });

      enrichedProjects = enrichedProjects.map((p) => ({
        ...p,
        myBid: bidMap[p._id.toString()] || null,
        hasBid: !!bidMap[p._id.toString()],
      }));
    } else if (req.user.role === 'admin') {
      // For admin, attach bid count
      const projectIds = projects.map((p) => p._id);
      const bidCounts = await Bid.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$project', count: { $sum: 1 } } },
      ]);
      const countMap = {};
      bidCounts.forEach((bc) => {
        countMap[bc._id.toString()] = bc.count;
      });

      enrichedProjects = enrichedProjects.map((p) => ({
        ...p,
        bidCount: countMap[p._id.toString()] || 0,
      }));
    }

    res.json({
      success: true,
      count: enrichedProjects.length,
      data: enrichedProjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('winningDesigner', 'name email')
      .populate('winningBid');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const projectData = project.toObject();

    // If designer, attach only their bid (strict bid privacy)
    if (req.user.role === 'designer') {
      const myBid = await Bid.findOne({
        project: project._id,
        designer: req.user._id,
      });
      projectData.myBid = myBid;
      projectData.hasBid = !!myBid;

      // Check if designer is the awarded winner and fetch assignment if so
      if (
        project.winningDesigner &&
        project.winningDesigner._id.toString() === req.user._id.toString()
      ) {
        const assignment = await Assignment.findOne({ project: project._id });
        projectData.assignment = assignment;
      }
    } else if (req.user.role === 'admin') {
      // Admin gets assignment details if exists
      const assignment = await Assignment.findOne({ project: project._id }).populate(
        'designer',
        'name email'
      );
      projectData.assignment = assignment;

      const bidCount = await Bid.countDocuments({ project: project._id });
      projectData.bidCount = bidCount;
    }

    res.json({
      success: true,
      data: projectData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bidding open/close independently
// @route   PATCH /api/projects/:id/bidding
// @access  Private (Admin only)
const toggleBiddingStatus = async (req, res, next) => {
  try {
    const { biddingStatus } = req.body;

    if (!['open', 'closed'].includes(biddingStatus)) {
      return res.status(400).json({
        success: false,
        message: 'biddingStatus must be "open" or "closed"',
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    project.biddingStatus = biddingStatus;
    if (biddingStatus === 'open' && project.status === 'draft') {
      project.status = 'open_for_bidding';
    } else if (biddingStatus === 'closed' && project.status === 'open_for_bidding') {
      project.status = 'bidding_closed';
    }

    await project.save();

    res.json({
      success: true,
      message: `Bidding is now ${biddingStatus} for this project`,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin only)
const updateProject = async (req, res, next) => {
  try {
    const { title, description, category, initialPrice, deadline } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (category) project.category = category.trim();
    if (initialPrice) {
      if (Number(initialPrice) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Initial price must be greater than 0',
        });
      }
      project.initialPrice = Number(initialPrice);
    }
    if (deadline) project.deadline = new Date(deadline);

    // If additional files were uploaded
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));
      project.referenceFiles.push(...newFiles);
    }

    await project.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.winningBid || project.status === 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a project that has an active assignment awarded. Please cancel the assignment first.',
      });
    }

    await Project.deleteOne({ _id: project._id });
    await Bid.deleteMany({ project: project._id });

    res.json({
      success: true,
      message: 'Project and associated bids deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  toggleBiddingStatus,
  updateProject,
  deleteProject,
};
