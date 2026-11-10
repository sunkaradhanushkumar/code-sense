import React, { useState } from 'react';
import { MonacoCodeEditor } from '../editor/MonacoCodeEditor';

export const CodeDiffViewer = ({ originalCode = '', optimizedCode = '', language = 'javascript', filename = '' }) => {
  const [activeTab, setActiveTab] = useState('optimized');
  const [copied, setCopied] = useState(false);

  const currentDisplayCode = activeTab === 'original' ? originalCode : optimizedCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDisplayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap = {
      javascript: '.js',
      python: '.py',
      java: '.java',
      c: '.c',
      cpp: '.cpp',
    };
    const ext = extMap[language.toLowerCase()] || '.txt';
    const outName = filename ? `optimized_${filename}` : `optimized_code${ext}`;

    const blob = new Blob([optimizedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = outName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* View Switcher and Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
        <div className="flex items-center gap-1.5 bg-black p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setActiveTab('optimized')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'optimized'
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            AI Optimized Code
          </button>

          <button
            onClick={() => setActiveTab('original')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'original'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            Original Code
          </button>

          <button
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'split'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            Side-by-Side
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
          >
            {copied ? 'Copied' : 'Copy Code'}
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 transition-colors"
          >
            Download Refactored
          </button>
        </div>
      </div>

      {/* Editor Display */}
      {activeTab === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="text-xs font-sans text-neutral-400 px-1 flex items-center justify-between">
              <span>Original Source</span>
              <span className="text-[10px] text-neutral-500">Read-Only</span>
            </div>
            <MonacoCodeEditor
              code={originalCode}
              language={language}
              readOnly={true}
              height="500px"
              showToolbar={false}
            />
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-sans text-white px-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                Refactored Solution
              </span>
              <span className="text-[10px] text-neutral-400">Production-Ready</span>
            </div>
            <MonacoCodeEditor
              code={optimizedCode || originalCode}
              language={language}
              readOnly={true}
              height="500px"
              showToolbar={false}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="text-xs font-sans text-neutral-400 px-1 flex items-center justify-between">
            <span>
              {activeTab === 'optimized' ? 'Refactored & Secure Code' : 'Original Input Code'}
            </span>
            <span className="text-[10px] text-neutral-500">
              {currentDisplayCode.split('\n').length} lines
            </span>
          </div>
          <MonacoCodeEditor
            code={currentDisplayCode}
            language={language}
            readOnly={true}
            height="550px"
            showToolbar={false}
          />
        </div>
      )}
    </div>
  );
};
