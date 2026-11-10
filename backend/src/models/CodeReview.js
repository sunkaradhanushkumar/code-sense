const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['bug', 'security', 'performance', 'style', 'best-practice'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info'],
      required: true,
    },
    title: { type: String, required: true },
    line: { type: Number, default: 1 },
    description: { type: String, required: true },
    beginnerExplanation: { type: String, default: '' },
    suggestion: { type: String, required: true },
    codeSnippet: { type: String, default: '' },
    fixedSnippet: { type: String, default: '' },
  },
  { _id: false }
);

const codeReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.Mixed, // Supports ObjectId or fallback string ID
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Code Review',
      trim: true,
    },
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'c', 'cpp'],
      required: [true, 'Programming language is required'],
      index: true,
    },
    sourceCode: {
      type: String,
      required: [true, 'Source code is required'],
    },
    filename: {
      type: String,
      default: '',
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    summary: {
      executiveSummary: { type: String, default: '' },
      scoreVerdict: { type: String, default: 'Good' },
      totalIssues: { type: Number, default: 0 },
      bugsCount: { type: Number, default: 0 },
      securityCount: { type: Number, default: 0 },
      performanceCount: { type: Number, default: 0 },
      styleCount: { type: Number, default: 0 },
    },
    issues: [issueSchema],
    optimizedCode: {
      type: String,
      default: '',
    },
    keyRecommendations: [
      {
        type: String,
      },
    ],
    metrics: {
      linesOfCode: { type: Number, default: 0 },
      cyclomaticComplexityEstimate: { type: String, default: 'Low' },
      maintainabilityIndex: { type: Number, default: 85 },
      executionTimeMs: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast dashboard and history lookups
codeReviewSchema.index({ user: 1, createdAt: -1 });
codeReviewSchema.index({ user: 1, language: 1 });

module.exports = mongoose.model('CodeReview', codeReviewSchema);
