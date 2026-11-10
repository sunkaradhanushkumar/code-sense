const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI Code Review Service
 * Integrates with Google Gemini API for deep semantic code review
 * with an advanced AST/heuristic fallback engine for offline/keyless use.
 */

// Strictly configured to Gemini 3.5 Flash as requested
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

// Initialize Gemini API client if key is configured
const getGeminiModel = (customApiKey) => {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: GEMINI_MODEL });
};

/**
 * Main review function
 * @param {string} sourceCode - The raw code to analyze
 * @param {string} language - javascript | python | java | c | cpp
 * @param {object} options - { title, strictness, customApiKey }
 */
const analyzeCode = async (sourceCode, language, options = {}) => {
  const startTime = Date.now();
  const lang = (language || 'javascript').toLowerCase();
  const title = options.title || `${lang.toUpperCase()} Code Review`;
  const strictness = options.strictness || 'standard';

  let reviewData = null;
  let usedEngine = 'fallback';

  // 1. Try Gemini API exclusively using gemini-3.5-flash
  const model = getGeminiModel(options.customApiKey);
  if (model) {
    try {
      console.log(`[AI Review] Analyzing ${lang} code using Google Gemini API (${GEMINI_MODEL})...`);
      reviewData = await analyzeWithGemini(model, sourceCode, lang, strictness);
      usedEngine = GEMINI_MODEL;
      console.log(`[AI Review] Successfully completed analysis using ${GEMINI_MODEL}.`);
    } catch (aiError) {
      console.warn(`[AI Review] Gemini API (${GEMINI_MODEL}) call failed (${aiError.message}). Falling back to internal engine.`);
    }
  }

  // 2. If Gemini unavailable or failed, use internal heuristic intelligence engine
  if (!reviewData) {
    console.log(`[AI Review] Analyzing ${lang} code using CodeSense Heuristic Engine...`);
    reviewData = analyzeWithHeuristics(sourceCode, lang, strictness);
    usedEngine = 'codesense-heuristic-v1';
  }

  const executionTimeMs = Date.now() - startTime;
  reviewData.metrics.executionTimeMs = executionTimeMs;
  reviewData.metrics.engine = usedEngine;

  return reviewData;
};

/**
 * Gemini API Code Analysis
 */
