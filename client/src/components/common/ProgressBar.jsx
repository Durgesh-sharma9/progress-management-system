import React from 'react';

const ProgressBar = ({
  progress = 0,
  size = 'md',
  showLabel = true,
  label = '',
  className = '',
}) => {
  // Ensure bounds
  const clamped = Math.min(100, Math.max(0, Math.round(progress || 0)));

  const heightClasses = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
    xl: 'h-3.5',
  };

  // Color theme based on progress milestone
  let gradientColor = 'from-slate-400 to-slate-500';
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
  let glowColor = '';

  if (clamped >= 100) {
    gradientColor = 'from-emerald-500 via-teal-500 to-emerald-400';
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    glowColor = 'shadow-[0_0_12px_rgba(16,185,129,0.35)]';
  } else if (clamped >= 60) {
    gradientColor = 'from-brand-600 via-indigo-600 to-purple-500';
    badgeColor = 'bg-brand-50 text-brand-700 border-brand-200';
    glowColor = 'shadow-[0_0_12px_rgba(99,102,241,0.35)]';
  } else if (clamped >= 25) {
    gradientColor = 'from-amber-500 via-amber-600 to-orange-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    glowColor = 'shadow-[0_0_12px_rgba(245,158,11,0.35)]';
  } else if (clamped > 0) {
    gradientColor = 'from-sky-500 via-blue-500 to-indigo-500';
    badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="text-slate-600 font-medium truncate pr-2 text-[11px] tracking-tight">
            {label}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold tabular-nums shadow-soft-xs transition-colors duration-200 ${badgeColor} shrink-0`}
          >
            {clamped}%
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div
        className={`w-full bg-slate-100/90 border border-slate-200/90 rounded-full overflow-hidden p-[1px] shadow-inner ${heightClasses[size] || heightClasses.md}`}
      >
        {/* Animated Progress Fill with Shimmer Sheen */}
        <div
          className={`h-full rounded-full bg-gradient-to-r relative overflow-hidden ${gradientColor} ${glowColor} transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        >
          {clamped > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

