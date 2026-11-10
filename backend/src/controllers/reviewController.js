const path = require('path');
const storageService = require('../services/storageService');
const { analyzeCode } = require('../services/aiReviewService');

// Map file extensions to supported programming languages
const EXTENSION_MAP = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'javascript',
  '.tsx': 'javascript',
  '.mjs': 'javascript',
  '.py': 'python',
  '.java': 'java',
  '.c': 'c',
  '.h': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.hpp': 'cpp',
};

const VALID_LANGUAGES = ['javascript', 'python', 'java', 'c', 'cpp'];

/**
 * Analyze Code (via paste or uploaded file)
 * POST /api/reviews/analyze
 */
const analyzeCodeHandler = async (req, res, next) => {
  try {
    let sourceCode = req.body.code;
    let language = (req.body.language || '').toLowerCase();
    let filename = '';

    // If a file was uploaded via multipart/form-data
    if (req.file) {
      filename = req.file.originalname;
      sourceCode = req.file.buffer.toString('utf-8');

      const ext = path.extname(filename).toLowerCase();
      if (!language && EXTENSION_MAP[ext]) {
        language = EXTENSION_MAP[ext];
      }
    }

    if (!sourceCode || !sourceCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Source code is required. Please paste code or upload a source file.',
      });
    }

    // Default to javascript if unspecified or map invalid
    if (!VALID_LANGUAGES.includes(language)) {
      language = 'javascript';
    }

    // Check custom API key from authenticated user preferences if present
    let customApiKey = '';
    if (req.user) {
      const user = await storageService.findUserById(req.user.id);
      if (user && user.preferences && user.preferences.customApiKey) {
        customApiKey = user.preferences.customApiKey;
      }
    }

    const title =
      req.body.title ||
      filename ||
      `${language.toUpperCase()} Analysis - ${new Date().toLocaleDateString()}`;

    // Perform AI analysis
    const analysis = await analyzeCode(sourceCode, language, {
      title,
      strictness: req.body.strictness || 'standard',
      customApiKey,
    });

    // Structure complete review object
    const reviewData = {
      user: req.user ? req.user.id : 'guest-user',
      title,
      language,
      sourceCode,
      filename,
      qualityScore: analysis.qualityScore,
      summary: analysis.summary,
      issues: analysis.issues,
      optimizedCode: analysis.optimizedCode,
      keyRecommendations: analysis.keyRecommendations,
      metrics: analysis.metrics,
    };

    // Save to database if user is authenticated
    let savedReview = reviewData;
    if (req.user) {
      savedReview = await storageService.createReview(reviewData);
    } else {
      savedReview._id = 'guest-rev-' + Date.now();
      savedReview.createdAt = new Date();
    }

    res.status(200).json({
      success: true,
      message: 'Code analysis completed successfully.',
      data: savedReview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reviews for the current user
 * GET /api/reviews
 */
const getReviewsHandler = async (req, res, next) => {
  try {
    const { language, search } = req.query;
    const reviews = await storageService.getReviewsByUser(req.user.id, {
      language,
      search,
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single review by ID (Ownership verified)
 * GET /api/reviews/:id
 */
const getReviewByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await storageService.getReviewById(id, req.user ? req.user.id : null);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Code review record not found.',
      });
    }

    if (review === 'FORBIDDEN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this review.',
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete review by ID (Ownership verified)
 * DELETE /api/reviews/:id
 */
const deleteReviewHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await storageService.deleteReview(id, req.user.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Review record not found.',
      });
    }

    if (result === 'FORBIDDEN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot delete reviews belonging to other users.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard statistics for current user
 * GET /api/reviews/stats
 */
const getStatsHandler = async (req, res, next) => {
  try {
    const stats = await storageService.getUserStats(req.user.id);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeCodeHandler,
  getReviewsHandler,
  getReviewByIdHandler,
  deleteReviewHandler,
  getStatsHandler,
};
