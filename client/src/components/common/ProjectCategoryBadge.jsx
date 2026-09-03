import React from 'react';
import { Globe, Smartphone, Layout, Server, Code } from 'lucide-react';

const categoryConfigs = {
  'Web App': {
    icon: Globe,
    label: 'Web App',
    color: 'bg-blue-50 text-blue-700 border-blue-200/90',
    iconColor: 'text-blue-600',
  },
  'Android App': {
    icon: Smartphone,
    label: 'Android App',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
    iconColor: 'text-emerald-600',
  },
  'General Website': {
    icon: Layout,
    label: 'Website',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200/90',
    iconColor: 'text-indigo-600',
  },
  'Backend API': {
    icon: Server,
    label: 'Backend API',
    color: 'bg-amber-50 text-amber-700 border-amber-200/90',
    iconColor: 'text-amber-600',
  },
  'Other': {
    icon: Code,
    label: 'Custom App',
    color: 'bg-slate-50 text-slate-700 border-slate-200/90',
    iconColor: 'text-slate-600',
  },
};

const ProjectCategoryBadge = ({ category = 'Web App', size = 'xs', className = '' }) => {
  const config = categoryConfigs[category] || categoryConfigs['Web App'];
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'px-1.5 py-0.2 text-[9px] gap-1 rounded-md',
    sm: 'px-2 py-0.5 text-[10px] gap-1 rounded-lg',
    md: 'px-2.5 py-1 text-xs gap-1.5 rounded-xl',
  };

  const iconSizes = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
  };

  return (
    <span
      className={`inline-flex items-center font-extrabold border shadow-2xs ${config.color} ${sizeClasses[size] || sizeClasses.xs} ${className}`}
    >
      <Icon className={`${iconSizes[size] || iconSizes.xs} ${config.iconColor} shrink-0`} />
      <span>{config.label}</span>
    </span>
  );
};

export default ProjectCategoryBadge;
