import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Loader2 } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  confirmVariant = 'danger',
  isLoading = false,
}) => {
  const buttonStyles = {
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 focus:ring-rose-500',
    warning:
      'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 focus:ring-amber-500',
    primary:
      'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 focus:ring-brand-500',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 border border-rose-200 mb-4 shadow-sm">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-sm text-slate-600 mb-6">{message}</p>

        <div className="flex w-full items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${buttonStyles[confirmVariant] || buttonStyles.danger}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
