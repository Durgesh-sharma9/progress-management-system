import React from 'react';

const techColorMap = {
  react: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'next.js': 'bg-slate-100 text-slate-800 border-slate-300',
  'vue.js': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'node.js': 'bg-green-50 text-green-700 border-green-200',
  'express.js': 'bg-slate-50 text-slate-700 border-slate-200',
  mongodb: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  postgresql: 'bg-blue-50 text-blue-700 border-blue-200',
  mysql: 'bg-orange-50 text-orange-700 border-orange-200',
  flutter: 'bg-sky-50 text-sky-700 border-sky-300',
  'react native': 'bg-cyan-50 text-cyan-800 border-cyan-300',
  kotlin: 'bg-purple-50 text-purple-700 border-purple-200',
  java: 'bg-amber-50 text-amber-800 border-amber-300',
  firebase: 'bg-amber-50 text-amber-700 border-amber-300',
  python: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  fastapi: 'bg-teal-50 text-teal-700 border-teal-200',
  django: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  tailwind: 'bg-sky-50 text-sky-600 border-sky-200',
  tailwindcss: 'bg-sky-50 text-sky-600 border-sky-200',
  html: 'bg-orange-50 text-orange-700 border-orange-200',
  'html5 / css3': 'bg-orange-50 text-orange-700 border-orange-200',
  javascript: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  typescript: 'bg-blue-50 text-blue-700 border-blue-200',
  docker: 'bg-blue-50 text-blue-700 border-blue-300',
};

const getTechStyle = (techName) => {
  const normalized = (techName || '').toLowerCase().trim();
  return (
    techColorMap[normalized] ||
    'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
  );
};

const TechStackPills = ({ techStack = [], max = 4, size = 'xs', className = '' }) => {
  if (!techStack || techStack.length === 0) return null;

  const displayList = max ? techStack.slice(0, max) : techStack;
  const remaining = max && techStack.length > max ? techStack.length - max : 0;

  const sizeClasses = {
    xs: 'px-1.5 py-0.2 text-[9px] rounded-md font-bold',
    sm: 'px-2 py-0.5 text-[10px] rounded-lg font-bold',
  };

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {displayList.map((tech, idx) => (
        <span
          key={idx}
          className={`inline-flex items-center border shadow-2xs font-mono transition-all ${getTechStyle(
            tech
          )} ${sizeClasses[size] || sizeClasses.xs}`}
        >
          {tech}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-[9px] font-bold text-slate-500 font-mono px-1 py-0.2 rounded bg-slate-100 border border-slate-200">
          +{remaining}
        </span>
      )}
    </div>
  );
};

export default TechStackPills;
