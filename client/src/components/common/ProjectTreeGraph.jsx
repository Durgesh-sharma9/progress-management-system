import React, { useState } from 'react';
import ProjectTypeBadge from './ProjectTypeBadge';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  GitBranch,
  ChevronDown,
  ChevronRight,
  User,
  Sparkles,
  Check,
  Code2,
  Layers,
} from 'lucide-react';

/**
 * Authentic Tree-Pipe Flowchart Graph Component
 * Visualizes Project Root ➔ Developer Branches ➔ Milestone Leaf Nodes
 * with connected pipe elbows, clean typography, and prominent developer notes.
 */
const ProjectTreeGraph = ({
  project,
  phases = [],
  onTogglePhase,
  onPhaseClick,
  currentUserId,
}) => {
  const [collapsedDevs, setCollapsedDevs] = useState({});

  const toggleCollapse = (devId) => {
    setCollapsedDevs((prev) => ({
      ...prev,
      [devId]: !prev[devId],
    }));
  };

  const developers = project?.developers || [];
  const totalProjectPhases = phases.length;
  const completedProjectPhases = phases.filter((p) => p.completed).length;
  const overallProgress =
    totalProjectPhases > 0
      ? Math.round((completedProjectPhases / totalProjectPhases) * 100)
      : 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-soft space-y-7 overflow-x-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-soft-md shadow-brand-500/25 shrink-0">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Project Tree Pipeline Flowchart
              </h3>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-soft-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Tree
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Flow: <strong className="text-slate-700">Root Node</strong> ➔ <strong className="text-slate-700">Engineer Branches</strong> ➔ <strong className="text-slate-700">Deliverables</strong>
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-soft-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            {completedProjectPhases} Delivered
          </span>
          <span className="flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full shadow-soft-xs">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            {totalProjectPhases - completedProjectPhases} In Progress
          </span>
        </div>
      </div>

      {/* TREE PIPE STRUCTURE CONTAINER */}
      <div className="min-w-[620px] py-2">
        {/* 1. ROOT NODE (PROJECT) */}
        <div className="inline-flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 text-white shadow-soft-lg border border-slate-800 min-w-[320px] max-w-[500px]">
          <div className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-brand-300 shrink-0 border border-white/20">
            <FolderGit2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-300">
                Project Root
              </span>
              <ProjectTypeBadge
                projectType={project?.projectType}
                memberCount={developers.length}
                showCount={true}
                size="xs"
              />
            </div>
            <h4 className="font-extrabold text-base truncate text-white">
              {project?.name || 'Project'}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300 font-medium">
              <span>{completedProjectPhases}/{totalProjectPhases} Phases Done</span>
              <span className="text-emerald-400 font-bold font-mono">({overallProgress}%)</span>
            </div>
          </div>
        </div>

        {/* 2. DEVELOPER BRANCHES */}
        {developers.length === 0 ? (
          <div className="ml-8 mt-4 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400 font-medium max-w-sm">
            No developers assigned to this project yet.
          </div>
        ) : (
          <div className="relative ml-5 sm:ml-6 mt-0 border-l-2 border-indigo-400 pt-5 space-y-6">
            {developers.map((dev, devIndex) => {
              const devPhases = phases.filter(
                (p) => (p.developerId?._id || p.developerId) === dev._id
              );
              const devTotal = devPhases.length;
              const devDone = devPhases.filter((p) => p.completed).length;
              const devProgress =
                devTotal > 0 ? Math.round((devDone / devTotal) * 100) : 0;
              const isMe = dev._id === currentUserId;
              const isCollapsed = collapsedDevs[dev._id];

              return (
                <div key={dev._id} className="relative pl-7 sm:pl-8">
                  {/* Pipe Horizontal Branch connecting to Developer Node */}
                  <div className="absolute left-0 top-6 w-7 sm:w-8 h-0.5 bg-indigo-400" />
                  <div className="absolute left-[-5px] top-[20px] h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />

                  {/* DEVELOPER NODE CARD */}
                  <div
                    onClick={() => toggleCollapse(dev._id)}
                    className={`inline-flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 shadow-soft-xs ${
                      isMe
                        ? 'bg-gradient-to-r from-brand-50 via-white to-white border-brand-300 hover:border-brand-500 hover:shadow-soft'
                        : 'bg-white border-slate-200 hover:border-brand-300 hover:shadow-soft'
                    } min-w-[280px] max-w-[380px]`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-soft-xs shrink-0">
                        {dev.name ? dev.name.charAt(0).toUpperCase() : 'D'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-extrabold text-sm text-slate-900 truncate">
                            {dev.name}
                          </h5>
                          {isMe && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-brand-50 text-brand-700 border border-brand-200">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                          {dev.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                        {devDone}/{devTotal}
                      </span>
                      <span className="text-slate-400 hover:text-slate-700">
                        {isCollapsed ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* 3. DELIVERABLE LEAF NODES */}
                  {!isCollapsed && (
                    <div className="relative ml-4 sm:ml-5 mt-3 border-l-2 border-indigo-200 pt-2 pb-1 space-y-3.5">
                      {devPhases.length === 0 ? (
                        <div className="relative pl-6 py-2 text-xs text-slate-400 italic font-medium">
                          <div className="absolute left-0 top-1/2 w-6 h-0.5 bg-slate-200" />
                          No deliverables created for this developer yet.
                        </div>
                      ) : (
                        devPhases.map((phase, idx) => (
                          <div key={phase._id} className="relative pl-6 sm:pl-7">
                            {/* Horizontal pipe connecting to phase leaf */}
                            <div className="absolute left-0 top-5 w-6 sm:w-7 h-0.5 bg-indigo-200" />
                            <div className="absolute left-[-4px] top-[17px] h-2 w-2 rounded-full bg-indigo-400 ring-2 ring-indigo-100" />

                            {/* LEAF CARD */}
                            <div
                              onClick={() =>
                                onPhaseClick
                                  ? onPhaseClick(phase)
                                  : onTogglePhase && onTogglePhase(phase._id)
                              }
                              className={`flex flex-col p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer shadow-soft-xs ${
                                phase.completed
                                  ? 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-400 hover:shadow-soft'
                                  : 'bg-white border-slate-200 hover:border-brand-400 hover:shadow-soft'
                              } min-w-[300px] max-w-[500px]`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                  {/* Checkbox / Step Pill */}
                                  <div className="shrink-0 mt-0.5">
                                    {onTogglePhase ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onTogglePhase(phase._id);
                                        }}
                                        className="transition-transform active:scale-90 cursor-pointer"
                                        title="Click to toggle status"
                                      >
                                        {phase.completed ? (
                                          <div className="h-6 w-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-soft-xs">
                                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                                          </div>
                                        ) : (
                                          <div className="h-6 w-6 rounded-lg border-2 border-slate-300 bg-white hover:border-brand-500 flex items-center justify-center font-mono font-bold text-[11px] text-slate-600">
                                            {idx + 1}
                                          </div>
                                        )}
                                      </button>
                                    ) : (
                                      <div
                                        className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                                          phase.completed
                                            ? 'bg-emerald-600 text-white'
                                            : 'border-2 border-slate-300 bg-white font-mono text-[11px] text-slate-600'
                                        }`}
                                      >
                                        {phase.completed ? (
                                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                                        ) : (
                                          idx + 1
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Phase Title */}
                                  <div className="min-w-0 flex-1">
                                    <h6 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                                      {phase.title}
                                    </h6>
                                    {phase.description && (
                                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                        {phase.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Status Pill */}
                                <div className="shrink-0">
                                  {phase.completed ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-soft-xs">
                                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                      Done
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full shadow-soft-xs">
                                      <Clock className="h-3 w-3 text-amber-600" />
                                      Pending
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Prominent Developer Note Container */}
                              {phase.notes && (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onPhaseClick) onPhaseClick(phase);
                                  }}
                                  className="mt-2.5 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 hover:bg-amber-100/80 transition-colors shadow-soft-xs"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                                      <Code2 className="h-3 w-3" />
                                      Dev Work Note / Log:
                                    </span>
                                    <span className="text-[10px] font-bold text-amber-800 underline hover:text-amber-950">
                                      View Full ➔
                                    </span>
                                  </div>
                                  <p className="font-mono text-[11px] text-amber-900 whitespace-pre-wrap leading-relaxed">
                                    {phase.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTreeGraph;
