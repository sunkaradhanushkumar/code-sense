import React, { useState, useRef } from 'react';
import { UploadCloud, FileCode2, X, AlertCircle } from 'lucide-react';

const EXTENSION_MAP = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'javascript',
  '.tsx': 'javascript',
  '.py': 'python',
  '.java': 'java',
  '.c': 'c',
  '.h': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.hpp': 'cpp',
};

export const FileUploader = ({ onFileSelected, currentFile, onClearFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    setError('');

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('File size exceeds the 2MB maximum limit.');
      return;
    }

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const detectedLang = EXTENSION_MAP[ext];

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      onFileSelected({
        file,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        content,
        language: detectedLang || 'javascript',
      });
    };
    reader.onerror = () => {
      setError('Failed to read source file.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  if (currentFile) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-sans">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
            <FileCode2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-white flex items-center gap-2">
              {currentFile.name}
              <span className="text-[10px] uppercase text-neutral-400 font-medium">
                ({currentFile.language === 'cpp' ? 'C++' : currentFile.language === 'c' ? 'C' : currentFile.language})
              </span>
            </p>
            <p className="text-[11px] text-neutral-500">{currentFile.size}</p>
          </div>
        </div>
        <button
          onClick={onClearFile}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          title="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-xl p-4 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 font-sans ${isDragging
            ? 'border-white bg-neutral-900'
            : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950 hover:bg-neutral-900/50'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cc,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-200">
              Drag & drop source code file, or <span className="text-white underline">browse</span>
            </p>
            <p className="text-[10px] text-neutral-500">
              Supports .js, .py, .java, .c, .cpp (Max 2MB)
            </p>
          </div>
        </div>

        <button
          type="button"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 shrink-0"
        >
          Select File
        </button>
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-xs font-sans text-white bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-white" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
