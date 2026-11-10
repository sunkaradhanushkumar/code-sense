# CodeSense AI – Full-Stack AI-Powered Code Review Platform

![CodeSense AI Banner](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80)

**CodeSense AI** is a professional, production-grade full-stack code review and vulnerability analysis platform. Built for modern engineering teams, it conducts automated deep-semantic audits, identifies bugs and OWASP security flaws, computes maintainability scores, and generates production-ready refactored code with beginner-friendly explanations.

---

## 🌟 Key Features

### 💻 Multi-Language Support
- **JavaScript**: ES6+, Node.js, React, async/await anti-patterns, loose equality, and prototype safety.
- **Python**: PEP 8 compliance, mutable default argument traps, bare except clauses, and security leaks.
- **Java**: OOP structure, reference equality (`==` vs `.equals()`), resource leaks, and logging best practices.
- **C++**: Buffer overflow protection (`strcpy`/`sprintf`), RAII memory leaks (`malloc`/`free`), and pointer safety.

### 🔍 Deep AI Code Analysis
- **Bug & Logical Error Detection**: Catches unhandled promises, scope issues, and race conditions.
- **OWASP Security Vulnerability Scanning**: Detects SQL/NoSQL injection, Remote Code Execution (eval), buffer overflows, and hardcoded credentials.
- **Performance Profiling**: Pinpoints algorithmic bottlenecks and inefficient loop constructs.
- **Quality Score & Severity Levels**: Generates a 0–100 Code Health Index with color-coded severity badges (`Critical`, `High`, `Medium`, `Low`, `Info`).
- **Beginner-Friendly Explanations**: Translates technical compiler/linter warnings into clear, jargon-free lessons explaining *why* the issue matters.
- **Production-Ready Refactored Code**: Provides fully optimized, secure replacement code with side-by-side diff comparison and one-click copy.

### 🛠️ Developer-Focused UI/UX
- **Monaco Code Editor**: Integrated with the same engine powering VS Code, supporting dark mode, line numbering, and syntax highlighting.
- **Flexible Code Ingestion**: Paste code directly or upload source files (`.js`, `.py`, `.java`, `.cpp`, `.ts`, `.txt`) up to 2MB.
- **Pre-Loaded Bug Presets**: Instant one-click sample code loaders for all 4 supported languages to test bug discovery right away.
- **Interactive Dashboard**: Real-time stats on total reviews, detected bugs, security flaws, average quality score, language breakdown, and score history.
- **Audit History & Search**: Full search and filter capabilities with MongoDB persistence.
- **Exporting Options**: Download comprehensive review reports in Markdown (`.md`), raw JSON, or refactored code files.

---

## 🏗️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Lucide React, Axios, Canvas Confetti |
| **Backend** | Node.js, Express.js, JWT, bcryptjs, Multer, Morgan, CORS |
| **Database** | MongoDB Atlas / Local with Mongoose ODM + Resilient In-Memory Fallback |
| **AI Engine** | Google Gemini 1.5 Flash API + CodeSense Heuristic Engine |
| **Architecture** | RESTful API, Protected Middleware, Ownership Verification |

---

## 📂 Project Architecture

```
AI code review platform/
├── backend/
│   ├── .env.example              # Environment variables template
│   ├── .env                      # Local environment configuration
│   ├── package.json              # Backend dependencies & test scripts
│   ├── server.js                 # Express server entry point
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # Mongoose MongoDB connection & fallback handler
│   │   │   └── ai.js             # AI client configuration
│   │   ├── controllers/
│   │   │   ├── authController.js # Auth (Register, Login, Me, Profile)
│   │   │   └── reviewController.js # Reviews (Analyze, List, Get, Delete, Stats)
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT verification (requireAuth & optionalAuth)
│   │   │   ├── errorHandler.js   # Centralized error responses
│   │   │   └── upload.js         # Multer file size & extension validator
│   │   ├── models/
│   │   │   ├── CodeReview.js     # Mongoose review model with nested issues
│   │   │   └── User.js           # Mongoose user model with bcrypt hashing
│   │   ├── routes/
│   │   │   ├── authRoutes.js     # /api/auth routes
│   │   │   ├── healthRoutes.js   # /api/health monitoring route
│   │   │   └── reviewRoutes.js   # /api/reviews routes
│   │   └── services/
│   │       ├── aiReviewService.js# Gemini API engine + Heuristic analyzer
│   │       └── storageService.js # Database abstraction layer
│   └── tests/
│       └── api.test.js           # Automated integration test suite
│
├── frontend/
│   ├── index.html                # HTML5 shell with Google Fonts
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite build configuration with proxy
│   ├── tailwind.config.js        # Dark navy developer design system
│   └── src/
│       ├── api/                  # Axios HTTP client & API wrappers
│       ├── components/
│       │   ├── common/           # Navbar, Footer, ProtectedRoute, Badges, Gauges
│       │   ├── dashboard/        # StatCard, QualityChart, RecentReviewsList
│       │   ├── editor/           # MonacoCodeEditor, FileUploader
│       │   └── review/           # IssueCard, CodeDiffViewer, CategoryFilter
│       ├── context/              # AuthContext & ToastContext
│       ├── pages/                # Landing, Login, Register, Dashboard, Workspace, Results, History, Settings
│       ├── App.jsx               # Route definitions
│       └── main.jsx              # React DOM mounting
│
├── API_DOCUMENTATION.md          # Complete REST API reference
├── DEPLOYMENT_GUIDE.md           # Production deployment instructions
└── README.md                     # Documentation
```

---

## ⚡ Quickstart & Installation

### Prerequisites
- **Node.js**: v18.0.0 or later (`node -v`)
- **npm**: v9.0.0 or later (`npm -v`)
- **MongoDB**: MongoDB Atlas cloud URI or local MongoDB instance (Optional: app includes seamless in-memory fallback if MongoDB is not yet running!)

### 1. Clone the repository
```bash
git clone <repository-url>
cd "AI code review platform"
```

### 2. Configure Backend Environment
Create `backend/.env` (a ready template is provided in `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/codesense_ai
JWT_SECRET=codesense_ai_jwt_super_secure_secret_key_2026_dev_prod_token_sign
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```
> **Note:** A Gemini API key can be obtained for free at [Google AI Studio](https://aistudio.google.com/app/apikey). If left empty, CodeSense AI automatically uses its built-in AST heuristic analyzer so all features work out-of-the-box!

### 3. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

### 4. Run Automated Backend Tests
Verify that the database, authentication, code review analyzer, and REST endpoints are all passing:
```bash
npm --prefix backend test
```

### 5. Launch the Platform
Start both backend and frontend servers in separate terminal tabs:

**Terminal 1 (Backend):**
```bash
npm --prefix backend start
```
*Backend runs on `http://localhost:5000` (Health check at `http://localhost:5000/api/health`)*

**Terminal 2 (Frontend):**
```bash
npm --prefix frontend run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🧪 Default Test Account
For evaluation using the seeded test account:
- **Email:** `alex.dev@codesense.ai`
- **Password:** `password123`

---

## 🔒 Security Architecture
1. **Password Hashing**: Stored with `bcryptjs` using 10 salt rounds.
2. **Access Control**: All private reviews enforce ownership verification; users can only read or mutate their own records.
3. **Protected APIs**: Stateless JWT Bearer tokens with 7-day expiration.
4. **File Isolation**: Uploaded source files are processed in-memory buffers; no untrusted executables are written to disk.
5. **Key Privacy**: AI API keys are strictly stored on the server and never exposed to client bundles.

---

## 📄 License
This project is licensed under the MIT License.
#   c o d e - s e n s e  
 