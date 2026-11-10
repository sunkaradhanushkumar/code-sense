import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('js');

  const sampleSnippets = {
    js: {
      lang: 'JavaScript',
      code: `// Flawed Auth Token Verification
function verifyUser(req) {
  var token = req.headers['authorization'];
  if (token == null) return false;
  eval(req.body.customValidator); // Security risk!
  return true;
}`,
      findings: [
        { type: 'critical', text: 'eval() allows Remote Code Execution (RCE)' },
        { type: 'medium', text: 'Loose equality (==) allows unexpected coercion' },
        { type: 'low', text: 'Legacy "var" keyword should be "const/let"' },
      ],
      score: 42,
    },
    py: {
      lang: 'Python',
      code: `# Risky Batch Processing
def ingest_data(batch=[]): # Mutable default!
    try:
        data = eval(request.payload)
        batch.append(data)
    except:
        pass`,
      findings: [
        { type: 'critical', text: 'eval() arbitrary code execution risk' },
        { type: 'high', text: 'Mutable default argument shares state across calls' },
        { type: 'medium', text: 'Bare except: swallows interrupt signals' },
      ],
      score: 38,
    },
    java: {
      lang: 'Java',
      code: `// Payment Token Matcher
public boolean checkToken(String inputToken) {
    String secret = "HARDCODED_KEY_123";
    return inputToken == secret; // Reference comparison!
}`,
      findings: [
        { type: 'critical', text: 'Hardcoded secret in source control' },
        { type: 'high', text: 'String == compares references, not contents' },
      ],
      score: 55,
    },
    c: {
      lang: 'C',
      code: `// Unchecked Buffer & Pointer Arithmetic
void parseMessage(const char *raw) {
    char packet[32];
    strcpy(packet, raw); // Stack buffer overflow!
    char *buf = (char *)malloc(64);
    // Missing free(buf) -> memory leak
}`,
      findings: [
        { type: 'critical', text: 'strcpy() into static buffer causes stack overflow' },
        { type: 'medium', text: 'Heap allocation with malloc() lacks corresponding free()' },
      ],
      score: 30,
    },
    cpp: {
      lang: 'C++',
      code: `// Memory and Buffer Risk
void processPayload(char* input) {
    char buffer[64];
    strcpy(buffer, input); // Buffer overflow!
    int* ptr = (int*)malloc(sizeof(int));
    // Missing free(ptr) -> memory leak
}`,
      findings: [
        { type: 'critical', text: 'strcpy() induces stack buffer overflow vulnerability' },
        { type: 'medium', text: 'malloc() without free() causes memory leak' },
      ],
      score: 35,
    },
  };

  const currentSample = sampleSnippets[activeTab];

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Perfect Code with AI Engineer
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-neutral-400 max-w-3xl mx-auto font-normal leading-relaxed whitespace-normal sm:whitespace-nowrap">
            Instant code reviews, security audits, and smart refactoring in seconds.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex items-center justify-center">
            <Link
              to="/workspace"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all text-center"
            >
              Launch Code Workspace
            </Link>
          </div>
        </div>

        {/* Live Interactive Code Preview Showcase */}
        <div className="max-w-5xl mx-auto px-4 mt-14">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden">
            {/* Editor Window Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 inline-block"></span>
                <span className="ml-2 text-xs font-sans text-neutral-400">codesense-scanner.test</span>
              </div>

              {/* Language Selector Pills */}
              <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
                {Object.keys(sampleSnippets).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-2.5 py-1 rounded text-xs font-sans font-medium transition-colors ${
                      activeTab === key
                        ? 'bg-white text-black font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {sampleSnippets[key].lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Code and Instant AI Findings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
              {/* Code Snippet Side */}
              <div className="lg:col-span-7 p-4 bg-black font-sans text-xs text-neutral-200 overflow-x-auto">
                <pre className="leading-relaxed whitespace-pre font-sans">
                  {currentSample.code}
                </pre>
              </div>

              {/* Instant AI Review Output Side */}
              <div className="lg:col-span-5 p-4 bg-neutral-950 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Instant AI Diagnosis
                    </span>
                    <span className="text-xs font-sans font-bold px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-white">
                      Score: {currentSample.score}/100
                    </span>
                  </div>

                  <div className="space-y-2">
                    {currentSample.findings.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs p-2.5 rounded-lg bg-black border border-neutral-800"
                      >
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-white" />
                        <span className="text-neutral-300 leading-snug">{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-end">
                  <Link
                    to="/workspace"
                    className="text-xs font-semibold text-white hover:underline"
                  >
                    Run in Workspace
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
