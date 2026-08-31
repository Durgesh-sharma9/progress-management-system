import React from 'react';
import { FolderPlus, Plus } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderPlus,
  title = 'No items found',
  description = 'Get started by creating your first item.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white/60 shadow-sm ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 mb-4 shadow-sm">
        <Icon className="h-7 w-7" />
      </div>
      <h4 className="text-base font-bold text-slate-900">{title}</h4>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/20 hover:bg-brand-500 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
