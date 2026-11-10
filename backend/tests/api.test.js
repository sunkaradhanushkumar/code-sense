const assert = require('assert');
const http = require('http');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';

const app = require('../server');

let server;
const BASE_URL = 'http://localhost:5001';

const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- Starting CodeSense AI Backend API Tests ---');

  server = app.listen(5001);

  try {
    // 1. Health Check
    console.log('[Test 1] Health Check Endpoint GET /api/health');
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/health',
      method: 'GET',
    });
    assert.strictEqual(health.status, 200, 'Health endpoint should return 200');
    assert.strictEqual(health.body.status, 'healthy');
    console.log('✓ Health check passed');

    // 2. User Login
    console.log('[Test 2] User Login POST /api/auth/login');
    const loginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'alex.dev@codesense.ai',
        password: 'password123',
      }
    );
    assert.strictEqual(loginRes.status, 200, 'Login should succeed');
    assert(loginRes.body.token, 'Should return JWT token');
    const token = loginRes.body.token;
    console.log('✓ Login passed, JWT token acquired');

    // 3. Code Analysis (JavaScript with eval and loose equality)
    console.log('[Test 3] Code Analysis POST /api/reviews/analyze');
    const testJsCode = `
function handleAuth(req) {
  var token = req.token;
  if (token == null) return false;
  eval(req.customEval);
  return true;
}
    `;
    const analysis = await makeRequest(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/reviews/analyze',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      {
        code: testJsCode,
        language: 'javascript',
        title: 'Security Test Snippet',
      }
    );

    assert.strictEqual(analysis.status, 200, 'Code analysis should return 200');
    assert(analysis.body.data.qualityScore < 80, `Quality score should be reduced due to eval() and var (got ${analysis.body.data.qualityScore})`);
    assert(analysis.body.data.issues.length >= 2, 'Should detect at least 2 issues');
    assert(analysis.body.data.optimizedCode, 'Should generate optimized code');
    console.log(`✓ Code analysis passed (Detected ${analysis.body.data.issues.length} issues, Score: ${analysis.body.data.qualityScore})`);

    // 4. Get User Stats
    console.log('[Test 4] Dashboard Stats GET /api/reviews/stats');
    const stats = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/reviews/stats',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    assert.strictEqual(stats.status, 200);
    assert(stats.body.data.totalReviews >= 1, 'Should have recorded reviews');
    console.log(`✓ Dashboard stats passed (Total reviews: ${stats.body.data.totalReviews}, Avg Score: ${stats.body.data.averageQualityScore})`);

    // 5. Auth Protection
    console.log('[Test 5] Protected Route without Token GET /api/reviews');
    const unauth = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/reviews',
      method: 'GET',
    });
    assert.strictEqual(unauth.status, 401, 'Should reject without Bearer token');
    console.log('✓ Auth security check passed (401 returned)');

    console.log('\n=============================================');
    console.log('🎉 ALL BACKEND API TESTS COMPLETED SUCCESSFULLY!');
    console.log('=============================================\n');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
};

runTests();
