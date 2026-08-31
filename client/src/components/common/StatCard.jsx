import React from 'react';

const colorStyles = {
  blue: {
    bg: 'from-blue-50/70 to-indigo-50/30 border-blue-200/70 hover:border-blue-300',
    iconBg: 'bg-blue-100 text-blue-600 border-blue-200',
    glow: 'group-hover:shadow-[0_6px_16px_rgba(59,130,246,0.08)]',
  },
  amber: {
    bg: 'from-amber-50/70 to-orange-50/30 border-amber-200/70 hover:border-amber-300',
    iconBg: 'bg-amber-100 text-amber-600 border-amber-200',
    glow: 'group-hover:shadow-[0_6px_16px_rgba(245,158,11,0.08)]',
  },
  emerald: {
    bg: 'from-emerald-50/70 to-teal-50/30 border-emerald-200/70 hover:border-emerald-300',
    iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    glow: 'group-hover:shadow-[0_6px_16px_rgba(16,185,129,0.08)]',
  },
  purple: {
    bg: 'from-purple-50/70 to-fuchsia-50/30 border-purple-200/70 hover:border-purple-300',
    iconBg: 'bg-purple-100 text-purple-600 border-purple-200',
    glow: 'group-hover:shadow-[0_6px_16px_rgba(168,85,247,0.08)]',
  },
  rose: {
    bg: 'from-rose-50/70 to-pink-50/30 border-rose-200/70 hover:border-rose-300',
    iconBg: 'bg-rose-100 text-rose-600 border-rose-200',
    glow: 'group-hover:shadow-[0_6px_16px_rgba(244,63,94,0.08)]',
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
      className={`group relative overflow-hidden rounded-xl border bg-gradient-to-b p-4 backdrop-blur-md transition-all duration-200 shadow-sm ${style.bg} ${style.glow} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 font-mono">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-slate-500 flex items-center gap-1 font-medium line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm ${style.iconBg} shrink-0 transition-transform group-hover:scale-105`}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
