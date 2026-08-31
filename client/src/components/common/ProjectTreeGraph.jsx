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
    <div className="bg-gradient-to-b from-white to-slate-50/80 rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm overflow-hidden space-y-4">
      {/* Tree Graph Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Project Tree Flow
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Live
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Hierarchical flow: Project ➔ Developers ➔ Phases
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Done
          </span>
          <span className="flex items-center gap-1 font-medium text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Pending
          </span>
        </div>
      </div>

      {/* Tree Flow Visual Container (Horizontal Scrolling on mobile) */}
      <div className="overflow-x-auto pb-2 pt-1">
        <div className="min-w-[550px] space-y-4">
          {/* LEVEL 1: ROOT NODE (PROJECT) */}
          <div className="flex items-center">
            <div className="relative z-10 flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 text-white shadow-md shadow-brand-600/20 border border-white/20 min-w-[240px]">
              <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/30">
                <FolderGit2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-brand-100 block">
                  Project Root
                </span>
                <h4 className="font-bold text-xs truncate text-white">
                  {project?.name || 'Project'}
                </h4>
                <div className="flex items-center justify-between mt-0.5 text-[10px] text-brand-100 font-medium">
                  <span>{completedProjectPhases}/{totalProjectPhases} Phases</span>
                  <span className="font-mono bg-white/20 px-1.5 py-0.2 rounded-full font-bold">
                    {overallProgress}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LEVEL 2 & 3: DEVELOPERS & PHASES */}
          {developers.length === 0 ? (
            <div className="ml-8 p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[11px] text-slate-400">
              No developers assigned yet.
            </div>
          ) : (
            <div className="relative pl-5 sm:pl-6 space-y-4 before:absolute before:left-4 sm:before:left-5 before:top-0 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-brand-500 before:via-indigo-300 before:to-slate-200">
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
                  <div key={dev._id} className="relative space-y-2.5">
                    {/* Horizontal Branch Line connecting root spine to Dev Node */}
                    <div className="absolute -left-5 sm:-left-6 top-4 w-5 sm:w-6 h-0.5 bg-indigo-300" />

                    {/* DEVELOPER NODE */}
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => toggleCollapse(dev._id)}
                        className={`flex items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-lg border cursor-pointer transition-all shadow-sm ${
                          isMe
                            ? 'bg-gradient-to-r from-brand-50 via-indigo-50/40 to-white border-brand-300 hover:border-brand-400'
                            : 'bg-white border-slate-200 hover:border-indigo-300'
                        } min-w-[220px] max-w-[290px]`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`h-7 w-7 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                              isMe
                                ? 'bg-brand-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {dev.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold text-[11px] text-slate-900 truncate flex items-center gap-1">
                              {dev.name}
                              {isMe && (
                                <span className="text-[9px] text-brand-600 font-bold bg-brand-100 px-1 py-0.1 rounded">
                                  You
                                </span>
                              )}
                            </h5>
                            <p className="text-[10px] text-slate-500 truncate">
                              {devDone}/{devTotal} Phases
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-mono font-bold text-slate-700">
                            {devProgress}%
                          </span>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {isCollapsed ? (
                              <ChevronRight className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* LEVEL 3: LEAF NODES (PHASES CHECKLIST) */}
                    {!isCollapsed && (
                      <div className="relative pl-6 sm:pl-7 space-y-2 before:absolute before:left-4 sm:before:left-5 before:top-0 before:bottom-3 before:w-0.5 before:bg-slate-200">
                        {devPhases.length === 0 ? (
                          <div className="relative p-2 rounded-lg border border-dashed border-slate-200 text-[10px] text-slate-400 italic">
                            {/* Branch link */}
                            <div className="absolute -left-6 sm:-left-7 top-3 w-6 sm:w-7 h-0.5 bg-slate-200" />
                            No phases created yet
                          </div>
                        ) : (
                          devPhases.map((phase) => (
                            <div
                              key={phase._id}
                              className="relative flex items-center"
                            >
                              {/* Horizontal Branch connecting dev spine to Phase Leaf */}
                              <div className="absolute -left-6 sm:-left-7 top-1/2 -translate-y-1/2 w-6 sm:w-7 h-0.5 bg-slate-200" />

                              {/* Phase Leaf Node */}
                              <div
                                onClick={() => onTogglePhase && onTogglePhase(phase._id)}
                                className={`group flex items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-lg border transition-all cursor-pointer shadow-sm ${
                                  phase.completed
                                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                                    : 'bg-white border-slate-200 hover:border-brand-400 hover:shadow-sm'
                                } min-w-[240px] max-w-[360px]`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
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
                                      className={`text-[11px] font-semibold truncate ${
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
                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded flex items-center gap-1 shrink-0">
                                      <CheckCircle2 className="h-2.5 w-2.5" />
                                      Done
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded flex items-center gap-1 shrink-0">
                                      <Clock className="h-2.5 w-2.5" />
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
