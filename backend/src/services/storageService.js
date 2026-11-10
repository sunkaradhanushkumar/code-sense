const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const CodeReview = require('../models/CodeReview');
const { isMongoConnected } = require('../config/db');

// In-Memory fallback store used when MongoDB is not connected
const memoryStore = {
  users: [],
  reviews: [],
};

// Seed default test user for fallback evaluation
const initSeedUser = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const seedUserId = 'seed-user-101';
  
  const seedUserData = {
    _id: seedUserId,
    id: seedUserId,
    name: 'Alex Rivera',
    email: 'alex.dev@codesense.ai',
    password: hashedPassword,
    role: 'developer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    preferences: {
      defaultLanguage: 'javascript',
      strictness: 'standard',
      showBeginnerExplanations: true,
      customApiKey: '',
    },
    createdAt: new Date('2026-01-15T08:00:00Z'),
  };

  memoryStore.users = [seedUserData];

  // Seed sample reviews for dashboard stats
  const sampleReviews = [
    {
      _id: 'rev-001',
      id: 'rev-001',
      user: seedUserId,
      title: 'Auth Middleware Review',
      language: 'javascript',
      sourceCode: `const jwt = require('jsonwebtoken');\n\nfunction authenticate(req, res, next) {\n  var token = req.headers['authorization'];\n  if (token == null) return res.sendStatus(401);\n  eval(req.body.customCode);\n  next();\n}`,
      filename: 'authMiddleware.js',
      qualityScore: 42,
      summary: {
        executiveSummary: 'Critical security flaw detected with eval() and legacy variable declarations.',
        scoreVerdict: 'Critical Issues',
        totalIssues: 3,
        bugsCount: 1,
        securityCount: 1,
        performanceCount: 0,
        styleCount: 1,
      },
      issues: [
        {
          id: 'iss-1',
          type: 'security',
          severity: 'critical',
          title: 'Dangerous Use of eval()',
          line: 6,
          description: 'eval() executes arbitrary code strings with elevated privileges, leading to Remote Code Execution (RCE).',
          beginnerExplanation: 'eval() is dangerous because it executes any incoming text directly as JavaScript code. An attacker could take over the server.',
          suggestion: 'Remove eval() completely and use secure deterministic logic.',
          codeSnippet: 'eval(req.body.customCode);',
          fixedSnippet: '// Removed dangerous eval invocation',
        },
        {
          id: 'iss-2',
          type: 'bug',
          severity: 'medium',
          title: 'Loose Equality Operator (==) Used',
          line: 5,
          description: 'Using `==` triggers loose type coercion. Use `===` for strict comparison.',
          beginnerExplanation: 'In JavaScript, == can give surprising results because it converts types automatically. === checks both value and type.',
          suggestion: 'Replace `==` with `===`.',
          codeSnippet: 'if (token == null)',
          fixedSnippet: 'if (token === null || token === undefined)',
        },
      ],
      optimizedCode: `/**\n * Optimized by CodeSense AI\n */\nconst jwt = require('jsonwebtoken');\n\nfunction authenticate(req, res, next) {\n  const authHeader = req.headers['authorization'];\n  if (!authHeader || !authHeader.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Unauthorized' });\n  }\n  const token = authHeader.split(' ')[1];\n  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {\n    if (err) return res.status(403).json({ error: 'Forbidden' });\n    req.user = user;\n    next();\n  });\n}`,
      keyRecommendations: [
        'Eliminate dynamic evaluation (eval) to protect against RCE attacks.',
        'Adopt standard Bearer token schema with strict error responses.',
      ],
      metrics: {
        linesOfCode: 8,
        cyclomaticComplexityEstimate: 'Low',
        maintainabilityIndex: 45,
        executionTimeMs: 420,
      },
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      _id: 'rev-002',
      id: 'rev-002',
      user: seedUserId,
      title: 'Data Ingestion Processor',
      language: 'python',
      sourceCode: `def process_records(records=[]):\n    try:\n        for r in records:\n            print(r['id'])\n    except:\n        pass`,
      filename: 'processor.py',
      qualityScore: 68,
      summary: {
        executiveSummary: 'Detected mutable default parameter bug and bare except swallowing exceptions.',
        scoreVerdict: 'Needs Work',
        totalIssues: 2,
        bugsCount: 2,
        securityCount: 0,
        performanceCount: 0,
        styleCount: 0,
      },
      issues: [
        {
          id: 'iss-1',
          type: 'bug',
          severity: 'high',
          title: 'Mutable Default Argument in Function Definition',
          line: 1,
          description: 'Python initializes default arguments once at definition time. A mutable list is shared across invocations.',
          beginnerExplanation: 'The default empty list [] will remember items added to it in future calls, causing hard-to-find bugs.',
          suggestion: 'Default to None and initialize empty list inside the function.',
          codeSnippet: 'def process_records(records=[]):',
          fixedSnippet: 'def process_records(records=None):\n    if records is None:\n        records = []',
        },
      ],
      optimizedCode: `def process_records(records=None):\n    if records is None:\n        records = []\n    for r in records:\n        try:\n            print(r['id'])\n        except KeyError as e:\n            print(f"Missing key in record: {e}")`,
      keyRecommendations: [
        'Use None as default parameter to avoid cross-call state pollution.',
        'Catch specific exceptions instead of using bare except: pass.',
      ],
      metrics: {
        linesOfCode: 7,
        cyclomaticComplexityEstimate: 'Low',
        maintainabilityIndex: 75,
        executionTimeMs: 350,
      },
      createdAt: new Date(Date.now() - 86400000),
    },
  ];

  memoryStore.reviews = [...sampleReviews];

  // If MongoDB is connected, also ensure seed user exists in MongoDB
  try {
    if (isMongoConnected()) {
      const existing = await User.findOne({ email: 'alex.dev@codesense.ai' });
      if (!existing) {
        await User.create({
          ...seedUserData,
          _id: undefined, // Let MongoDB assign or keep
        });
      }
    }
  } catch (err) {
    // Ignore seeding error if already initialized
  }
};

