const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error(
      'Server configuration error: JWT_SECRET is missing from the .env file. Please configure JWT_SECRET in your .env file.'
    );
  }

  return jwt.sign(
    { id },
    jwtSecret,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

module.exports = generateToken;
