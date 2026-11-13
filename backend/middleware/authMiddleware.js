const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Designer = require('../models/Designer');

// Logical Area 1: Protect routes by verifying JWT token and fetching user from MongoDB
const protect = async (req, res, next) => {
  let token;

  // Logical Area 1a: Extract token from Authorization header or URL query parameter
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    // Allows token via query param for direct secure file preview/download links
    token = req.query.token;
  }

  // Logical Area 1b: Reject request when token is missing
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. No token provided.',
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[CRITICAL SECURITY ERROR] JWT_SECRET is not configured in .env file.');
      return res.status(500).json({
        success: false,
        message: 'Server security error: JWT_SECRET is missing in .env file. Please configure your .env file.',
      });
    }

    // Logical Area 1c: Verify JWT signature and expiration
    const decoded = jwt.verify(token, jwtSecret);

    // Logical Area 1d: Fetch user document from database ('designers' or 'users' collection)
    let user = await Designer.findById(decoded.id).select('-password');
    if (!user) {
      user = await User.findById(decoded.id).select('-password');
    }

    // Logical Area 1e: Verify account still exists in database
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists in the database.',
      });
    }

    // Logical Area 1f: Verify account is not deactivated
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    // Logical Area 1g: Attach database user document to request context
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or expired. Please log in again.',
    });
  }
};

// Logical Area 2: Role-based access control (RBAC) authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
