const User = require('../models/User');
const Designer = require('../models/Designer');
const generateToken = require('../utils/generateToken');
const { getDesignerActiveCount } = require('../services/assignmentService');

// @desc    Authenticate user (Designer or Admin) & get JWT token directly from database
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Logical Area 1: Validate input parameters
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Logical Area 2: Normalize email address for database query
    const cleanEmail = email.toLowerCase().trim();

    // Logical Area 3: Fetch credentials from MongoDB database
    // Step 3a: Look up designer in MongoDB 'designers' collection first
    let user = await Designer.findOne({ email: cleanEmail }).select('+password');

    // Step 3b: If not in designers, look up administrator in MongoDB 'users' collection
    if (!user) {
      user = await User.findOne({ email: cleanEmail }).select('+password');
    }

    // Logical Area 4: Verify that the account exists in the database
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Logical Area 5: Check account active status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    // Logical Area 6: Compare provided password with bcrypt hashed password from database
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Logical Area 7: Calculate current active workload for designer from database
    let activeAssignmentsCount = 0;
    if (user.role === 'designer') {
      activeAssignmentsCount = await getDesignerActiveCount(user._id);
    }

    // Logical Area 8: Generate secure JWT session token using database _id
    const token = generateToken(user._id);

    // Logical Area 9: Return authenticated user data and token
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        activeAssignmentsCount,
        maxActiveAssignments: 3,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile fetched from database
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // Logical Area 1: Fetch fresh user document from MongoDB database
    let user = await Designer.findById(req.user._id);
    if (!user) {
      user = await User.findById(req.user._id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database',
      });
    }

    // Logical Area 2: Compute current active assignments count
    let activeAssignmentsCount = 0;
    if (user.role === 'designer') {
      activeAssignmentsCount = await getDesignerActiveCount(user._id);
    }

    // Logical Area 3: Return user profile details
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        isActive: user.isActive,
        activeAssignmentsCount,
        maxActiveAssignments: 3,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe };
