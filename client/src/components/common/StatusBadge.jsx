import React from 'react';

const statusConfig = {
  Planning: {
    label: 'Planning',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500 animate-pulse',
  },
  Completed: {
    label: 'Completed',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

const StatusBadge = ({ status = 'Planning', className = '' }) => {
  const config = statusConfig[status] || statusConfig.Planning;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
