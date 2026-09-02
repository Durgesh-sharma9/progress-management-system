import React from 'react';

const colorStyles = {
  blue: {
    bg: 'from-blue-500/10 via-indigo-500/5 to-white',
    border: 'border-blue-200/70 hover:border-blue-400/80',
    iconBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/25',
    accentText: 'text-blue-600',
    glow: 'hover:shadow-[0_8px_25px_-5px_rgba(59,130,246,0.15)]',
  },
  amber: {
    bg: 'from-amber-500/10 via-orange-500/5 to-white',
    border: 'border-amber-200/70 hover:border-amber-400/80',
    iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-amber-500/25',
    accentText: 'text-amber-600',
    glow: 'hover:shadow-[0_8px_25px_-5px_rgba(245,158,11,0.15)]',
  },
  emerald: {
    bg: 'from-emerald-500/10 via-teal-500/5 to-white',
    border: 'border-emerald-200/70 hover:border-emerald-400/80',
    iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-emerald-500/25',
    accentText: 'text-emerald-600',
    glow: 'hover:shadow-[0_8px_25px_-5px_rgba(16,185,129,0.15)]',
  },
  purple: {
    bg: 'from-purple-500/10 via-fuchsia-500/5 to-white',
    border: 'border-purple-200/70 hover:border-purple-400/80',
    iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-500/25',
    accentText: 'text-purple-600',
    glow: 'hover:shadow-[0_8px_25px_-5px_rgba(168,85,247,0.15)]',
  },
  rose: {
    bg: 'from-rose-500/10 via-pink-500/5 to-white',
    border: 'border-rose-200/70 hover:border-rose-400/80',
    iconBg: 'bg-gradient-to-tr from-rose-600 to-pink-600 text-white shadow-rose-500/25',
    accentText: 'text-rose-600',
    glow: 'hover:shadow-[0_8px_25px_-5px_rgba(244,63,94,0.15)]',
  },
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  className = '',
}) => {
  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-b p-5 backdrop-blur-md transition-all duration-300 shadow-soft ${style.bg} ${style.border} ${style.glow} hover:-translate-y-1 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1 font-medium line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-md ${style.iconBg} shrink-0 transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-1 rounded-full w-fit">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

