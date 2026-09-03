import React from 'react';

const colorStyles = {
  blue: {
    bg: 'from-blue-500/10 via-indigo-500/5 to-white',
    border: 'border-blue-200/80 hover:border-blue-300',
    iconBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/20',
    accentText: 'text-blue-600',
  },
  amber: {
    bg: 'from-amber-500/10 via-orange-500/5 to-white',
    border: 'border-amber-200/80 hover:border-amber-300',
    iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-amber-500/20',
    accentText: 'text-amber-600',
  },
  emerald: {
    bg: 'from-emerald-500/10 via-teal-500/5 to-white',
    border: 'border-emerald-200/80 hover:border-emerald-300',
    iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-emerald-500/20',
    accentText: 'text-emerald-600',
  },
  purple: {
    bg: 'from-purple-500/10 via-fuchsia-500/5 to-white',
    border: 'border-purple-200/80 hover:border-purple-300',
    iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-500/20',
    accentText: 'text-purple-600',
  },
  rose: {
    bg: 'from-rose-500/10 via-pink-500/5 to-white',
    border: 'border-rose-200/80 hover:border-rose-300',
    iconBg: 'bg-gradient-to-tr from-rose-600 to-pink-600 text-white shadow-rose-500/20',
    accentText: 'text-rose-600',
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
      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border bg-gradient-to-b p-2.5 sm:p-3.5 backdrop-blur-md transition-all duration-200 shadow-soft-xs ${style.bg} ${style.border} hover:shadow-soft-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
            {title}
          </p>
          <h3 className="mt-0.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 font-mono">
            {value}
          </h3>
        </div>
        {Icon && (
          <div
            className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl shadow-xs ${style.iconBg} shrink-0 transition-transform duration-200 group-hover:scale-105`}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        )}
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-1">
        {subtitle && (
          <p className="text-[9px] sm:text-[10px] text-slate-500 truncate font-medium">
            {subtitle}
          </p>
        )}
        {trend && (
          <span className="text-[8px] sm:text-[9px] font-bold text-slate-600 bg-white/90 border border-slate-200/80 px-1.5 py-0.2 rounded-full shrink-0 shadow-2xs">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
