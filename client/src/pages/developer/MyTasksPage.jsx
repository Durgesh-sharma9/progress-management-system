import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/common/EmptyState';
import CompletePhaseModal from '../../components/common/CompletePhaseModal';
import PhaseNotesModal from '../../components/common/PhaseNotesModal';
import {
  CheckSquare,
  Square,
  Search,
  CheckCircle2,
  Clock,
  FolderGit2,
  Layers,
  Loader2,
  ExternalLink,
  X,
  Sparkles,
  FileText,
} from 'lucide-react';

const MyTasksPage = () => {
  const [phases, setPhases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Completed' | 'Pending'
  const [projectFilter, setProjectFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Complete Phase Modal State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [phaseToComplete, setPhaseToComplete] = useState(null);

  // Phase Notes Modal State
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedPhaseForNotes, setSelectedPhaseForNotes] = useState(null);

  const { success, error } = useToast();

  useEffect(() => {
    fetchPhasesAndProjects();
  }, []);

  const fetchPhasesAndProjects = async () => {
    try {
      setLoading(true);
      const [phasesRes, projRes] = await Promise.all([
        api.get('/phases/my'),
        api.get('/projects'),
      ]);

      if (phasesRes.data.success) {
        setPhases(phasesRes.data.data);
      }
      if (projRes.data.success) {
        setProjects(projRes.data.data);
      }
    } catch (err) {
      error('Failed to load your phases');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePhase = (phaseId, bypassModal = false) => {
    const target = phases.find((p) => p._id === phaseId);
    if (!target) return;

    if (!target.completed && !bypassModal) {
      setPhaseToComplete(target);
      setIsCompleteModalOpen(true);
      return;
    }

    performToggle(phaseId);
  };

  const performToggle = async (phaseId, notesToAttach = undefined) => {
    const previousPhases = [...phases];
    setPhases((prev) =>
      prev.map((p) =>
        p._id === phaseId
          ? {
              ...p,
              completed: !p.completed,
              completedAt: !p.completed ? new Date().toISOString() : null,
              notes: notesToAttach !== undefined ? notesToAttach : p.notes,
            }
          : p
      )
    );

    try {
      const res = await api.patch(`/phases/${phaseId}/toggle`, {
        notes: notesToAttach,
      });
      if (res.data.success) {
        success(res.data.message || 'Phase status updated');
        fetchPhasesAndProjects();
      }
    } catch (err) {
      setPhases(previousPhases);
      error(err.response?.data?.message || 'Failed to update phase');
    }
  };

  const handleSaveNotes = async (phaseId, notesText) => {
    try {
      const res = await api.patch(`/phases/${phaseId}/notes`, { notes: notesText });
      if (res.data.success) {
        success('Work notes saved successfully');
        fetchPhasesAndProjects();
      }
    } catch (err) {
      error('Failed to save notes');
      throw err;
    }
  };

  const filteredPhases = phases.filter((phase) => {
    // Search
    const matchesSearch =
      phase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phase.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status
    let matchesStatus = true;
    if (statusFilter === 'Completed') matchesStatus = phase.completed;
    if (statusFilter === 'Pending') matchesStatus = !phase.completed;

    // Project
    let matchesProject = true;
    if (projectFilter !== 'All') {
      matchesProject =
        (phase.projectId?._id || phase.projectId) === projectFilter;
    }

    return matchesSearch && matchesStatus && matchesProject;
  });

  const totalCompleted = phases.filter((p) => p.completed).length;
  const totalPending = phases.length - totalCompleted;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Deliverables & Phases
            </h2>
            <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {phases.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View, filter, and check off your development milestones across all assigned projects.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] sm:text-xs font-bold shadow-soft-xs">
            <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600" />
            {totalCompleted} Done
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] sm:text-xs font-bold shadow-soft-xs">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600" />
            {totalPending} Pending
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search deliverables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white/80 py-2 sm:py-2.5 pl-9 pr-8 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center justify-around gap-1 p-1 rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white shadow-soft-xs w-full sm:w-auto">
            {['All', 'Completed', 'Pending'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 flex-1 sm:flex-initial ${
                  statusFilter === status
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Project Dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[160px]">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
            >
              <option value="All">All Workspaces</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Phases Checklist */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            <p className="text-xs font-semibold text-slate-400">Loading your deliverables...</p>
          </div>
        </div>
      ) : filteredPhases.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={searchQuery ? 'No matching deliverables' : 'No deliverables created yet'}
          description={
            searchQuery
              ? 'Try clearing your search or changing the filter options.'
              : 'Open a project workspace to create your first phase.'
          }
          actionText={searchQuery ? undefined : 'View My Workspaces'}
          onAction={searchQuery ? undefined : () => window.location.href = '/developer/projects'}
        />
      ) : (
        <div className="glass-card rounded-3xl shadow-soft overflow-hidden divide-y divide-slate-100">
          {filteredPhases.map((phase) => (
            <div
              key={phase._id}
              className={`flex flex-col p-4 lg:p-5 transition-colors duration-200 ${
                phase.completed ? 'bg-emerald-50/25' : 'hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  {/* Interactive Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleTogglePhase(phase._id)}
                    className="mt-0.5 sm:mt-0 text-slate-400 hover:text-brand-600 transition-transform active:scale-90 shrink-0 cursor-pointer"
                  >
                    {phase.completed ? (
                      <CheckSquare className="h-6 w-6 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Square className="h-6 w-6 text-slate-400 hover:text-brand-600" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      onClick={() => handleTogglePhase(phase._id)}
                      className={`text-sm font-bold cursor-pointer select-none transition-colors ${
                        phase.completed
                          ? 'line-through text-slate-400 font-medium'
                          : 'text-slate-900'
                      }`}
                    >
                      {phase.title}
                    </p>

                    {phase.description && (
                      <p
                        className={`text-xs mt-1 line-clamp-1 font-normal ${
                          phase.completed ? 'text-slate-400 line-through' : 'text-slate-500'
                        }`}
                      >
                        {phase.description}
                      </p>
                    )}

                    {/* Project & Note Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100/90 border border-slate-200/80 font-bold text-slate-700 shadow-soft-xs">
                        <FolderGit2 className="h-3 w-3 text-brand-600" />
                        {phase.projectId?.name || 'Project'}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPhaseForNotes(phase);
                          setIsNotesModalOpen(true);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors border ${
                          phase.notes
                            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-soft-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <FileText className="h-3 w-3 text-brand-600" />
                        {phase.notes ? '📝 View Note' : '+ Add Note'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Link to Workspace */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {phase.completed ? (
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full shadow-soft-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Delivered
                    </span>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full shadow-soft-xs">
                      <Clock className="h-3.5 w-3.5" />
                      In Progress
                    </span>
                  )}

                  {phase.projectId?._id && (
                    <Link
                      to={`/developer/workspace/${phase.projectId._id}`}
                      title="Open in Workspace"
                      className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>

              {/* In-line Notes Preview */}
              {phase.notes && (
                <div className="mt-3 ml-10 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 font-mono">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Work Note / PR Log:
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPhaseForNotes(phase);
                        setIsNotesModalOpen(true);
                      }}
                      className="text-[10px] font-semibold text-amber-800 underline hover:text-amber-950"
                    >
                      Edit Note
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-[11px] text-amber-900">
                    {phase.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Complete Phase with Notes Modal */}
      <CompletePhaseModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setPhaseToComplete(null);
        }}
        phase={phaseToComplete}
        onConfirmComplete={(phaseId, noteText) => performToggle(phaseId, noteText)}
      />

      {/* Phase Notes Modal */}
      <PhaseNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
          setSelectedPhaseForNotes(null);
        }}
        phase={selectedPhaseForNotes}
        isOwner={true}
        onSaveNotes={handleSaveNotes}
      />
    </div>
  );
};

export default MyTasksPage;
