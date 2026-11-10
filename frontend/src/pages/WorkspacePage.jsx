import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Cpu } from 'lucide-react';
import { MonacoCodeEditor } from '../components/editor/MonacoCodeEditor';
import { FileUploader } from '../components/editor/FileUploader';
import { reviewApi } from '../api/reviewApi';
import { useToast } from '../context/ToastContext';

export const WorkspacePage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [language, setLanguage] = useState('javascript');
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [strictness, setStrictness] = useState('standard');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const analysisSteps = [
    'Parsing abstract syntax tree (AST)...',
    'Auditing OWASP security vulnerabilities...',
    'Profiling algorithmic complexity & performance...',
    'Generating refactored code & diff...',
  ];

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
  };

  const handleFileSelected = (fileInfo) => {
    setUploadedFile(fileInfo);
    setCode(fileInfo.content);
    setTitle(fileInfo.name);
    if (fileInfo.language) {
      setLanguage(fileInfo.language);
    }
    toast.success(`Loaded file: ${fileInfo.name}`);
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setCode('');
    setTitle('');
  };

  const handleRunReview = async () => {
    if (isAnalyzing) return;
    if (!code || !code.trim()) {
      toast.warning('Please enter or paste code before starting the review.');
      return;
    }

    let interval = null;
    try {
      setIsAnalyzing(true);
      setAnalysisStep(0);

      interval = setInterval(() => {
        setAnalysisStep((prev) => (prev < analysisSteps.length - 1 ? prev + 1 : prev));
      }, 700);

      let payload;
      if (uploadedFile?.file) {
        payload = new FormData();
        payload.append('file', uploadedFile.file);
        payload.append('language', language);
        payload.append('title', title || uploadedFile.name);
        payload.append('strictness', strictness);
      } else {
        payload = {
          code,
          language,
          title: title || `${language.toUpperCase()} Code Analysis`,
          strictness,
        };
      }

      const res = await reviewApi.analyzeCode(payload);

      if (res && res.data) {
        toast.success('Code review analysis completed.');
        const reviewId = res.data._id || res.data.id;
        sessionStorage.setItem('current_review', JSON.stringify(res.data));
        navigate(`/review/${reviewId}`, { state: { reviewData: res.data } });
      }
    } catch (err) {
      toast.error(err.message || 'Analysis failed. Please try again.');
    } finally {
      if (interval) clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Code Review Workspace</h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCode('')}
            className="px-3 py-2 text-xs font-sans font-medium rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
          >
            Clear
          </button>

          <button
            onClick={handleRunReview}
            disabled={isAnalyzing || !code.trim()}
            className="px-5 py-2.5 rounded-lg bg-white hover:bg-neutral-200 disabled:opacity-40 text-black font-semibold text-xs transition-all"
          >
            <span>Run Code Review</span>
          </button>
        </div>
      </div>

      {/* Configuration Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Title Input */}
        <div>
          <label className="block text-[10px] font-sans font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            Review Title / File Label
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. authService.js or User Controller"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
          />
        </div>

        {/* Language Selector */}
        <div>
          <label className="block text-[10px] font-sans font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            Programming Language
          </label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors capitalize font-sans"
          >
            <option value="javascript">JavaScript (Node.js, React, ES6+)</option>
            <option value="python">Python (3.x, PEP 8)</option>
            <option value="java">Java (Spring, JDK)</option>
            <option value="c">C (C99/C11, Systems)</option>
            <option value="cpp">C++ (C++17/20, Systems)</option>
          </select>
        </div>

        {/* Strictness Level */}
        <div>
          <label className="block text-[10px] font-sans font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            Analysis Strictness
          </label>
          <select
            value={strictness}
            onChange={(e) => setStrictness(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors font-sans"
          >
            <option value="standard">Standard (Bugs, Security, Style)</option>
            <option value="strict">Strict (Zero tolerance for smells & OWASP)</option>
            <option value="lenient">Lenient (Critical bugs & vulnerabilities only)</option>
          </select>
        </div>
      </div>

      {/* File Drag and Drop Section */}
      <FileUploader
        onFileSelected={handleFileSelected}
        currentFile={uploadedFile}
        onClearFile={handleClearFile}
      />

      {/* Monaco Code Editor Area */}
      <div>
        <MonacoCodeEditor
          code={code}
          onChange={setCode}
          language={language}
          height="540px"
          onRunReview={handleRunReview}
          fileName={uploadedFile?.name || ''}
        />
      </div>

      {/* Animated Analyzing Modal Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-neutral-950 border border-neutral-700 p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center mx-auto">
              <Cpu className="w-6 h-6 animate-pulse text-white" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Code Review in Progress
              </h3>
              <p className="text-xs text-neutral-400 font-sans mt-1">
                {analysisSteps[analysisStep]}
              </p>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-2 text-left pt-2 font-sans">
              {analysisSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 text-xs transition-colors ${
                    idx <= analysisStep ? 'text-white' : 'text-neutral-600'
                  }`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      idx <= analysisStep ? 'text-white' : 'text-neutral-700'
                    }`}
                  />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
