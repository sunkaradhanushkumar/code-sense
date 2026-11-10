const express = require('express');
const {
  analyzeCodeHandler,
  getReviewsHandler,
  getReviewByIdHandler,
  deleteReviewHandler,
  getStatsHandler,
} = require('../controllers/reviewController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Code analysis (optionalAuth allows guests to try without logging in, or auto-saves if logged in)
router.post('/analyze', optionalAuth, upload.single('file'), analyzeCodeHandler);

// Protected routes (require valid JWT auth token)
router.get('/', requireAuth, getReviewsHandler);
router.get('/stats', requireAuth, getStatsHandler);
router.get('/:id', optionalAuth, getReviewByIdHandler);
router.delete('/:id', requireAuth, deleteReviewHandler);

module.exports = router;
