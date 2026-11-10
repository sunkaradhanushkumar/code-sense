const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'codesense_ai_jwt_super_secure_secret_key_2026_dev_prod_token_sign';

/**
 * Required authentication middleware
 * Expects: Authorization: Bearer <token>
 */
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No valid Bearer token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token. Please log in again.',
        });
      }

      req.user = decoded; // { id, email, role }
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error',
      error: error.message,
    });
  }
};

/**
 * Optional authentication middleware
 * If a token is provided, decodes user and attaches to req.user.
 * If not provided, continues without error.
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (!err && decoded) {
          req.user = decoded;
        }
        next();
      });
    } else {
      next();
    }
  } catch (error) {
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth,
  JWT_SECRET,
};