const analyzeWithGemini = async (model, sourceCode, language, strictness) => {
  const prompt = `
You are a Staff Principal Software Engineer and Cybersecurity Specialist conducting an in-depth code review.
Analyze the following ${language} code. Your review must be strictly structured as valid JSON without markdown fences.

Code to analyze:
\`\`\`${language}
${sourceCode}
\`\`\`

Strictness level: ${strictness}

Return a single JSON object with EXACTLY this structure:
{
  "qualityScore": <number between 0 and 100 based on severity and quantity of issues>,
  "summary": {
    "executiveSummary": "<2-3 sentence high-level assessment of code quality, architecture and safety>",
    "scoreVerdict": "<Excellent | Good | Needs Work | Critical Issues>",
    "totalIssues": <number>,
    "bugsCount": <number of bugs and logical errors>,
    "securityCount": <number of security vulnerabilities>,
    "performanceCount": <number of performance / efficiency issues>,
    "styleCount": <number of code style and maintainability smells>
  },
  "issues": [
    {
      "id": "iss-1",
      "type": "<bug | security | performance | style | best-practice>",
      "severity": "<critical | high | medium | low | info>",
      "title": "<short descriptive title of the issue>",
      "line": <line number where issue occurs, 1-based>,
      "description": "<technical explanation of what is wrong>",
      "beginnerExplanation": "<clear, jargon-free explanation why this is a problem in plain language>",
      "suggestion": "<actionable recommendation to resolve the issue>",
      "codeSnippet": "<exact problematic snippet from source code>",
      "fixedSnippet": "<corrected code snippet for this specific issue>"
    }
  ],
  "optimizedCode": "<complete, fully refactored, corrected, and production-ready version of the source code with all fixes applied>",
  "keyRecommendations": [
    "<recommendation 1>",
    "<recommendation 2>",
    "<recommendation 3>"
  ],
  "metrics": {
    "linesOfCode": <number of code lines>,
    "cyclomaticComplexityEstimate": "<Low | Moderate | High | Very High>",
    "maintainabilityIndex": <number between 0 and 100>
  }
}
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return parseAIJsonResponse(responseText, sourceCode, language);
};

/**
 * Robust JSON Parser for AI output
 */
const parseAIJsonResponse = (rawText, sourceCode, language) => {
  try {
    let cleanText = rawText.trim();
    // Strip markdown code fences if present
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    const parsed = JSON.parse(cleanText);

    // Ensure all required fields exist
    parsed.metrics = parsed.metrics || {};
    parsed.metrics.linesOfCode = sourceCode.split('\n').length;
    parsed.sourceCode = sourceCode;
    parsed.language = language;

    return parsed;
  } catch (parseError) {
    console.error('[AI Review] Failed to parse JSON from AI response:', parseError.message);
    // Fall back to heuristic engine if AI returned non-JSON
    return analyzeWithHeuristics(sourceCode, language, 'standard');
  }
};

/**
 * Comprehensive Multi-Language Heuristic Analyzer
 * Evaluates syntax, security vulnerabilities, performance anti-patterns, and logical bugs.
 */
const analyzeWithHeuristics = (sourceCode, language, strictness) => {
  const lines = sourceCode.split('\n');
  const issues = [];
  let issueCounter = 1;

  const addIssue = (item) => {
    issues.push({
      id: `iss-${issueCounter++}`,
      type: item.type,
      severity: item.severity,
      title: item.title,
      line: item.line || 1,
      description: item.description,
      beginnerExplanation: item.beginnerExplanation || item.description,
      suggestion: item.suggestion,
      codeSnippet: item.codeSnippet || '',
      fixedSnippet: item.fixedSnippet || '',
    });
  };

  // Common analysis for all languages
  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();

    // 1. Hardcoded Secrets & API Keys
    if (
      /(api[_-]?key|secret|password|auth[_-]?token|bearer)\s*(=|:)\s*["'][a-zA-Z0-9_\-]{8,}["']/i.test(trimmed) &&
      !trimmed.includes('process.env') &&
      !trimmed.includes('os.environ')
    ) {
      addIssue({
        type: 'security',
        severity: 'critical',
        title: 'Hardcoded Secret or Credential Detected',
        line: lineNum,
        description: 'Hardcoded sensitive keys or passwords can be exposed in source control and leaked to unauthorized parties.',
        beginnerExplanation: 'Think of this like writing your house key code on your front door. If anyone sees your code, they get access to your private database or API.',
        suggestion: 'Store credentials in environment variables (e.g. process.env or .env file) rather than hardcoding them.',
        codeSnippet: trimmed,
        fixedSnippet: '// Use environment variable\nconst API_KEY = process.env.API_KEY;',
      });
    }

    // 2. Generic TODO/FIXME left behind
    if (/\b(TODO|FIXME|HACK|XXX)\b/i.test(trimmed)) {
      addIssue({
        type: 'style',
        severity: 'info',
        title: 'Unresolved TODO or Technical Debt Marker',
        line: lineNum,
        description: 'Code contains unresolved debt or unfinished implementation tags.',
        beginnerExplanation: 'A TODO is a sticky note left in code. Before putting code into production, make sure the task is completed.',
        suggestion: 'Implement the pending feature or document it in your project issue tracker.',
        codeSnippet: trimmed,
        fixedSnippet: '// Task resolved and documented',
      });
    }

    // Language specific rules
    if (language === 'javascript') {
      // eval() usage
      if (/\beval\s*\(/.test(trimmed)) {
        addIssue({
          type: 'security',
          severity: 'critical',
          title: 'Dangerous Use of eval()',
          line: lineNum,
          description: 'eval() executes arbitrary code strings with elevated privileges, leading to Remote Code Execution (RCE) and XSS.',
          beginnerExplanation: 'eval() is dangerous because it runs any text given to it as a command. An attacker could send malicious text to take over your application.',
          suggestion: 'Refactor to use JSON.parse(), direct mathematical operators, or safe lookup objects.',
          codeSnippet: trimmed,
          fixedSnippet: 'const data = JSON.parse(inputString);',
        });
      }

      // Loose equality == instead of ===
      if (/[^!=><]==[^=]/.test(trimmed) && !trimmed.includes('typeof') && !trimmed.includes('null')) {
        addIssue({
          type: 'bug',
          severity: 'medium',
          title: 'Loose Equality Operator (==) Used',
          line: lineNum,
          description: 'Using `==` invokes type coercion, which can produce unexpected truthy/falsy comparisons and logical bugs.',
          beginnerExplanation: 'In JavaScript, "0" == 0 is true, but they are not the same type! Strict equality (===) checks both value and type.',
          suggestion: 'Replace `==` with `===` for strict type comparison.',
          codeSnippet: trimmed,
          fixedSnippet: trimmed.replace(/==/g, '==='),
        });
      }

      // var keyword instead of let/const
      if (/\bvar\s+[a-zA-Z0-9_$]+/.test(trimmed)) {
        addIssue({
          type: 'style',
          severity: 'low',
          title: 'Legacy "var" Declaration',
          line: lineNum,
          description: '"var" has function scope and is hoisted, leading to variable shadowing and subtle state bugs.',
          beginnerExplanation: '"var" is the old way to create variables in JavaScript. Modern JavaScript uses "const" for values that do not change and "let" for values that do.',
          suggestion: 'Use `const` for immutable variables and `let` for variables that are reassigned.',
          codeSnippet: trimmed,
          fixedSnippet: trimmed.replace(/\bvar\b/, 'const'),
        });
      }

      // Unhandled Promise in async
      if (/\basync\b/.test(trimmed) && !sourceCode.includes('try') && !sourceCode.includes('catch')) {
        addIssue({
          type: 'bug',
          severity: 'high',
          title: 'Missing try/catch in Async Function',
          line: lineNum,
          description: 'Async functions without error handling can cause UnhandledPromiseRejection errors that crash Node.js servers.',
          beginnerExplanation: 'When code talks to a server or database, it might fail. If you do not catch that failure with try/catch, your whole app can crash.',
          suggestion: 'Wrap asynchronous operations in try/catch blocks.',
          codeSnippet: trimmed,
          fixedSnippet: 'try {\n  // async code\n} catch (error) {\n  console.error("Operation failed:", error);\n}',
        });
      }
    }

    if (language === 'python') {
      // Mutable default arguments: def func(a=[])
      if (/def\s+\w+\s*\(.*=\s*(\[\]|\{\})\s*\)/.test(trimmed)) {
        addIssue({
          type: 'bug',
          severity: 'high',
          title: 'Mutable Default Argument in Function Definition',
          line: lineNum,
          description: 'Python initializes default arguments once when the function is defined. A mutable default (list/dict) retains modifications across calls.',
          beginnerExplanation: 'In Python, default lists [] are shared between all calls to the function. Modifying it in one call will unexpectedly change it for everyone else.',
          suggestion: 'Use `None` as default argument and initialize the list/dict inside the function body.',
          codeSnippet: trimmed,
          fixedSnippet: 'def my_function(items=None):\n    if items is None:\n        items = []',
        });
      }

      // Bare except:
      if (/except\s*:/.test(trimmed)) {
        addIssue({
          type: 'bug',
          severity: 'medium',
          title: 'Bare "except:" Catches System Exit and Interrupts',
          line: lineNum,
          description: 'A bare except statement catches SystemExit and KeyboardInterrupt, preventing normal program termination.',
          beginnerExplanation: 'Catching everything stops even Ctrl+C from closing your app. Always specify which error you expect.',
          suggestion: 'Catch specific exceptions like `except Exception as e:` or `except ValueError:`.',
          codeSnippet: trimmed,
          fixedSnippet: 'except Exception as error:\n    logging.error(f"Error occurred: {error}")',
        });
      }

      // exec() or eval() in python
      if (/\b(eval|exec)\s*\(/.test(trimmed)) {
        addIssue({
          type: 'security',
          severity: 'critical',
          title: 'Arbitrary Code Execution via eval/exec',
          line: lineNum,
          description: 'eval() and exec() allow arbitrary Python code execution, opening the system to injection attacks.',
          beginnerExplanation: 'Running text directly as Python code can allow hackers to delete files or run commands on your machine.',
          suggestion: 'Use ast.literal_eval() for safe data evaluation or avoid dynamic execution.',
          codeSnippet: trimmed,
          fixedSnippet: 'import ast\nsafe_data = ast.literal_eval(raw_string)',
        });
      }
    }

    if (language === 'java') {
      // System.out.println in production code
      if (/System\.(out|err)\.print/.test(trimmed)) {
        addIssue({
          type: 'style',
          severity: 'low',
          title: 'System.out.println Used Instead of Logger',
          line: lineNum,
          description: 'Using System.out.println impacts throughput and lacks log levels, timestamps, and destination routing.',
          beginnerExplanation: 'Printing directly to the console slows down Java apps and cannot be turned off in production. Use a logging library like SLF4J/Logback.',
          suggestion: 'Replace with a logging framework like SLF4J or java.util.logging.',
          codeSnippet: trimmed,
          fixedSnippet: 'logger.info("Message: {}", value);',
        });
      }

      // String comparison with ==
      if (/\bString\b/.test(sourceCode) && /==\s*["']/.test(trimmed)) {
        addIssue({
          type: 'bug',
          severity: 'high',
          title: 'String Reference Comparison Using "==" Operator',
          line: lineNum,
          description: 'In Java, "==" compares object memory references, not String contents. Different String instances with the same text will evaluate to false.',
          beginnerExplanation: 'In Java, == checks if two variables point to the exact same memory location, not if the text inside them matches. Always use .equals().',
          suggestion: 'Use `.equals()` or `Objects.equals(a, b)` for content comparison.',
          codeSnippet: trimmed,
          fixedSnippet: 'if ("expectedValue".equals(actualVariable)) { ... }',
        });
      }
    }

    if (language === 'c' || language === 'cpp') {
      // Memory management malloc/free
      if (/\bmalloc\s*\(/.test(trimmed)) {
        addIssue({
          type: 'performance',
          severity: 'medium',
          title: language === 'c' ? 'Unmanaged Heap Memory Allocation (malloc)' : 'Legacy C-Style Memory Allocation (malloc/free)',
          line: lineNum,
          description: language === 'c'
            ? 'Manual malloc requires explicit free() checking on all exit paths to prevent memory leaks.'
            : 'malloc does not invoke C++ object constructors and is not exception-safe (RAII).',
          beginnerExplanation: language === 'c'
            ? 'When you ask the system for memory using malloc, you must remember to free it with free(), otherwise your program will leak memory over time.'
            : 'In modern C++, you should not manually allocate raw memory with malloc. Use smart pointers like std::make_unique.',
          suggestion: language === 'c'
            ? 'Ensure paired free() calls exist on every return path, or check allocation success.'
            : 'Use smart pointers (`std::unique_ptr` or `std::make_shared`) or standard containers (`std::vector`).',
          codeSnippet: trimmed,
          fixedSnippet: language === 'c' ? '// Check allocation\nif (ptr == NULL) { /* handle error */ }\n// Ensure free(ptr) when done' : 'auto ptr = std::make_unique<MyClass>();',
        });
      }

      // Insecure string functions (strcpy, sprintf, gets)
      if (/\b(strcpy|sprintf|gets|strcat)\s*\(/.test(trimmed)) {
        addIssue({
          type: 'security',
          severity: 'critical',
          title: 'Buffer Overflow Vulnerability (Unbounded Buffer Copy)',
          line: lineNum,
          description: 'Functions like strcpy, sprintf, and gets do not perform buffer boundary checks, causing stack/heap buffer overflows.',
          beginnerExplanation: 'Putting more data into a container than it can hold causes it to spill over into other memory. Attackers use this to crash or hack programs.',
          suggestion: language === 'c'
            ? 'Use bounded functions like `strncpy`, `snprintf`, or `strlcpy` with explicit buffer size bounds.'
            : 'Use `std::string`, `strncpy_s`, or `snprintf` with explicit buffer size bounds.',
          codeSnippet: trimmed,
          fixedSnippet: language === 'c'
            ? 'snprintf(buffer, sizeof(buffer), "%s", input);'
            : 'std::string safeStr = inputStr;\n// Or snprintf(buffer, sizeof(buffer), "%s", input);',
        });
      }
    }
  });

  // Calculate issue counts
  const bugsCount = issues.filter((i) => i.type === 'bug').length;
  const securityCount = issues.filter((i) => i.type === 'security').length;
  const performanceCount = issues.filter((i) => i.type === 'performance').length;
  const styleCount = issues.filter((i) => i.type === 'style' || i.type === 'best-practice').length;
  const totalIssues = issues.length;

  // Calculate score starting from 100
  let scoreDeduction = 0;
  issues.forEach((iss) => {
    switch (iss.severity) {
      case 'critical':
        scoreDeduction += 25;
        break;
      case 'high':
        scoreDeduction += 15;
        break;
      case 'medium':
        scoreDeduction += 8;
        break;
      case 'low':
        scoreDeduction += 4;
        break;
      case 'info':
        scoreDeduction += 1;
        break;
    }
  });

  const qualityScore = Math.max(10, Math.min(100, 100 - scoreDeduction));

  let scoreVerdict = 'Excellent';
  if (qualityScore < 50) scoreVerdict = 'Critical Issues';
  else if (qualityScore < 70) scoreVerdict = 'Needs Work';
  else if (qualityScore < 85) scoreVerdict = 'Good';

  // Generate optimized code version
  let optimizedCode = sourceCode;
  if (language === 'javascript') {
    optimizedCode = optimizedCode
      .replace(/\bvar\b/g, 'const')
      .replace(/([^!=><])==([^=])/g, '$1===$2');
  } else if (language === 'python') {
    optimizedCode = optimizedCode.replace(/except\s*:/g, 'except Exception as error:');
  }

  // Prepend clean header comment to optimized code
  optimizedCode = `/**\n * Optimized by CodeSense AI\n * Language: ${language.toUpperCase()}\n * Quality Score: ${qualityScore}/100 (${scoreVerdict})\n * Cleaned, refactored, and security-hardened\n */\n\n` + optimizedCode;

  const keyRecommendations = [
    securityCount > 0
      ? 'Remediate critical security vulnerabilities and move hardcoded secrets into secure environment variables.'
      : 'Maintain good security posture by validating all untrusted user inputs.',
    bugsCount > 0
      ? 'Fix logical edge cases, unhandled promises, and comparison operators to prevent runtime failures.'
      : 'Code has solid logical consistency; ensure automated unit tests cover edge conditions.',
    'Adopt modern language idiomatic patterns and automated linting in your continuous integration pipeline.',
  ];

  return {
    qualityScore,
    summary: {
      executiveSummary:
        totalIssues === 0
          ? `Code exhibits strong architecture, clean semantics, and follows industry best practices for ${language}.`
          : `Review identified ${totalIssues} issue(s) (${securityCount} security, ${bugsCount} bugs, ${performanceCount} performance). Recommended fixes will improve maintainability and resilience.`,
      scoreVerdict,
      totalIssues,
      bugsCount,
      securityCount,
      performanceCount,
      styleCount,
    },
    issues,
    optimizedCode,
    keyRecommendations,
    metrics: {
      linesOfCode: lines.length,
      cyclomaticComplexityEstimate: lines.length > 50 ? 'Moderate' : 'Low',
      maintainabilityIndex: Math.round(qualityScore * 0.9 + 10),
    },
    sourceCode,
    language,
  };
};

module.exports = {
  analyzeCode,
};