initSeedUser();

// Storage Service API
const storageService = {
  // USER METHODS
  async findUserByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongoConnected()) {
      const mongoUser = await User.findOne({ email: cleanEmail }).select('+password');
      if (mongoUser) return mongoUser;
    }
    return memoryStore.users.find((u) => u.email === cleanEmail) || null;
  },

  async findUserById(id) {
    if (isMongoConnected()) {
      try {
        const mongoUser = await User.findById(id);
        if (mongoUser) return mongoUser;
      } catch (e) {
        // ID might be non-ObjectId format (e.g. seed-user-101)
      }
    }
    return memoryStore.users.find((u) => (u._id && u._id.toString() === id.toString()) || (u.id && u.id.toString() === id.toString())) || null;
  },

  async createUser(userData) {
    if (isMongoConnected()) {
      const newUser = new User(userData);
      return await newUser.save();
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const id = uuidv4();
    const newUser = {
      _id: id,
      id,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: hashedPassword,
      role: userData.role || 'developer',
      avatar: userData.avatar || '',
      preferences: {
        defaultLanguage: 'javascript',
        strictness: 'standard',
        showBeginnerExplanations: true,
        customApiKey: '',
        ...userData.preferences,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.users.push(newUser);
    return newUser;
  },

  async updateUser(id, updateData) {
    if (isMongoConnected()) {
      return await User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    }
    const userIndex = memoryStore.users.findIndex(
      (u) => (u._id && u._id.toString() === id.toString()) || (u.id && u.id.toString() === id.toString())
    );
    if (userIndex === -1) return null;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    memoryStore.users[userIndex] = {
      ...memoryStore.users[userIndex],
      ...updateData,
      updatedAt: new Date(),
    };
    return memoryStore.users[userIndex];
  },

  // CODE REVIEW METHODS
  async createReview(reviewData) {
    if (isMongoConnected()) {
      const review = new CodeReview(reviewData);
      return await review.save();
    }
    const id = 'rev-' + uuidv4().substring(0, 8);
    const newReview = {
      _id: id,
      id,
      ...reviewData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.reviews.unshift(newReview);
    return newReview;
  },

  async getReviewsByUser(userId, filters = {}) {
    if (isMongoConnected()) {
      const query = { user: userId };
      if (filters.language && filters.language !== 'all') {
        query.language = filters.language;
      }
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { filename: { $regex: filters.search, $options: 'i' } },
        ];
      }
      return await CodeReview.find(query).sort({ createdAt: -1 });
    }

    let results = memoryStore.reviews.filter((r) => r.user.toString() === userId.toString());

    if (filters.language && filters.language !== 'all') {
      results = results.filter((r) => r.language === filters.language);
    }

    if (filters.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(
        (r) =>
          (r.title && r.title.toLowerCase().includes(s)) ||
          (r.filename && r.filename.toLowerCase().includes(s))
      );
    }

    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getReviewById(id, userId) {
    if (isMongoConnected()) {
      const review = await CodeReview.findById(id);
      if (!review) return null;
      if (userId && review.user.toString() !== userId.toString()) {
        return 'FORBIDDEN';
      }
      return review;
    }

    const review = memoryStore.reviews.find(
      (r) => (r._id && r._id.toString() === id.toString()) || (r.id && r.id.toString() === id.toString())
    );
    if (!review) return null;
    if (userId && review.user.toString() !== userId.toString()) {
      return 'FORBIDDEN';
    }
    return review;
  },

  async deleteReview(id, userId) {
    if (isMongoConnected()) {
      const review = await CodeReview.findById(id);
      if (!review) return null;
      if (review.user.toString() !== userId.toString()) {
        return 'FORBIDDEN';
      }
      await CodeReview.findByIdAndDelete(id);
      return true;
    }

    const index = memoryStore.reviews.findIndex(
      (r) => (r._id && r._id.toString() === id.toString()) || (r.id && r.id.toString() === id.toString())
    );
    if (index === -1) return null;
    if (memoryStore.reviews[index].user.toString() !== userId.toString()) {
      return 'FORBIDDEN';
    }
    memoryStore.reviews.splice(index, 1);
    return true;
  },

  async getUserStats(userId) {
    const reviews = await this.getReviewsByUser(userId);

    const totalReviews = reviews.length;
    let totalScore = 0;
    let totalBugs = 0;
    let totalSecurity = 0;
    let totalPerformance = 0;
    let totalStyle = 0;

    const languageCounts = {
      javascript: 0,
      python: 0,
      java: 0,
      c: 0,
      cpp: 0,
    };

    reviews.forEach((r) => {
      totalScore += r.qualityScore || 0;
      totalBugs += (r.summary && r.summary.bugsCount) || 0;
      totalSecurity += (r.summary && r.summary.securityCount) || 0;
      totalPerformance += (r.summary && r.summary.performanceCount) || 0;
      totalStyle += (r.summary && r.summary.styleCount) || 0;
      if (languageCounts[r.language] !== undefined) {
        languageCounts[r.language]++;
      }
    });

    const averageQualityScore = totalReviews > 0 ? Math.round(totalScore / totalReviews) : 0;

    // Timeline data (last 7 reviews or recent trends)
    const scoreTrend = reviews.slice(0, 10).reverse().map((r) => ({
      id: r._id || r.id,
      title: r.title,
      score: r.qualityScore,
      date: r.createdAt,
      language: r.language,
    }));

    return {
      totalReviews,
      averageQualityScore,
      totalBugs,
      totalSecurity,
      totalPerformance,
      totalStyle,
      languageCounts,
      scoreTrend,
      recentReviews: reviews.slice(0, 5),
    };
  },
};

module.exports = storageService;
