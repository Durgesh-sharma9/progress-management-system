import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (msg, duration) => addToast(msg, 'success', duration),
    [addToast]
  );
  const error = useCallback(
    (msg, duration) => addToast(msg, 'error', duration),
    [addToast]
  );
  const info = useCallback(
    (msg, duration) => addToast(msg, 'info', duration),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-md w-full px-4">
        {toasts.map((toast) => {
          let bgClass = 'bg-white border-slate-200 text-slate-800 shadow-lg';
          let icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;

          if (toast.type === 'success') {
            bgClass = 'bg-white border-emerald-300 text-slate-800 shadow-emerald-600/10 shadow-xl';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
          } else if (toast.type === 'error') {
            bgClass = 'bg-white border-rose-300 text-slate-800 shadow-rose-600/10 shadow-xl';
            icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bgClass}`}
            >
              {icon}
              <div className="flex-1 text-sm font-semibold leading-5 text-slate-800">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
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
