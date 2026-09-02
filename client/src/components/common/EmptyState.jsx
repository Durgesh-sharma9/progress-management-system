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
      className={`flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-3xl border-2 border-dashed border-slate-200/90 bg-gradient-to-b from-white/90 to-slate-50/50 backdrop-blur-sm shadow-soft ${className}`}
    >
      <div className="relative mb-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25">
          <Icon className="h-8 w-8" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-500 ring-2 ring-white" />
        </span>
      </div>
      
      <h4 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h4>
      <p className="mt-1.5 text-sm text-slate-500 max-w-md font-normal leading-relaxed">{description}</p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:from-brand-500 hover:to-indigo-500 transition-all duration-200 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

