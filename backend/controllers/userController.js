const User = require('../models/User');
const Designer = require('../models/Designer');
const Assignment = require('../models/Assignment');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const Submission = require('../models/Submission');
const { ACTIVE_STATUSES } = require('../services/assignmentService');

// @desc    Admin creates a new designer account stored directly in MongoDB database
// @route   POST /api/users/designers
// @access  Private (Admin only)
const createDesigner = async (req, res, next) => {
  try {
    const { name, email, password, bio, skills } = req.body;

    // Logical Area 1: Validate required fields and password length
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Logical Area 2: Normalize email address
    const cleanEmail = email.toLowerCase().trim();

    // Logical Area 3: Check database for existing email in designers or users collection
    const existingDesigner = await Designer.findOne({ email: cleanEmail });
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingDesigner || existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists in the database',
      });
    }

    // Logical Area 4: Parse skills array from incoming payload
    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    // Logical Area 5: Persist designer account directly in MongoDB 'designers' collection
    // (Designer pre-save hook automatically hashes password with bcrypt)
    const designer = await Designer.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'designer',
      bio: bio || '',
      skills: skillsArray,
    });

    // Logical Area 6: Respond with newly created designer record (excluding password)
    res.status(201).json({
      success: true,
      message: 'Designer account created successfully in the database',
      data: {
        _id: designer._id,
        name: designer.name,
        email: designer.email,
        role: designer.role,
        bio: designer.bio,
        skills: designer.skills,
        isActive: designer.isActive,
        activeAssignmentsCount: 0,
        createdAt: designer.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin gets all designer accounts from database with real-time assignment statistics
// @route   GET /api/users/designers
// @access  Private (Admin only)
const getDesigners = async (req, res, next) => {
  try {
    // Logical Area 1: Query all designers from MongoDB 'designers' collection
    const designers = await Designer.find().sort({ createdAt: -1 });

    // Logical Area 2: Aggregate live assignment metrics from MongoDB 'assignments' collection
    const designerStats = await Assignment.aggregate([
      {
        $group: {
          _id: '$designer',
          totalAssignments: { $sum: 1 },
          activeAssignments: {
            $sum: {
              $cond: [{ $in: ['$status', ACTIVE_STATUSES] }, 1, 0],
            },
          },
          completedAssignments: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Logical Area 3: Build mapping table for designer assignment stats
    const statsMap = {};
    designerStats.forEach((stat) => {
      statsMap[stat._id.toString()] = stat;
    });

    // Logical Area 4: Enrich designer records with active counts and quota availability
    const enrichedDesigners = designers.map((d) => {
      const stats = statsMap[d._id.toString()] || {
        totalAssignments: 0,
        activeAssignments: 0,
        completedAssignments: 0,
      };

      return {
        _id: d._id,
        name: d.name,
        email: d.email,
        role: d.role,
        bio: d.bio,
        skills: d.skills,
        isActive: d.isActive,
        activeAssignmentsCount: stats.activeAssignments,
        totalAssignmentsCount: stats.totalAssignments,
        completedAssignmentsCount: stats.completedAssignments,
        isCapacityFull: stats.activeAssignments >= 3,
        remainingSlots: Math.max(0, 3 - stats.activeAssignments),
        createdAt: d.createdAt,
      };
    });

    res.json({
      success: true,
      count: enrichedDesigners.length,
      data: enrichedDesigners,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin updates designer profile/status/password in MongoDB database
// @route   PUT /api/users/designers/:id
// @access  Private (Admin only)
const updateDesigner = async (req, res, next) => {
  try {
    const { name, bio, skills, isActive, password } = req.body;

    // Logical Area 1: Fetch designer record from MongoDB 'designers' collection
    const designer = await Designer.findById(req.params.id);

    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found in database',
      });
    }

    // Logical Area 2: Apply updated fields
    if (name) designer.name = name.trim();
    if (bio !== undefined) designer.bio = bio;
    if (skills !== undefined) {
      designer.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (isActive !== undefined) designer.isActive = isActive;
    // Logical Area 3: Trigger bcrypt hashing on password change
    if (password) designer.password = password;

    // Logical Area 4: Persist changes directly to database
    await designer.save();

    res.json({
      success: true,
      message: 'Designer updated successfully in the database',
      data: {
        _id: designer._id,
        name: designer.name,
        email: designer.email,
        role: designer.role,
        bio: designer.bio,
        skills: designer.skills,
        isActive: designer.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin deletes a designer account and cascades cleanup across database
// @route   DELETE /api/users/designers/:id
// @access  Private (Admin only)
const deleteDesigner = async (req, res, next) => {
  try {
    // Logical Area 1: Locate designer in MongoDB 'designers' collection
    const designer = await Designer.findById(req.params.id);

    if (!designer) {
      return res.status(404).json({
        success: false,
        message: 'Designer not found in database',
      });
    }

    // Logical Area 2: Cascade cleanup — Reset any awarded projects back to open
    await Project.updateMany(
      { winningDesigner: designer._id },
      {
        $set: {
          winningDesigner: null,
          winningBid: null,
          status: 'open_for_bidding',
          biddingStatus: 'open',
        },
      }
    );

    // Logical Area 3: Cascade cleanup — Delete all bids submitted by this designer
    await Bid.deleteMany({ designer: designer._id });

    // Logical Area 4: Cascade cleanup — Delete assignments and submissions
    await Assignment.deleteMany({ designer: designer._id });
    await Submission.deleteMany({ designer: designer._id });

    // Logical Area 5: Delete designer document from MongoDB 'designers' collection
    await Designer.findByIdAndDelete(designer._id);

    // Logical Area 6: Delete any legacy duplicate document in 'users' collection
    await User.findByIdAndDelete(designer._id);

    res.json({
      success: true,
      message: `Designer "${designer.name}" (${designer.email}) was successfully deleted from the database.`,
      deletedId: designer._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDesigner,
  getDesigners,
  updateDesigner,
  deleteDesigner,
};
