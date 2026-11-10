import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = (msg) => addToast(msg, 'success');
  const error = (msg) => addToast(msg, 'error');
  const warning = (msg) => addToast(msg, 'warning');
  const info = (msg) => addToast(msg, 'info');

  return (
    <ToastContext.Provider value={{ success, error, warning, info, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          let Icon = Info;
          if (toast.type === 'success') {
            Icon = CheckCircle2;
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
          }

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border border-neutral-700 bg-neutral-950 text-white shadow-2xl transition-all duration-300 animate-in slide-in-from-right-4"
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5 text-white" />
              <div className="flex-1 text-xs font-sans leading-relaxed">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
