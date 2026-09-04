import React, { useState } from 'react';
import ProjectTypeBadge from './ProjectTypeBadge';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  GitBranch,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  User,
  Sparkles,
  Check,
  Code2,
  Layers,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
} from 'lucide-react';

/**
 * Authentic Tree-Pipe Flowchart Graph Component
 * Fully Mobile-Responsive & Touch-Optimized
 * Visualizes Project Root ➔ Developer Branches ➔ Milestone Leaf Nodes
 * with connected pipe elbows, reordering (Move Up/Down), and In-Between Phase insertion.
 */
const ProjectTreeGraph = ({
  project,
  phases = [],
  onTogglePhase,
  onPhaseClick,
  onMovePhase,
  onInsertPhase,
  onEditPhase,
  onDeletePhase,
  currentUserId,
}) => {
  const [collapsedDevs, setCollapsedDevs] = useState({});
  const [expandedNotePhaseId, setExpandedNotePhaseId] = useState(null);

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
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-2.5 sm:p-6 lg:p-8 shadow-soft space-y-3 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-100 pb-3 sm:pb-5">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-soft-md shadow-brand-500/25 shrink-0">
            <GitBranch className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h3 className="text-xs sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Project Tree Flowchart
              </h3>
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-soft-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Tree
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">
              Flow: <strong className="text-slate-700">Root</strong> ➔ <strong className="text-slate-700">Branches</strong> ➔ <strong className="text-slate-700">Phases</strong>
            </p>
          </div>
        </div>

        {/* Action Indicators */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] sm:text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            {completedProjectPhases} / {totalProjectPhases} Complete ({overallProgress}%)
          </span>
        </div>
      </div>

      {/* Main Tree Flow Pipeline Area */}
      <div className="relative pl-0.5 sm:pl-2">
        {/* 1. ROOT NODE (The Project) */}
        <div className="relative z-10 flex items-start gap-2 sm:gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-soft-lg border border-slate-800 w-full max-w-full sm:max-w-xl">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <FolderGit2 className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-brand-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-brand-300">
                    Project Root
                  </span>
                  <ProjectTypeBadge
                    type={project?.projectType || (developers.length > 1 ? 'Group' : 'Standalone')}
                    size="xs"
                    showCount={true}
                    memberCount={developers.length}
                  />
                </div>
                <h4 className="text-xs sm:text-base font-extrabold tracking-tight truncate text-white mt-0.5">
                  {project?.name}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5">
                  {completedProjectPhases}/{totalProjectPhases} Phases Done ({overallProgress}%)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tree Empty Fallback */}
        {developers.length === 0 ? (
          <div className="ml-3 sm:ml-7 mt-3 p-3.5 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
            No developers assigned to this workspace yet.
          </div>
        ) : (
          /* Vertical Trunk Pipe from Project Root */
          <div className="relative ml-2 sm:ml-5 border-l-2 border-slate-300 pt-2 pb-2 space-y-3 sm:space-y-6">
            {developers.map((dev) => {
              const isCollapsed = !!collapsedDevs[dev._id];
              const isMe = currentUserId && (dev._id === currentUserId || dev._id === currentUserId._id);
              const devPhases = phases.filter(
                (p) =>
                  (p.developerId?._id || p.developerId)?.toString() ===
                  dev._id.toString()
              );
              const completedCount = devPhases.filter((p) => p.completed).length;
              const devProgress =
                devPhases.length > 0
                  ? Math.round((completedCount / devPhases.length) * 100)
                  : 0;

              return (
                <div key={dev._id} className="relative pl-2.5 sm:pl-7 group/branch">
                  {/* Horizontal Branch Pipe to Developer Node */}
                  <div className="absolute left-0 top-4 sm:top-5 w-2.5 sm:w-7 h-0.5 bg-slate-300" />
                  <div className="absolute left-[-4px] top-[13px] sm:top-[17px] h-2 sm:h-2.5 w-2 sm:w-2.5 rounded-full bg-indigo-500 ring-2 sm:ring-4 ring-white" />

                  {/* 2. DEVELOPER BRANCH NODE */}
                  <div
                    onClick={() => toggleCollapse(dev._id)}
                    className={`flex items-center justify-between gap-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer w-full max-w-full sm:max-w-lg shadow-soft-xs ${
                      isMe
                        ? 'bg-gradient-to-r from-brand-50/90 via-indigo-50/50 to-white border-brand-300 hover:border-brand-400'
                        : 'bg-slate-50/90 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-soft-xs">
                        {dev.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                            {dev.name}
                          </h5>
                          {isMe && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-brand-500 text-white">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate hidden sm:block">
                          {dev.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <span className="text-[9px] sm:text-[10px] font-bold font-mono px-1.5 sm:px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                        {completedCount}/{devPhases.length} ({devProgress}%)
                      </span>
                      <span className="text-slate-400 hover:text-slate-700">
                        {isCollapsed ? (
                          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* 3. DELIVERABLE LEAF NODES */}
                  {!isCollapsed && (
                    <div className="relative ml-1 sm:ml-4 mt-2 border-l-2 border-indigo-200 pt-1 pb-1 space-y-2">
                      {/* Top Insert Button (Insert at Position #1) */}
                      {onInsertPhase && (!currentUserId || isMe) && (
                        <div className="relative pl-2.5 sm:pl-7 pb-1 pt-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onInsertPhase(dev._id, 0);
                            }}
                            title="Insert new phase at the very top (Position #1)"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-brand-700 bg-brand-50/90 hover:bg-brand-100 border border-dashed border-brand-300 hover:border-brand-400 transition-all shadow-2xs cursor-pointer active:scale-95"
                          >
                            <Plus className="h-3 w-3 text-brand-600" />
                            <span>+ Insert Phase at Start (#1)</span>
                          </button>
                        </div>
                      )}

                      {devPhases.length === 0 ? (
                        <div className="relative pl-2.5 sm:pl-6 py-2 text-[11px] text-slate-400 italic font-medium">
                          <div className="absolute left-0 top-1/2 w-2.5 sm:w-6 h-0.5 bg-slate-200" />
                          No deliverables created for this developer yet.
                        </div>
                      ) : (
                        devPhases.map((phase, idx) => (
                          <React.Fragment key={phase._id}>
                            <div className="relative pl-2.5 sm:pl-7 group/phase">
                              {/* Horizontal pipe connecting to phase leaf */}
                              <div className="absolute left-0 top-3.5 sm:top-5 w-2.5 sm:w-7 h-0.5 bg-indigo-200" />
                              <div className="absolute left-[-4px] top-[12px] sm:top-[17px] h-2 w-2 rounded-full bg-indigo-400 ring-2 ring-indigo-100" />

                              {/* LEAF CARD */}
                              <div
                                onClick={() => {
                                  if (onPhaseClick) {
                                    onPhaseClick(phase);
                                  } else if (onTogglePhase && (!currentUserId || isMe)) {
                                    onTogglePhase(phase._id);
                                  }
                                }}
                                className={`w-full max-w-full sm:max-w-lg flex flex-col p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 cursor-pointer shadow-soft-xs ${
                                  phase.completed
                                    ? 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-400 hover:shadow-soft'
                                    : 'bg-white border-slate-200 hover:border-brand-400 hover:shadow-soft'
                                }`}
                              >
                                {/* CARD MAIN ROW (Title + Status + Desktop Controls) */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2 min-w-0 flex-1">
                                    {/* Checkbox / Step Pill */}
                                    <div className="shrink-0 mt-0.5">
                                      {onTogglePhase && (!currentUserId || isMe) ? (
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
                                            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-md sm:rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-soft-xs">
                                              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" />
                                            </div>
                                          ) : (
                                            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-md sm:rounded-lg border-2 border-slate-300 bg-white hover:border-brand-500 flex items-center justify-center font-mono font-bold text-[10px] sm:text-[11px] text-slate-600">
                                              {idx + 1}
                                            </div>
                                          )}
                                        </button>
                                      ) : (
                                        <div
                                          className={`h-5 w-5 sm:h-6 sm:w-6 rounded-md sm:rounded-lg flex items-center justify-center font-bold text-xs ${
                                            phase.completed
                                              ? 'bg-emerald-600 text-white'
                                              : 'border-2 border-slate-200 bg-slate-100 font-mono text-[10px] sm:text-[11px] text-slate-500'
                                          }`}
                                          title={
                                            currentUserId && !isMe
                                              ? `Assigned to ${dev.name}. Only ${dev.name} can check off this task.`
                                              : undefined
                                          }
                                        >
                                          {phase.completed ? (
                                            <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" />
                                          ) : (
                                            idx + 1
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Phase Title & Description */}
                                    <div className="min-w-0 flex-1">
                                      <h6 className="text-[11.5px] sm:text-sm font-extrabold text-slate-900 leading-snug break-words">
                                        {phase.title}
                                      </h6>
                                      {phase.description && (
                                        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed break-words">
                                          {phase.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Top Right Status Badge (Both Mobile & Desktop) */}
                                  <div className="shrink-0 flex items-center gap-1">
                                    {phase.completed ? (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10.5px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.5 rounded-full shadow-soft-xs">
                                        <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-600" />
                                        Done
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10.5px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full shadow-soft-xs">
                                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-600" />
                                        Pending
                                      </span>
                                    )}

                                    {/* Desktop Action Toolbar */}
                                    <div className="hidden sm:flex items-center gap-1 ml-1">
                                      {/* Move Up/Down */}
                                      {onMovePhase && (!currentUserId || isMe) && (
                                        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 shadow-2xs">
                                          <button
                                            type="button"
                                            disabled={idx === 0}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onMovePhase(phase._id, 'up');
                                            }}
                                            title="Move Up"
                                            className="p-1 rounded text-slate-500 hover:text-brand-600 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent transition-all cursor-pointer"
                                          >
                                            <ChevronUp className="h-3.5 w-3.5 stroke-[2.5]" />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={idx === devPhases.length - 1}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onMovePhase(phase._id, 'down');
                                            }}
                                            title="Move Down"
                                            className="p-1 rounded text-slate-500 hover:text-brand-600 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent transition-all cursor-pointer"
                                          >
                                            <ChevronDown className="h-3.5 w-3.5 stroke-[2.5]" />
                                          </button>
                                        </div>
                                      )}

                                      {/* Edit & Delete */}
                                      {(!currentUserId || isMe) && (
                                        <div className="flex items-center gap-0.5">
                                          {onEditPhase && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onEditPhase(phase);
                                              }}
                                              title="Edit Phase"
                                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-all cursor-pointer"
                                            >
                                              <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                          )}
                                          {onDeletePhase && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onDeletePhase(phase);
                                              }}
                                              title="Delete Phase"
                                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* MOBILE ACTION TOOLBAR (Dedicated Touch Bar) */}
                                {(!currentUserId || isMe) && (
                                  <div className="flex sm:hidden items-center justify-between gap-1.5 mt-2 pt-1.5 border-t border-slate-100">
                                    {/* Mobile Move Up/Down Controls */}
                                    {onMovePhase ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onMovePhase(phase._id, 'up');
                                          }}
                                          title="Move Up"
                                          className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
                                        >
                                          <ArrowUp className="h-2.5 w-2.5" />
                                          <span>Up</span>
                                        </button>
                                        <button
                                          type="button"
                                          disabled={idx === devPhases.length - 1}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onMovePhase(phase._id, 'down');
                                          }}
                                          title="Move Down"
                                          className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
                                        >
                                          <ArrowDown className="h-2.5 w-2.5" />
                                          <span>Down</span>
                                        </button>
                                      </div>
                                    ) : <div />}

                                    {/* Mobile Edit & Delete Buttons */}
                                    <div className="flex items-center gap-1">
                                      {onEditPhase && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onEditPhase(phase);
                                          }}
                                          className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 active:scale-95 transition-all"
                                        >
                                          <Edit2 className="h-2.5 w-2.5" />
                                          <span>Edit</span>
                                        </button>
                                      )}
                                      {onDeletePhase && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onDeletePhase(phase);
                                          }}
                                          className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 active:scale-95 transition-all"
                                        >
                                          <Trash2 className="h-2.5 w-2.5" />
                                          <span>Del</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Expandable Developer Note (Click to open, only 1 at a time) */}
                                {phase.notes && (
                                  <div className="mt-1.5 sm:mt-2">
                                    {expandedNotePhaseId === phase._id ? (
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (onPhaseClick) onPhaseClick(phase);
                                        }}
                                        className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-50/95 border border-amber-300 text-amber-950 hover:bg-amber-100/80 transition-all shadow-soft-xs animate-in fade-in duration-150"
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                                            <Code2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                            Dev Work Note / Log:
                                          </span>
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedNotePhaseId(null);
                                              }}
                                              className="text-[9px] font-bold text-slate-500 hover:text-slate-800 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200 shadow-soft-xs cursor-pointer"
                                            >
                                              Hide ▲
                                            </button>
                                            <span className="text-[9px] sm:text-[10px] font-bold text-amber-800 underline hover:text-amber-950">
                                              Full ➔
                                            </span>
                                          </div>
                                        </div>
                                        <p className="font-mono text-[10px] sm:text-[11px] text-amber-900 whitespace-pre-wrap leading-relaxed break-words">
                                          {phase.notes}
                                        </p>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedNotePhaseId(phase._id);
                                        }}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md sm:rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200/90 text-amber-900 text-[9px] sm:text-[10px] font-bold transition-colors shadow-soft-xs active:scale-95 cursor-pointer"
                                      >
                                        <span>📝 View Note</span>
                                        <ChevronDown className="h-2.5 w-2.5 text-amber-700" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* In-Between Phase Insert Trigger */}
                            {onInsertPhase && (!currentUserId || isMe) && (
                              <div className="relative pl-2.5 sm:pl-7 py-0.5 group/insert">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onInsertPhase(dev._id, idx + 1);
                                  }}
                                  title={`Insert new phase between #${idx + 1} and #${idx + 2}`}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-500 hover:text-brand-700 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 transition-all shadow-2xs cursor-pointer active:scale-95"
                                >
                                  <Plus className="h-2.5 w-2.5 text-brand-600" />
                                  <span>+ Insert Phase #{idx + 2} Here</span>
                                </button>
                              </div>
                            )}
                          </React.Fragment>
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
