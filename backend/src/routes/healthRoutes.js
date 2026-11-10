const express = require('express');
const { isMongoConnected } = require('../config/db');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'CodeSense AI',
    timestamp: new Date().toISOString(),
    database: {
      driver: 'Mongoose / MongoDB',
      connected: isMongoConnected(),
      mode: isMongoConnected() ? 'MongoDB Atlas / Local' : 'In-Memory Fallback Active',
    },
    version: '1.0.0',
    aiEngine: {
      geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
      heuristicEngine: 'active',
    },
  });
});

module.exports = router;
