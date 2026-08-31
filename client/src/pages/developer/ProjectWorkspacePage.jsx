import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProgressBar from '../../components/common/ProgressBar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [phaseToDelete, setPhaseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // ----------------------------------------------------
  // Interactive Checkbox Toggle (Optimistic with Instant Metric Recalculation)
  // ----------------------------------------------------
  const handleTogglePhase = async (phaseId) => {
    const target = phases.find((p) => p._id === phaseId);
    if (!target) return;

    // 1. Optimistic UI update
    const previousPhases = JSON.parse(JSON.stringify(phases));
    const previousProject = JSON.parse(JSON.stringify(project));

    const updatedPhases = phases.map((p) => {
      if (p._id !== phaseId) return p;
      const newCompleted = !p.completed;
      return {
        ...p,
        completed: newCompleted,
        completedAt: newCompleted ? new Date().toISOString() : null,
      };
    });

    // Recalculate local stats
    const totalAll = updatedPhases.length;
    const completedAll = updatedPhases.filter((p) => p.completed).length;
    const overallProgress =
      totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

    const myPhasesList = updatedPhases.filter(
      (p) => (p.developerId?._id || p.developerId) === user?._id
    );
    const myTotal = myPhasesList.length;
    const myDone = myPhasesList.filter((p) => p.completed).length;
    const myProgress = myTotal > 0 ? Math.round((myDone / myTotal) * 100) : 0;

    setPhases(updatedPhases);
    setProject((prev) => ({
      ...prev,
      overallProgress,
      totalPhases: totalAll,
      completedPhases: completedAll,
      myProgress,
      myTotalPhases: myTotal,
      myCompletedPhases: myDone,
      myPendingTasks: myTotal - myDone,
    }));

    // 2. Server API Call
    try {
      const res = await api.patch(`/phases/${phaseId}/toggle`);
      if (res.data.success && res.data.metrics) {
        setProject((prev) => ({
          ...prev,
          overallProgress: res.data.metrics.project.progress,
          myProgress: res.data.metrics.developer.progress,
        }));
      }
    } catch (err) {
      // Rollback on error
      setPhases(previousPhases);
      setProject(previousProject);
      error(err.response?.data?.message || 'Failed to update phase');
    }
  };

  // ----------------------------------------------------
  // Phase Management (Create / Edit / Delete)
  // ----------------------------------------------------
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedPhase(null);
    setPhaseTitle('');
    setPhaseDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (phase) => {
    setModalMode('edit');
    setSelectedPhase(phase);
    setPhaseTitle(phase.title);
    setPhaseDescription(phase.description || '');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!phaseTitle.trim()) {
      error('Please enter a phase title');
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const res = await api.post('/phases', {
          title: phaseTitle.trim(),
          description: phaseDescription.trim(),
          projectId,
        });
        if (res.data.success) {
          success('Phase added to project');
          setIsModalOpen(false);
          fetchWorkspaceData(true);
        }
      } else {
        const res = await api.put(`/phases/${selectedPhase._id}`, {
          title: phaseTitle.trim(),
          description: phaseDescription.trim(),
        });
        if (res.data.success) {
          success('Phase updated successfully');
          setIsModalOpen(false);
          fetchWorkspaceData(true);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (phase) => {
    setPhaseToDelete(phase);
    setIsDeleteOpen(true);
  };

  const handleDeletePhase = async () => {
    if (!phaseToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/phases/${phaseToDelete._id}`);
      if (res.data.success) {
        success('Phase removed');
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

  if (loading || !project) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
      </div>
    );
  }

  // Calculate stats
  const myPhases = phases.filter(
    (p) => (p.developerId?._id || p.developerId) === user?._id
  );
  const myTotal = myPhases.length;
  const myDone = myPhases.filter((p) => p.completed).length;
  const myProgressCalc = myTotal > 0 ? Math.round((myDone / myTotal) * 100) : 0;

  const totalTeamPhases = phases.length;
  const totalTeamDone = phases.filter((p) => p.completed).length;
  const teamProgressCalc =
    totalTeamPhases > 0
      ? Math.round((totalTeamDone / totalTeamPhases) * 100)
      : 0;

  // Filtered phases list
  const filteredPhases = phases.filter((p) => {
    const isMine = (p.developerId?._id || p.developerId) === user?._id;
    if (filterMode === 'my') return isMine;
    if (filterMode === 'pending') return !p.completed;
    if (filterMode === 'completed') return p.completed;
    return true; // 'all'
  });

  return (
    <div className="space-y-4">
      {/* Top Bar: Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link
            to="/developer/projects"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span>Workspace</span>
              <span>•</span>
              <StatusBadge status={project.status} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {project.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Sync Status */}
          <button
            onClick={() => fetchWorkspaceData(true)}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
            title="Auto-syncs live every 5s"
          >
            <RefreshCw
              className={`h-3 w-3 text-brand-600 ${
                isSyncing ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden sm:inline text-[11px]">
              {isSyncing ? 'Syncing...' : 'Live Synced'}
            </span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-brand-600/20 hover:bg-brand-500 transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Phase
          </button>
        </div>
      </div>

      {/* Workspace View Mode Switcher (Tree Graph vs Checklist vs Analytics) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'tree'
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5 text-brand-600" />
            Tree Graph Flow
          </button>

          <button
            onClick={() => setViewMode('checklist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'checklist'
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListTodo className="h-3.5 w-3.5 text-indigo-600" />
            Checklist View
          </button>

          <button
            onClick={() => setViewMode('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'analytics'
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
            Analytics & Charts
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2.5 text-[11px] text-slate-500 font-medium">
          <span>
            Team: <strong className="text-slate-800 font-bold">{teamProgressCalc}%</strong>
          </span>
          <span>•</span>
          <span>
            Personal: <strong className="text-brand-600 font-bold">{myProgressCalc}%</strong>
          </span>
        </div>
      </div>

      {/* VIEW 1: TREE GRAPH FLOW */}
      {viewMode === 'tree' && (
        <ProjectTreeGraph
          project={project}
          phases={phases}
          onTogglePhase={handleTogglePhase}
          currentUserId={user?._id}
        />
      )}

      {/* VIEW 2: VISUAL ANALYTICS */}
      {viewMode === 'analytics' && (
        <ProjectAnalytics project={project} phases={phases} />
      )}

      {/* VIEW 3: CHECKLIST VIEW */}
      {viewMode === 'checklist' && (
        <div className="space-y-4">
          {/* Progress Overview Banner */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* My Personal Progress */}
              <div className="rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200/80 p-3.5 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700">
                    My Progress
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-brand-200">
                    {myDone}/{myTotal} Done
                  </span>
                </div>
                <ProgressBar
                  progress={myProgressCalc}
                  size="sm"
                  showLabel={false}
                />
              </div>

              {/* Combined Team Progress */}
              <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 p-3.5 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                    Team Overall
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    {totalTeamDone}/{totalTeamPhases} Done
                  </span>
                </div>
                <ProgressBar
                  progress={teamProgressCalc}
                  size="sm"
                  showLabel={false}
                />
              </div>
            </div>
          </div>

          {/* Filter Pills & Checklist */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">Project Phases</h3>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg border border-slate-200 bg-white shadow-sm overflow-x-auto">
                {[
                  { id: 'all', label: `All (${phases.length})` },
                  { id: 'my', label: `My (${myPhases.length})` },
                  {
                    id: 'pending',
                    label: `Pending (${phases.filter((p) => !p.completed).length})`,
                  },
                  {
                    id: 'completed',
                    label: `Done (${phases.filter((p) => p.completed).length})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterMode(tab.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-all ${
                      filterMode === tab.id
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                    ? 'No phases created yet'
                    : 'No phases match this filter'
                }
                description="Add phases/milestones to structure your project."
                actionText={filterMode === 'all' ? 'Add First Phase' : undefined}
                onAction={filterMode === 'all' ? openCreateModal : undefined}
              />
            ) : (
              <div className="space-y-2">
                {filteredPhases.map((phase) => {
                  const isOwner =
                    (phase.developerId?._id || phase.developerId) === user?._id;
                  const ownerName = phase.developerId?.name || 'Developer';

                  return (
                    <div
                      key={phase._id}
                      className={`group flex items-start justify-between gap-3 p-3 rounded-xl border transition-all duration-200 shadow-sm ${
                        phase.completed
                          ? 'bg-slate-50/70 border-slate-200/90'
                          : 'bg-white border-slate-200 hover:border-brand-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Checkbox and Phase Content */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
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

                        <div className="min-w-0 flex-1">
                          <h4
                            onClick={() => handleTogglePhase(phase._id)}
                            className={`text-xs font-bold transition-colors select-none cursor-pointer ${
                              phase.completed
                                ? 'line-through text-slate-400 font-medium'
                                : 'text-slate-900 hover:text-brand-700'
                            }`}
                          >
                            {phase.title}
                          </h4>

                          {phase.description && (
                            <p
                              className={`text-[11px] mt-0.5 leading-relaxed line-clamp-2 ${
                                phase.completed
                                  ? 'text-slate-400 line-through'
                                  : 'text-slate-600'
                              }`}
                            >
                              {phase.description}
                            </p>
                          )}

                          {/* Metadata Chips */}
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px]">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-medium text-slate-700">
                              <User className="h-2.5 w-2.5 text-brand-600" />
                              <span>
                                {ownerName} {isOwner && '(You)'}
                              </span>
                            </div>

                            {phase.completed ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                                Done
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                <Clock className="h-2.5 w-2.5 text-amber-600" />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions for Owner */}
                      {isOwner && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(phase)}
                            title="Edit Phase"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => confirmDelete(phase)}
                            title="Delete Phase"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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
        title={modalMode === 'create' ? 'Add New Phase' : 'Edit Phase'}
        subtitle="Define a milestone deliverable for this project."
        maxWidth="md"
      >
        <form onSubmit={handleModalSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Phase Title *
            </label>
            <input
              type="text"
              required
              value={phaseTitle}
              onChange={(e) => setPhaseTitle(e.target.value)}
              placeholder="e.g. Phase 1: Setup API Endpoints"
              className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={phaseDescription}
              onChange={(e) => setPhaseDescription(e.target.value)}
              placeholder="Implementation details..."
              className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-brand-600/20 hover:bg-brand-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : modalMode === 'create' ? (
                'Add Phase'
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeletePhase}
        title="Delete Phase"
        message={`Are you sure you want to delete "${phaseToDelete?.title}"?`}
        confirmText="Delete Phase"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjectWorkspacePage;
