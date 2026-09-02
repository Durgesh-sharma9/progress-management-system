import React, { useState } from 'react';
import ProjectTypeBadge from './ProjectTypeBadge';
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
  FileText,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';

/**
 * Modern Interactive Roadmap & Flowchart Tree Component
 * Visualizes Project -> Developers -> Milestone Deliverables with crisp typography,
 * sequential numbered milestones, glowing progress badges, and prominently visible work notes.
 */
const ProjectTreeGraph = ({
  project,
  phases = [],
  onTogglePhase,
  onPhaseClick,
  currentUserId,
}) => {
  const [collapsedDevs, setCollapsedDevs] = useState({});
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'pending' | 'completed'

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
    <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-soft space-y-6 overflow-hidden border border-slate-200/90 bg-white">
      {/* Tree Graph Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-soft-md shadow-brand-500/25">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Project Workflow Roadmap
              </h3>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Flow
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual hierarchy: <strong className="text-slate-700">Project Root</strong> ➔ <strong className="text-slate-700">Engineers</strong> ➔ <strong className="text-slate-700">Milestone Steps & Dev Logs</strong>
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-slate-200/90 bg-slate-50/80 shadow-soft-xs">
          {[
            { id: 'all', label: `All (${phases.length})` },
            { id: 'completed', label: `Completed (${completedProjectPhases})` },
            { id: 'pending', label: `Pending (${totalProjectPhases - completedProjectPhases})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                filterMode === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Tree Body */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div className="min-w-[640px] space-y-7">
          {/* LEVEL 1: ROOT NODE (PROJECT ROOT) */}
          <div className="flex items-center">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 text-white shadow-soft-lg border border-slate-800 min-w-[340px] max-w-[580px]">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-11 w-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/20 shadow-inner">
                  <FolderGit2 className="h-5 w-5 text-brand-300" />
                </div>
                <div className="min-w-0">
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
                </div>
              </div>

              <div className="flex items-center gap-3 pl-3 border-l border-white/10 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Completion</p>
                  <p className="text-base font-extrabold text-emerald-400 font-mono">
                    {overallProgress}%
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-slate-200">
                  {completedProjectPhases}/{totalProjectPhases} Milestones
                </span>
              </div>
            </div>
          </div>

          {/* LEVEL 2: DEVELOPER BRANCHES & LEAF PHASES */}
          {developers.length === 0 ? (
            <div className="ml-8 p-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500 font-semibold">
              No engineers assigned to this project yet.
            </div>
          ) : (
            <div className="relative pl-8 sm:pl-10 space-y-7 before:absolute before:left-6 sm:before:left-7 before:top-0 before:bottom-4 before:w-1 before:bg-gradient-to-b before:from-brand-600 before:via-indigo-400 before:to-slate-300 before:rounded-full">
              {developers.map((dev) => {
                const allDevPhases = phases.filter(
                  (p) => (p.developerId?._id || p.developerId) === dev._id
                );

                // Apply active filter tab
                const devPhases = allDevPhases.filter((p) => {
                  if (filterMode === 'completed') return p.completed;
                  if (filterMode === 'pending') return !p.completed;
                  return true;
                });

                const devTotal = allDevPhases.length;
                const devDone = allDevPhases.filter((p) => p.completed).length;
                const devProgress =
                  devTotal > 0 ? Math.round((devDone / devTotal) * 100) : 0;
                const isMe = dev._id === currentUserId;
                const isCollapsed = collapsedDevs[dev._id];

                return (
                  <div key={dev._id} className="relative space-y-4">
                    {/* Horizontal Branch connecting Main Spine to Developer Node */}
                    <div className="absolute -left-8 sm:-left-10 top-6 w-8 sm:w-10 h-0.5 bg-indigo-400 rounded-full" />

                    {/* DEVELOPER NODE CARD */}
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => toggleCollapse(dev._id)}
                        className={`flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all duration-200 shadow-soft-xs ${
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
                              <h5 className="font-bold text-sm text-slate-900 truncate">
                                {dev.name}
                              </h5>
                              {isMe && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-brand-50 text-brand-700 border border-brand-200">
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
                          <span className="text-slate-400 hover:text-slate-700 transition-colors">
                            {isCollapsed ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* LEVEL 3: MILESTONE DELIVERABLES LIST */}
                    {!isCollapsed && (
                      <div className="relative pl-8 sm:pl-10 space-y-3.5 before:absolute before:left-5 sm:before:left-6 before:top-0 before:bottom-3 before:w-0.5 before:bg-indigo-200 before:rounded-full">
                        {devPhases.length === 0 ? (
                          <div className="relative flex items-center text-xs text-slate-400 italic py-2 pl-2">
                            <div className="absolute -left-8 sm:-left-10 top-1/2 -translate-y-1/2 w-8 sm:w-10 h-0.5 bg-slate-200" />
                            {filterMode === 'all'
                              ? 'No deliverable phases created for this engineer yet.'
                              : `No ${filterMode} phases found.`}
                          </div>
                        ) : (
                          devPhases.map((phase, idx) => (
                            <div key={phase._id} className="relative flex items-center">
                              {/* Horizontal connector line */}
                              <div className="absolute -left-8 sm:-left-10 top-7 w-8 sm:w-10 h-0.5 bg-indigo-200" />

                              {/* MILESTONE CARD */}
                              <div
                                onClick={() =>
                                  onPhaseClick
                                    ? onPhaseClick(phase)
                                    : onTogglePhase && onTogglePhase(phase._id)
                                }
                                className={`group flex flex-col p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer shadow-soft-xs ${
                                  phase.completed
                                    ? 'bg-emerald-50/40 border-emerald-300/80 hover:border-emerald-400 hover:shadow-soft'
                                    : 'bg-white border-slate-200/90 hover:border-brand-400 hover:shadow-soft'
                                } min-w-[320px] max-w-[520px] w-full`}
                              >
                                {/* Milestone Top Bar */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 min-w-0 flex-1">
                                    {/* Number / Checkmark Step Pill */}
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
                                              ✓
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
                                          {phase.completed ? '✓' : idx + 1}
                                        </div>
                                      )}
                                    </div>

                                    {/* Phase Title & Description */}
                                    <div className="min-w-0 flex-1">
                                      <h6 className="text-sm font-bold text-slate-900 leading-snug">
                                        {phase.title}
                                      </h6>
                                      {phase.description && (
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                          {phase.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Status Pill Badge */}
                                  <div className="shrink-0">
                                    {phase.completed ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-soft-xs">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        Delivered
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full shadow-soft-xs">
                                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                                        In Progress
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* ATTACHED WORK NOTES (Prominently Rendered) */}
                                {phase.notes && (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onPhaseClick) onPhaseClick(phase);
                                    }}
                                    className="mt-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-950 hover:bg-amber-100/80 transition-colors shadow-soft-xs"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        Dev Work Note / Verification Log:
                                      </span>
                                      <span className="text-[10px] font-bold text-amber-800 underline">
                                        Click to view full ➔
                                      </span>
                                    </div>
                                    <p className="font-mono text-xs text-amber-900 whitespace-pre-wrap leading-relaxed">
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
    </div>
  );
};

export default ProjectTreeGraph;
