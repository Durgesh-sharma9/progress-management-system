import React from 'react';

const statusConfig = {
  Planning: {
    label: 'Planning',
    bg: 'bg-indigo-50/90 text-indigo-700 border-indigo-200/80 shadow-indigo-100/50',
    dot: 'bg-indigo-500',
    ping: false,
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-amber-50/90 text-amber-800 border-amber-200/80 shadow-amber-100/50',
    dot: 'bg-amber-500',
    ping: true,
  },
  Completed: {
    label: 'Completed',
    bg: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/80 shadow-emerald-100/50',
    dot: 'bg-emerald-500',
    ping: false,
  },
  'On Hold': {
    label: 'On Hold',
    bg: 'bg-rose-50/90 text-rose-700 border-rose-200/80 shadow-rose-100/50',
    dot: 'bg-rose-500',
    ping: false,
  },
};

const StatusBadge = ({ status = 'Planning', size = 'sm', className = '' }) => {
  const config = statusConfig[status] || statusConfig.Planning;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border shadow-soft-xs tracking-tight transition-all duration-200 ${
        isSm ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      } ${config.bg} ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {config.ping && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`} />
      </span>
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;

