const jwt = require('jsonwebtoken');
const storageService = require('../services/storageService');
const { JWT_SECRET } = require('../middleware/auth');

// Generate JWT token (expires in 7 days)
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Format user object for client (excluding password)
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  userObj.id = userObj._id || userObj.id;
  return userObj;
};

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, defaultLanguage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user already exists
    const existingUser = await storageService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    const newUser = await storageService.createUser({
      name,
      email,
      password,
      role: 'developer',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      preferences: {
        defaultLanguage: defaultLanguage || 'javascript',
        strictness: 'standard',
        showBeginnerExplanations: true,
      },
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in existing user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await storageService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check password
    let isMatch = false;
    if (user.comparePassword) {
      isMatch = await user.comparePassword(password);
    } else {
      const bcrypt = require('bcryptjs');
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await storageService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile & settings
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, defaultLanguage, strictness, showBeginnerExplanations, customApiKey, password } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (password && password.length >= 6) updateData.password = password;

    if (email && email.trim()) {
      const normalizedEmail = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.',
        });
      }

      const existingUser = await storageService.findUserByEmail(normalizedEmail);
      if (
        existingUser &&
        existingUser.id?.toString() !== req.user.id.toString() &&
        existingUser._id?.toString() !== req.user.id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: 'This email address is already in use by another account.',
        });
      }
      updateData.email = normalizedEmail;
    }

    const user = await storageService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const currentPreferences = user.preferences || {};
    updateData.preferences = {
      ...currentPreferences,
      ...(defaultLanguage && { defaultLanguage }),
      ...(strictness && { strictness }),
      ...(showBeginnerExplanations !== undefined && { showBeginnerExplanations }),
      ...(customApiKey !== undefined && { customApiKey }),
    };

    const updatedUser = await storageService.updateUser(req.user.id, updateData);

    res.status(200).json({
      success: true,
      message: 'Profile settings updated successfully.',
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
