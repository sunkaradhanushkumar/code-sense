import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Loader2, Copy, Check } from 'lucide-react';

const defineCodesenseTheme = (monaco) => {
  monaco.editor.defineTheme('codesense-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'e4e4e7' },
      { token: 'comment', foreground: '52525b', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ffffff', fontStyle: 'bold' },
      { token: 'string', foreground: 'a1a1aa' },
      { token: 'number', foreground: 'e4e4e7' },
      { token: 'regexp', foreground: 'd4d4d8' },
      { token: 'type', foreground: 'ffffff' },
      { token: 'delimiter', foreground: '71717a' },
    ],
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#f4f4f5',
      'editorCursor.foreground': '#ffffff',
      'editor.lineHighlightBackground': '#09090b',
      'editor.lineHighlightBorder': '#00000000',
      'editorLineNumber.foreground': '#3f3f46',
      'editorLineNumber.activeForeground': '#fafafa',
      'editor.selectionBackground': '#27272a',
      'editor.inactiveSelectionBackground': '#18181b',
      'editor.selectionHighlightBackground': '#27272a80',
      'editorGutter.background': '#000000',
      'editorIndentGuide.background1': '#18181b',
      'editorIndentGuide.activeBackground1': '#3f3f46',
      'editorBracketMatch.background': '#27272a',
      'editorBracketMatch.border': '#52525b',
      'editorWidget.background': '#09090b',
      'editorWidget.border': '#27272a',
      'scrollbarSlider.background': '#27272a50',
      'scrollbarSlider.hoverBackground': '#3f3f4680',
      'scrollbarSlider.activeBackground': '#52525b',
    },
  });
};

export const MonacoCodeEditor = ({
  code = '',
  onChange,
  language = 'javascript',
  readOnly = false,
  height = '500px',
  onMount,
  onRunReview,
  showToolbar = true,
  showStatusBar = true,
  fileName = '',
}) => {
  const onRunReviewRef = useRef(onRunReview);
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  useEffect(() => {
    onRunReviewRef.current = onRunReview;
  }, [onRunReview]);

  const getMonacoLanguage = (lang) => {
    switch (lang.toLowerCase()) {
      case 'javascript':
        return 'javascript';
      case 'python':
        return 'python';
      case 'java':
        return 'java';
      case 'c':
        return 'c';
      case 'cpp':
        return 'cpp';
      default:
        return 'javascript';
    }
  };

  const handleBeforeMount = (monaco) => {
    defineCodesenseTheme(monaco);
  };

  const handleEditorDidMount = (editor, monaco) => {
    defineCodesenseTheme(monaco);
    monaco.editor.setTheme('codesense-dark');

    editor.updateOptions({
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas, 'Courier New', monospace",
      fontSize: 13.5,
      lineHeight: 22,
      fontLigatures: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      cursorStyle: 'line',
      cursorWidth: 2,
      renderWhitespace: 'none',
      renderLineHighlight: 'line',
      renderLineHighlightOnlyWhenFocus: false,
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
        highlightActiveIndentation: true,
      },
      lineNumbersMinChars: 3,
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 6,
        horizontalScrollbarSize: 6,
        useShadows: false,
      },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoClosingDelete: 'always',
      formatOnPaste: true,
      formatOnType: true,
      tabSize: 2,
      wordWrap: 'on',
      padding: { top: 12, bottom: 12 },
      folding: true,
    });

    // Track cursor movements for status bar
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, col: e.position.column });
    });

    // Keyboard shortcut: Ctrl + Enter (Cmd + Enter on macOS) to run review
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (typeof onRunReviewRef.current === 'function') {
        onRunReviewRef.current();
      }
    });

    if (onMount) {
      onMount(editor, monaco);
    }
  };

  const handleCopyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const lineCount = code ? code.split('\n').length : 0;
  const charCount = code ? code.length : 0;

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-neutral-800 bg-black flex flex-col shadow-sm">
      {/* Integrated IDE Top Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-neutral-950 border-b border-neutral-800 font-sans select-none">
          {/* Left: Window controls & File / Language label */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-700/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-700/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-700/60" />
            </div>

            <div className="h-3 w-px bg-neutral-800" />

            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              {fileName || (language === 'cpp' ? 'C++' : language === 'c' ? 'C' : language)}
            </span>
          </div>

          {/* Right: Actions & Shortcuts */}
          <div className="flex items-center gap-2">
            {onRunReview && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-neutral-500 mr-1">
                <kbd className="px-1.5 py-0.5 text-[10px] bg-neutral-900 border border-neutral-800 rounded text-neutral-400 font-sans">
                  Ctrl + Enter
                </kbd>
                <span>to review</span>
              </span>
            )}

            {code && (
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-white" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}

            {!readOnly && code && onChange && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-2 py-1 text-[11px] rounded text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900 transition-colors"
                title="Clear editor"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Monaco Editor Container */}
      <div className="relative flex-1 bg-black">
        {!code && !readOnly && (
          <div className="pointer-events-none absolute top-3.5 left-14 z-10 text-neutral-600 text-xs font-mono select-none">
            // Paste or type source code here to begin analysis...
          </div>
        )}

        <Editor
          height={height}
          language={getMonacoLanguage(language)}
          value={code}
          onChange={(val) => onChange && onChange(val || '')}
          theme="codesense-dark"
          beforeMount={handleBeforeMount}
          options={{
            readOnly,
            tabSize: 2,
            wordWrap: 'on',
          }}
          onMount={handleEditorDidMount}
          loading={
            <div className="h-full w-full flex items-center justify-center bg-black text-neutral-400 gap-2 font-sans text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Initializing Monaco Editor...</span>
            </div>
          }
        />
      </div>

      {/* Sleek Bottom Status Bar */}
      {showStatusBar && (
        <div className="flex items-center justify-between px-3.5 py-1 bg-neutral-950 border-t border-neutral-850 font-sans text-[10px] text-neutral-500 select-none">
          <div className="flex items-center gap-2.5">
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            <span className="text-neutral-700">•</span>
            <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
            <span className="text-neutral-700">•</span>
            <span>{charCount} chars</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span>UTF-8</span>
            <span className="text-neutral-700">•</span>
            <span>Spaces: 2</span>
            <span className="text-neutral-700">•</span>
            <span className="uppercase text-neutral-400 font-medium">
              {language === 'cpp' ? 'C++' : language}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonacoCodeEditor;
