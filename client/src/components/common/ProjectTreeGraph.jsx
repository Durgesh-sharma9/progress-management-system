import React, { useState } from 'react';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  CheckSquare,
  Square,
  GitBranch,
  ChevronDown,
  ChevronRight,
  User,
  Sparkles,
} from 'lucide-react';

/**
 * Compact Interactive Tree Graph Component
 * Visualizes Project -> Developers -> Phases with dense hierarchy,
 * glowing progress paths, and live interactive checkboxes on the leaf nodes.
 */
const ProjectTreeGraph = ({
  project,
  phases = [],
  onTogglePhase,
  currentUserId,
}) => {
  const [collapsedDevs, setCollapsedDevs] = useState({});

  const toggleCollapse = (devId) => {
    setCollapsedDevs((prev) => ({
      ...prev,
      [devId]: !prev[devId],
    }));
  };

  // Group phases by developer
  const developers = project?.developers || [];
  const totalProjectPhases = phases.length;
  const completedProjectPhases = phases.filter((p) => p.completed).length;
  const overallProgress =
    totalProjectPhases > 0
      ? Math.round((completedProjectPhases / totalProjectPhases) * 100)
      : 0;

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-soft space-y-5 overflow-hidden">
      {/* Tree Graph Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Project Workflow Flowchart
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                Live Flow
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive node topology: Project Root ➔ Assigned Engineers ➔ Deliverable Phases
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Completed
          </span>
          <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            In Progress
          </span>
        </div>
      </div>

      {/* Tree Flow Visual Container (Horizontal Scrolling on mobile) */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[580px] space-y-5">
          {/* LEVEL 1: ROOT NODE (PROJECT) */}
          <div className="flex items-center">
            <div className="relative z-10 flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 text-white shadow-soft-md shadow-brand-500/25 border border-white/20 min-w-[280px]">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/30">
                <FolderGit2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-100 block">
                  Root Node
                </span>
                <h4 className="font-bold text-sm truncate text-white">
                  {project?.name || 'Project'}
                </h4>
                <div className="flex items-center justify-between mt-1 text-[11px] text-brand-100 font-medium">
                  <span>{completedProjectPhases}/{totalProjectPhases} Total Phases</span>
                  <span className="font-mono bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    {overallProgress}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LEVEL 2 & 3: DEVELOPERS & PHASES */}
          {developers.length === 0 ? (
            <div className="ml-8 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-xs text-slate-400 font-medium">
              No developers assigned to this project yet.
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-5 sm:before:left-7 before:top-0 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-brand-500 before:via-indigo-300 before:to-slate-200">
              {developers.map((dev) => {
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
                  <div key={dev._id} className="relative space-y-3">
                    {/* Horizontal Branch Line connecting root spine to Dev Node */}
                    <div className="absolute -left-6 sm:-left-8 top-5 w-6 sm:w-8 h-0.5 bg-indigo-300" />

                    {/* DEVELOPER NODE */}
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => toggleCollapse(dev._id)}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 shadow-soft-xs ${
                          isMe
                            ? 'bg-gradient-to-r from-brand-50 via-indigo-50/50 to-white border-brand-300 hover:border-brand-500 hover:shadow-soft'
                            : 'bg-white border-slate-200 hover:border-brand-300 hover:shadow-soft'
                        } min-w-[250px] max-w-[320px]`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isMe
                                ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {dev.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                              {dev.name}
                              {isMe && (
                                <span className="text-[9px] text-brand-700 font-bold bg-brand-100 border border-brand-200 px-1.5 py-0.2 rounded-full">
                                  You
                                </span>
                              )}
                            </h5>
                            <p className="text-[11px] text-slate-500 truncate">
                              {devDone}/{devTotal} Completed
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                            devProgress === 100 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700 bg-slate-100'
                          }`}>
                            {devProgress}%
                          </span>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-slate-700 transition-transform"
                          >
                            {isCollapsed ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* LEVEL 3: LEAF NODES (PHASES CHECKLIST) */}
                    {!isCollapsed && (
                      <div className="relative pl-7 sm:pl-9 space-y-2.5 before:absolute before:left-5 sm:before:left-7 before:top-0 before:bottom-3 before:w-0.5 before:bg-slate-200">
                        {devPhases.length === 0 ? (
                          <div className="relative p-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-[11px] text-slate-400 italic">
                            {/* Branch link */}
                            <div className="absolute -left-7 sm:-left-9 top-1/2 -translate-y-1/2 w-7 sm:w-9 h-0.5 bg-slate-200" />
                            No phases created for this developer yet
                          </div>
                        ) : (
                          devPhases.map((phase) => (
                            <div
                              key={phase._id}
                              className="relative flex items-center"
                            >
                              {/* Horizontal Branch connecting dev spine to Phase Leaf */}
                              <div className="absolute -left-7 sm:-left-9 top-1/2 -translate-y-1/2 w-7 sm:w-9 h-0.5 bg-slate-200" />

                              {/* Phase Leaf Node */}
                              <div
                                onClick={() => onTogglePhase && onTogglePhase(phase._id)}
                                className={`group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer shadow-soft-xs ${
                                  phase.completed
                                    ? 'bg-emerald-50/60 border-emerald-200/90 text-emerald-950'
                                    : 'bg-white border-slate-200 hover:border-brand-400 hover:shadow-soft'
                                } min-w-[260px] max-w-[400px]`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onTogglePhase && onTogglePhase(phase._id);
                                    }}
                                    className="transition-transform active:scale-90 shrink-0"
                                    title="Click to toggle"
                                  >
                                    {phase.completed ? (
                                      <CheckSquare className="h-4 w-4 text-emerald-600 fill-emerald-100" />
                                    ) : (
                                      <Square className="h-4 w-4 text-slate-400 group-hover:text-brand-600" />
                                    )}
                                  </button>

                                  <div className="min-w-0">
                                    <p
                                      className={`text-xs font-semibold truncate ${
                                        phase.completed
                                          ? 'line-through text-slate-400'
                                          : 'text-slate-800'
                                      }`}
                                    >
                                      {phase.title}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  {phase.completed ? (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Done
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                      <Clock className="h-3 w-3" />
                                      Pending
                                    </span>
                                  )}
                                </div>
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
    </div>
  );
};

export default ProjectTreeGraph;

