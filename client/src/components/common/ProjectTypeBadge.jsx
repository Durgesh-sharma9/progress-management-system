import React from 'react';
import { User, Users, Shield, Sparkles } from 'lucide-react';

const ProjectTypeBadge = ({
  projectType = 'Standalone',
  memberCount = null,
  size = 'sm',
  showCount = false,
  className = '',
}) => {
  const isGroup =
    projectType?.toLowerCase() === 'group' || (memberCount && memberCount > 1);

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-1 text-[11px] gap-1.5',
    md: 'px-3 py-1.5 text-xs gap-1.5',
    lg: 'px-3.5 py-2 text-sm gap-2 font-bold',
  };

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-4.5 w-4.5',
  };

  if (isGroup) {
    return (
      <span
        className={`inline-flex items-center rounded-xl font-bold tracking-tight border transition-all duration-200 shadow-soft-xs bg-gradient-to-r from-purple-50 to-indigo-50/80 text-purple-700 border-purple-200/90 hover:border-purple-300 ${sizeClasses[size] || sizeClasses.sm} ${className}`}
        title="Group Project: Multi-developer team collaboration"
      >
        <Users className={`${iconSizes[size] || iconSizes.sm} text-purple-600 shrink-0`} />
        <span>Group Project</span>
        {showCount && memberCount !== null && (
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-purple-200/70 text-purple-800 text-[10px] font-extrabold font-mono">
            {memberCount}
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-xl font-bold tracking-tight border transition-all duration-200 shadow-soft-xs bg-gradient-to-r from-sky-50 to-blue-50/80 text-sky-700 border-sky-200/90 hover:border-sky-300 ${sizeClasses[size] || sizeClasses.sm} ${className}`}
      title="Standalone Project: Individual solo developer assignment"
    >
      <User className={`${iconSizes[size] || iconSizes.sm} text-sky-600 shrink-0`} />
      <span>Standalone</span>
      {showCount && (
        <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-sky-200/70 text-sky-800 text-[10px] font-extrabold font-mono">
          Solo
        </span>
      )}
    </span>
  );
};

export default ProjectTypeBadge;
