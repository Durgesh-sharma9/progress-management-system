import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProgressBar from '../../components/common/ProgressBar';
import ProjectTypeBadge from '../../components/common/ProjectTypeBadge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import BulkPhaseModal from '../../components/common/BulkPhaseModal';
import PhaseNotesModal from '../../components/common/PhaseNotesModal';
import CompletePhaseModal from '../../components/common/CompletePhaseModal';
import EmptyState from '../../components/common/EmptyState';
import ProjectTreeGraph from '../../components/common/ProjectTreeGraph';
import ProjectAnalytics from '../../components/common/ProjectAnalytics';
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Loader2,
  Layers,
  RefreshCw,
  Clock,
  User,
  GitBranch,
  BarChart3,
  ListTodo,
  Sparkles,
  ClipboardPaste,
  FileText,
  MessageSquare,
} from 'lucide-react';

const ProjectWorkspacePage = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [project, setProject] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'checklist' | 'analytics'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'my' | 'pending' | 'completed'

  // Modal State (Create / Edit Phase)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [phaseTitle, setPhaseTitle] = useState('');
  const [phaseDescription, setPhaseDescription] = useState('');
  const [phaseNotes, setPhaseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [phaseToDelete, setPhaseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Phase Paster Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Phase Notes Modal State
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedPhaseForNotes, setSelectedPhaseForNotes] = useState(null);

  // Complete Phase with Notes Modal State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [phaseToComplete, setPhaseToComplete] = useState(null);

  const fetchWorkspaceData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setIsSyncing(true);

      const [projRes, phasesRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/phases/project/${projectId}?view=all`),
      ]);

      if (projRes.data.success) {
        setProject(projRes.data.data);
      }
      if (phasesRes.data.success) {
        setPhases(phasesRes.data.data);
      }
    } catch (err) {
      if (!isSilent) {
        error(err.response?.data?.message || 'Failed to load workspace data');
        navigate('/developer/projects');
      }
    } finally {
      if (!isSilent) setLoading(false);
      setIsSyncing(false);
    }
  }, [projectId, navigate, error]);

  // Initial load
  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  // Real-time background sync interval (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWorkspaceData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchWorkspaceData]);

  // Bulk Import Handler
  const handleBulkPhasesCreated = async (parsedList) => {
    try {
      const res = await api.post('/phases/bulk', {
        projectId,
        phases: parsedList,
      });
      if (res.data.success) {
        success(res.data.message || `Created ${parsedList.length} deliverable phases!`);
        fetchWorkspaceData(true);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to bulk import phases');
      throw err;
    }
  };

  // Phase Notes Save Handler
  const handleSaveNotes = async (phaseId, notesText) => {
    try {
      const res = await api.patch(`/phases/${phaseId}/notes`, { notes: notesText });
      if (res.data.success) {
        success('Work notes saved successfully');
        fetchWorkspaceData(true);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save notes');
      throw err;
    }
  };

  const openNotesModal = (phase) => {
    setSelectedPhaseForNotes(phase);
    setIsNotesModalOpen(true);
  };

  // Open Create Phase Modal
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedPhase(null);
    setPhaseTitle('');
    setPhaseDescription('');
    setPhaseNotes('');
    setIsModalOpen(true);
  };

  // Open Edit Phase Modal
  const openEditModal = (phase) => {
    setModalMode('edit');
    setSelectedPhase(phase);
    setPhaseTitle(phase.title);
    setPhaseDescription(phase.description || '');
    setPhaseNotes(phase.notes || '');
    setIsModalOpen(true);
  };

  // Handle Create or Edit Phase submission
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!phaseTitle.trim()) {
      error('Phase title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const res = await api.post('/phases', {
          title: phaseTitle,
          description: phaseDescription,
          notes: phaseNotes,
          projectId,
        });
        if (res.data.success) {
          success('Deliverable phase added successfully');
          setIsModalOpen(false);
          fetchWorkspaceData(true);
        }
      } else {
        const res = await api.put(`/phases/${selectedPhase._id}`, {
          title: phaseTitle,
          description: phaseDescription,
          notes: phaseNotes,
        });
        if (res.data.success) {
          success('Deliverable updated successfully');
          setIsModalOpen(false);
          fetchWorkspaceData(true);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save deliverable');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Phase Completion status (with note prompt on complete)
  const handleTogglePhase = (phaseId, bypassModal = false) => {
    const target = phases.find((p) => p._id === phaseId);
    if (!target) return;

    // Check ownership: developer can only toggle their own phases
    const isOwner =
      (target.developerId?._id || target.developerId)?.toString() ===
      user?._id?.toString();
    if (!isOwner) {
      error('You can only check off or complete your own assigned deliverable phases.');
      return;
    }

    // If currently incomplete and not bypassing modal, open Complete & Attach Note modal
    if (!target.completed && !bypassModal) {
      setPhaseToComplete(target);
      setIsCompleteModalOpen(true);
      return;
    }

    // Toggle immediately (e.g. unchecking or bypassing)
    performToggle(phaseId);
  };

  // Perform Toggle API call
  const performToggle = async (phaseId, notesToAttach = undefined) => {
    // Optimistic UI update
    setPhases((prevPhases) =>
      prevPhases.map((p) =>
        p._id === phaseId
          ? {
              ...p,
              completed: !p.completed,
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
        success(res.data.message);
        fetchWorkspaceData(true);
      }
    } catch (err) {
      error('Failed to update phase status');
      fetchWorkspaceData(true); // Revert on failure
    }
  };

  // Confirm Delete
  const confirmDelete = (phase) => {
    setPhaseToDelete(phase);
    setIsDeleteOpen(true);
  };

  // Handle Delete Phase
  const handleDeletePhase = async () => {
    if (!phaseToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/phases/${phaseToDelete._id}`);
      if (res.data.success) {
        success('Deliverable deleted');
        setIsDeleteOpen(false);
        setPhaseToDelete(null);
        fetchWorkspaceData(true);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete phase');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-xs font-semibold text-slate-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  // Calculate my stats vs team stats
  const myPhases = phases.filter(
    (p) => (p.developerId?._id || p.developerId) === user?._id
  );
  const myCompleted = myPhases.filter((p) => p.completed).length;
  const myProgressCalc =
    myPhases.length > 0 ? Math.round((myCompleted / myPhases.length) * 100) : 0;

  const teamTotal = phases.length;
  const teamCompleted = phases.filter((p) => p.completed).length;
  const teamProgressCalc =
    teamTotal > 0 ? Math.round((teamCompleted / teamTotal) * 100) : 0;

  // Filter checklist phases
  const filteredPhases = phases.filter((p) => {
    const isMine = (p.developerId?._id || p.developerId) === user?._id;
    if (filterMode === 'my') return isMine;
    if (filterMode === 'pending') return !p.completed;
    if (filterMode === 'completed') return p.completed;
    return true; // 'all'
  });

  return (
    <div className="space-y-6">
      {/* Top Bar: Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link
            to="/developer/projects"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/90 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-soft-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Workspace</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <ProjectTypeBadge
                projectType={project.projectType}
                memberCount={project.developers?.length || 0}
                showCount={project.projectType === 'Group' || (project.developers && project.developers.length > 1)}
                size="xs"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {project.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Live Sync Status */}
          <button
            onClick={() => fetchWorkspaceData(true)}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-soft-xs transition-all"
            title="Auto-syncs live every 5s"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-brand-600 ${
                isSyncing ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden sm:inline text-xs font-medium">
              {isSyncing ? 'Syncing...' : 'Live Sync'}
            </span>
          </button>

          {/* Quick Bulk Paste Button */}
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/90 hover:bg-brand-100 text-brand-700 px-4 py-2.5 text-xs font-bold shadow-soft-xs transition-all duration-200 active:scale-95 shrink-0"
            title="Paste multiple deliverables at once"
          >
            <ClipboardPaste className="h-4 w-4" />
            Bulk Paste Phases
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-soft-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all duration-200 active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Deliverable
          </button>
        </div>
      </div>

      {/* Workspace View Mode Switcher (Tree Graph vs Checklist vs Analytics) */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-soft-xs">
          <button
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              viewMode === 'tree'
                ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <GitBranch className="h-4 w-4" />
            Tree Flow Diagram
          </button>

          <button
            onClick={() => setViewMode('checklist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              viewMode === 'checklist'
                ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <ListTodo className="h-4 w-4" />
            Checklist View
          </button>

          <button
            onClick={() => setViewMode('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              viewMode === 'analytics'
                ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Progress Analytics
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Syncing
          </span>
        </div>
      </div>

      {/* VIEW MODE 1: Interactive Tree Flowchart */}
      {viewMode === 'tree' && (
        <div className="space-y-4">
          <ProjectTreeGraph
            project={project}
            phases={phases}
            onTogglePhase={handleTogglePhase}
            onPhaseClick={(phase) => openNotesModal(phase)}
            currentUserId={user?._id}
          />
        </div>
      )}

      {/* VIEW MODE 2: Progress Analytics */}
      {viewMode === 'analytics' && (
        <ProjectAnalytics project={project} phases={phases} />
      )}

      {/* VIEW MODE 3: Checklist & Task Manager */}
      {viewMode === 'checklist' && (
        <div className="space-y-6">
          {/* Velocity Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* My Velocity Card */}
            <div className="glass-card rounded-3xl p-5 border border-slate-200/80 bg-gradient-to-br from-white via-white to-brand-50/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  My Velocity & Output
                </span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  {myCompleted} / {myPhases.length} Phases
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Sprint Completion</span>
                  <span className="font-bold text-brand-700 font-mono text-sm">
                    {myProgressCalc}%
                  </span>
                </div>
                <ProgressBar
                  progress={myProgressCalc}
                  size="md"
                  showLabel={false}
                />
              </div>
            </div>

            {/* Team Overall Card */}
            <div className="glass-card rounded-3xl p-5 border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Total Project Delivery
                </span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {teamCompleted} / {teamTotal} Total
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Total Milestones</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {teamProgressCalc}%
                  </span>
                </div>
                <ProgressBar
                  progress={teamProgressCalc}
                  size="md"
                  showLabel={false}
                />
              </div>
            </div>
          </div>

          {/* Filter Pills & Checklist */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Milestone Deliverables</h3>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 p-1 rounded-2xl border border-slate-200/80 bg-white shadow-soft-xs overflow-x-auto">
                {[
                  { id: 'all', label: `All (${phases.length})` },
                  { id: 'my', label: `My (${myPhases.length})` },
                  {
                    id: 'pending',
                    label: `Pending (${phases.filter((p) => !p.completed).length})`,
                  },
                  {
                    id: 'completed',
                    label: `Delivered (${phases.filter((p) => p.completed).length})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterMode(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                      filterMode === tab.id
                        ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredPhases.length === 0 ? (
              <EmptyState
                icon={Layers}
                title={
                  filterMode === 'all'
                    ? 'No deliverables created yet'
                    : 'No deliverables match this filter'
                }
                description="Add milestone deliverables or paste a full list to structure and track work on this project."
                actionText={filterMode === 'all' ? 'Bulk Paste Phases' : undefined}
                onAction={filterMode === 'all' ? () => setIsBulkModalOpen(true) : undefined}
              />
            ) : (
              <div className="space-y-3">
                {filteredPhases.map((phase) => {
                  const isOwner =
                    (phase.developerId?._id || phase.developerId) === user?._id;
                  const ownerName = phase.developerId?.name || 'Developer';

                  return (
                    <div
                      key={phase._id}
                      className={`group flex flex-col p-4 rounded-2xl border transition-all duration-200 shadow-soft-xs ${
                        phase.completed
                          ? 'bg-emerald-50/30 border-emerald-200/70'
                          : 'bg-white border-slate-200/90 hover:border-brand-300 hover:shadow-soft'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3.5">
                        {/* Checkbox and Phase Content */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          {isOwner ? (
                            <button
                              type="button"
                              onClick={() => handleTogglePhase(phase._id)}
                              className="mt-0.5 transition-transform active:scale-90 shrink-0 cursor-pointer"
                              title="Click to toggle completion status"
                            >
                              {phase.completed ? (
                                <CheckSquare className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Square className="h-5 w-5 text-slate-400 hover:text-brand-600" />
                              )}
                            </button>
                          ) : (
                            <div
                              className="mt-0.5 shrink-0 opacity-60 cursor-not-allowed"
                              title={`Assigned to ${ownerName}. Only ${ownerName} can check off this task.`}
                            >
                              {phase.completed ? (
                                <CheckSquare className="h-5 w-5 text-emerald-600/70" />
                              ) : (
                                <Square className="h-5 w-5 text-slate-300" />
                              )}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <h4
                              onClick={() => isOwner && handleTogglePhase(phase._id)}
                              className={`text-sm font-bold transition-colors select-none ${
                                isOwner ? 'cursor-pointer' : 'cursor-default'
                              } ${
                                phase.completed
                                  ? 'line-through text-slate-400 font-medium'
                                  : isOwner
                                  ? 'text-slate-900 hover:text-brand-600'
                                  : 'text-slate-800'
                              }`}
                            >
                              {phase.title}
                            </h4>

                            {phase.description && (
                              <p
                                className={`text-xs mt-1 leading-relaxed line-clamp-2 font-normal ${
                                  phase.completed
                                    ? 'text-slate-400 line-through'
                                    : 'text-slate-600'
                                }`}
                              >
                                {phase.description}
                              </p>
                            )}

                            {/* Metadata Chips */}
                            <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px]">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100/90 border border-slate-200/80 font-semibold text-slate-700">
                                <User className="h-3 w-3 text-brand-600" />
                                <span>
                                  {ownerName} {isOwner && '(You)'}
                                </span>
                              </div>

                              {phase.completed ? (
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shadow-soft-xs">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  Delivered
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full shadow-soft-xs">
                                  <Clock className="h-3 w-3 text-amber-600" />
                                  In Progress
                                </span>
                              )}

                              {/* Work Notes Trigger Button */}
                              <button
                                type="button"
                                onClick={() => openNotesModal(phase)}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors border ${
                                  phase.notes
                                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-soft-xs'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <FileText className="h-3 w-3 text-brand-600" />
                                {phase.notes ? '📝 View Notes' : '+ Add Note'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Actions for Owner */}
                        {isOwner && (
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => openEditModal(phase)}
                              title="Edit Phase"
                              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => confirmDelete(phase)}
                              title="Delete Phase"
                              className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Developer Notes In-line Preview (if exists) */}
                      {phase.notes && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-950 font-mono">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Dev Log / Work Notes:
                            </span>
                            {isOwner && (
                              <button
                                onClick={() => openNotesModal(phase)}
                                className="text-[10px] font-semibold text-amber-800 underline hover:text-amber-950"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed text-[11px] text-amber-900">
                            {phase.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Phase Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Add Milestone Deliverable' : 'Edit Deliverable'}
        subtitle="Define a milestone phase for this project workspace."
        maxWidth="md"
      >
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Deliverable Title *
            </label>
            <input
              type="text"
              required
              value={phaseTitle}
              onChange={(e) => setPhaseTitle(e.target.value)}
              placeholder="e.g. Phase 1: Setup Authentication & JWT API"
              className="block w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={phaseDescription}
              onChange={(e) => setPhaseDescription(e.target.value)}
              placeholder="Key requirements or technical implementation notes..."
              className="block w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              📝 Work Notes / PR Links / Blockers (Optional)
            </label>
            <textarea
              rows={3}
              value={phaseNotes}
              onChange={(e) => setPhaseNotes(e.target.value)}
              placeholder="Add GitHub PR links, verification notes, or blockers..."
              className="block w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3.5 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-300/80 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-soft-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-soft-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : modalMode === 'create' ? (
                'Add Deliverable'
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Phase Paster Modal */}
      <BulkPhaseModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        projectId={projectId}
        onPhasesCreated={handleBulkPhasesCreated}
      />

      {/* Phase Notes Modal */}
      <PhaseNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
          setSelectedPhaseForNotes(null);
        }}
        phase={selectedPhaseForNotes}
        isOwner={
          (selectedPhaseForNotes?.developerId?._id || selectedPhaseForNotes?.developerId) ===
          user?._id
        }
        onSaveNotes={handleSaveNotes}
      />

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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeletePhase}
        title="Delete Deliverable"
        message={`Are you sure you want to delete "${phaseToDelete?.title}"?`}
        confirmText="Delete Deliverable"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjectWorkspacePage;
