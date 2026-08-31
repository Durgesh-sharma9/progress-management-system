import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        className={`relative w-full ${maxWidthMap[maxWidth] || maxWidthMap.md} max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/80 shrink-0">
          <div className="min-w-0 pr-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">{title}</h3>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 text-slate-800 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
