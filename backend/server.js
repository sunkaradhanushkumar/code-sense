require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route Imports
const authRoutes = require('./src/routes/authRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const healthRoutes = require('./src/routes/healthRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection
connectDB();

// Middleware
app.use(
  cors({
    origin: '*', // Allow development frontend requests
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);

// Welcome / Root Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Code Sense Backend API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile',
      },
      reviews: {
        analyze: 'POST /api/reviews/analyze (supports code snippet or multipart file)',
        list: 'GET /api/reviews',
        stats: 'GET /api/reviews/stats',
        getById: 'GET /api/reviews/:id',
        delete: 'DELETE /api/reviews/:id',
      },
    },
  });
});

// Centralized Error Handling
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 CodeSense AI Server running on port ${PORT}`);
    console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 AI Engine: Ready for JavaScript, Python, Java & C++`);
    console.log(`====================================================`);
  });
}

module.exports = app;
