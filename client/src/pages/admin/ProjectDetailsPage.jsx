import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import PhaseNotesModal from '../../components/common/PhaseNotesModal';
import EmptyState from '../../components/common/EmptyState';
import ProjectTreeGraph from '../../components/common/ProjectTreeGraph';
import ProjectAnalytics from '../../components/common/ProjectAnalytics';
import ProjectTypeBadge from '../../components/common/ProjectTypeBadge';
import ProjectCategoryBadge from '../../components/common/ProjectCategoryBadge';
import TechStackPills from '../../components/common/TechStackPills';
import BulkPhaseModal from '../../components/common/BulkPhaseModal';
import {
  ArrowLeft,
  Users,
  User,
  UserPlus,
  UserMinus,
  CheckCircle2,
  Clock,
  ListTodo,
  ChevronDown,
  ChevronUp,
  Loader2,
  Eye,
  CheckSquare,
  Square,
  GitBranch,
  BarChart3,
  Layers,
  Sparkles,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Calendar,
} from 'lucide-react';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [project, setProject] = useState(null);
  const [phases, setPhases] = useState([]);
  const [allDevelopers, setAllDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'team' | 'analytics'

  // Assign developer modal state
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedDevToAssign, setSelectedDevToAssign] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Remove developer modal state
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [devToRemove, setDevToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Phase Modal state (Add / Edit / Middle Insert)
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [phaseModalMode, setPhaseModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [phaseTitle, setPhaseTitle] = useState('');
  const [phaseDescription, setPhaseDescription] = useState('');
  const [targetDevId, setTargetDevId] = useState('');
  const [insertPosition, setInsertPosition] = useState(null);
  const [isSubmittingPhase, setIsSubmittingPhase] = useState(false);

  // Bulk Phase Import Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Delete Phase Modal state
  const [isDeletePhaseOpen, setIsDeletePhaseOpen] = useState(false);
  const [phaseToDelete, setPhaseToDelete] = useState(null);
  const [isDeletingPhase, setIsDeletingPhase] = useState(false);

  // Notes Modal state for Admin inspection
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedPhaseForNotes, setSelectedPhaseForNotes] = useState(null);
  const [expandedNotePhaseId, setExpandedNotePhaseId] = useState(null);

  useEffect(() => {
    fetchProjectData();
    fetchAllDevelopers();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projRes, phasesRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/phases/project/${id}?view=all`),
      ]);

      if (projRes.data.success) {
        setProject(projRes.data.data);
      }
      if (phasesRes.data.success) {
        setPhases(phasesRes.data.data);
      }
    } catch (err) {
      error('Failed to load project details');
      navigate('/admin/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDevelopers = async () => {
    try {
      const res = await api.get('/users/developers');
      if (res.data.success) {
        setAllDevelopers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch developers:', err);
    }
  };

  const handleAssignDeveloper = async (e) => {
    e.preventDefault();
    if (!selectedDevToAssign) {
      error('Please select a developer to assign');
      return;
    }

    setIsAssigning(true);
    try {
      const res = await api.post(`/projects/${id}/developers`, {
        developerId: selectedDevToAssign,
      });
      if (res.data.success) {
        success(res.data.message || 'Developer assigned successfully');
        setIsAssignOpen(false);
        setSelectedDevToAssign('');
        fetchProjectData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to assign developer');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveDeveloper = async () => {
    if (!devToRemove) return;

    setIsRemoving(true);
    try {
      const res = await api.delete(`/projects/${id}/developers/${devToRemove._id}`);
      if (res.data.success) {
        success(res.data.message || 'Developer removed from project');
        setIsRemoveOpen(false);
        setDevToRemove(null);
        fetchProjectData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to remove developer');
    } finally {
      setIsRemoving(false);
    }
  };

  // Open Create Phase Modal
  const openCreatePhaseModal = (pos = null, devId = null) => {
    setPhaseModalMode('create');
    setSelectedPhase(null);
    setPhaseTitle('');
    setPhaseDescription('');
    setInsertPosition(typeof pos === 'number' ? pos : null);
    const defaultDev = devId || (project?.developers?.[0]?._id || project?.developers?.[0] || '');
    setTargetDevId(defaultDev);
    setIsPhaseModalOpen(true);
  };

  // Open Edit Phase Modal
  const openEditPhaseModal = (phase) => {
    setPhaseModalMode('edit');
    setSelectedPhase(phase);
    setPhaseTitle(phase.title || '');
    setPhaseDescription(phase.description || '');
    const devId = phase.developerId?._id || phase.developerId || '';
    setTargetDevId(devId);
    setInsertPosition(null);
    setIsPhaseModalOpen(true);
  };

  // Save / Update Phase Form
  const handlePhaseFormSubmit = async (e) => {
    e.preventDefault();
    if (!phaseTitle.trim()) {
      error('Phase title is required');
      return;
    }

    setIsSubmittingPhase(true);
    try {
      if (phaseModalMode === 'create') {
        const payload = {
          title: phaseTitle.trim(),
          description: phaseDescription.trim(),
          projectId: id,
          developerId: targetDevId || undefined,
        };
        if (typeof insertPosition === 'number') {
          payload.insertPosition = insertPosition;
        }

        const res = await api.post('/phases', payload);
        if (res.data.success) {
          success(
            typeof insertPosition === 'number'
              ? `Phase inserted at #${insertPosition + 1}`
              : 'Phase created successfully'
          );
          setIsPhaseModalOpen(false);
          fetchProjectData();
        }
      } else {
        const res = await api.put(`/phases/${selectedPhase._id}`, {
          title: phaseTitle.trim(),
          description: phaseDescription.trim(),
        });
        if (res.data.success) {
          success('Phase updated successfully');
          setIsPhaseModalOpen(false);
          fetchProjectData();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save phase');
    } finally {
      setIsSubmittingPhase(false);
    }
  };

  // Reorder / Move Phase Up & Down
  const handleMovePhase = async (phaseId, direction) => {
    try {
      const res = await api.patch(`/phases/${phaseId}/move`, { direction });
      if (res.data.success) {
        success(res.data.message || `Phase moved ${direction}`);
        fetchProjectData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to move phase');
    }
  };

  // Toggle Phase Status
  const handleTogglePhase = async (phaseId) => {
    try {
      const res = await api.patch(`/phases/${phaseId}/toggle`);
      if (res.data.success) {
        success(res.data.message);
        fetchProjectData();
      }
    } catch (err) {
      error('Failed to toggle phase status');
    }
  };

  // Confirm and Delete Phase
  const confirmDeletePhase = (phase) => {
    setPhaseToDelete(phase);
    setIsDeletePhaseOpen(true);
  };

  const handleDeletePhase = async () => {
    if (!phaseToDelete) return;
    setIsDeletingPhase(true);
    try {
      const res = await api.delete(`/phases/${phaseToDelete._id}`);
      if (res.data.success) {
        success('Phase deleted successfully');
        setIsDeletePhaseOpen(false);
        setPhaseToDelete(null);
        fetchProjectData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete phase');
    } finally {
      setIsDeletingPhase(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-xs font-semibold text-slate-400">Loading project details...</p>
        </div>
      </div>
    );
  }

  // Calculate unassigned developers for the assign dropdown
  const assignedDevIds = (project.developers || []).map((d) => d._id || d);
  const unassignedDevelopers = allDevelopers.filter(
    (d) => !assignedDevIds.includes(d._id)
  );

  return (
    <div className="space-y-4">
      {/* Compact Top Header Card */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-soft border border-slate-200/90 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <Link
              to="/admin/projects"
              title="Back to Projects"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0 shadow-soft-xs mt-0.5 sm:mt-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                  {project.name}
                </h2>
                <ProjectCategoryBadge
                  category={project.category || 'Web App'}
                  size="xs"
                />
                <ProjectTypeBadge
                  projectType={project.projectType}
                  memberCount={project.developers?.length || 0}
                  showCount={true}
                  size="xs"
                />
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  Started: {new Date(project.startDate || project.createdAt).toLocaleDateString()}
                </span>
              </div>
              {project.description && (
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {project.description}
                </p>
              )}
              {project.techStack && project.techStack.length > 0 && (
                <div className="mt-1.5">
                  <TechStackPills techStack={project.techStack} max={6} size="xs" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Compact Velocity Chip */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
              <span className="text-emerald-600 font-mono">
                {project.overallProgress}% Done
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium">
                {project.completedPhases || 0}/{project.totalPhases || 0} Phases
              </span>
            </div>

            <button
              onClick={() => setIsAssignOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-soft-xs hover:from-brand-500 hover:to-indigo-500 transition-all active:scale-95"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Assign Engineer
            </button>
          </div>
        </div>
      </div>

      {/* View Switcher: Tree Graph vs Deliverables & Notes vs Team vs Analytics */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-soft-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setViewMode('tree')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            viewMode === 'tree'
              ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <GitBranch className="h-3.5 w-3.5" />
          Tree Flow
        </button>

        <button
          onClick={() => setViewMode('deliverables')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            viewMode === 'deliverables'
              ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <ListTodo className="h-3.5 w-3.5" />
          Deliverables ({phases.length})
        </button>

        <button
          onClick={() => setViewMode('team')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            viewMode === 'team'
              ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          {project.developerStats?.length === 1 ? 'Developer' : 'Developers'} ({project.developerStats?.length || 0})
        </button>

        <button
          onClick={() => setViewMode('analytics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            viewMode === 'analytics'
              ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Analytics
        </button>
      </div>

      {/* VIEW 1: TREE GRAPH FLOW */}
      {viewMode === 'tree' && (
        <ProjectTreeGraph
          project={project}
          phases={phases}
          onPhaseClick={(phase) => {
            setSelectedPhaseForNotes(phase);
            setIsNotesModalOpen(true);
          }}
          onTogglePhase={handleTogglePhase}
          onMovePhase={handleMovePhase}
          onInsertPhase={openCreatePhaseModal}
          onEditPhase={openEditPhaseModal}
          onDeletePhase={confirmDeletePhase}
          currentUserId={null}
        />
      )}

      {/* VIEW 2: ALL DELIVERABLES & WORK NOTES */}
      {viewMode === 'deliverables' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Project Deliverables & Roadmap</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Track, reorder (▲/▼), edit, or insert new phases into this project roadmap.
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Workflow Templates</span>
              </button>

              <button
                onClick={() => openCreatePhaseModal()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-soft-xs hover:from-brand-500 hover:to-indigo-500 transition-all active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Phase</span>
              </button>
            </div>
          </div>

          {phases.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="No deliverables created"
              description="No deliverable phases have been planned for this project yet. Choose a workflow template or add custom phases."
              actionText="Apply Workflow Template"
              onAction={() => setIsBulkModalOpen(true)}
            />
          ) : (
            <div className="space-y-2 sm:space-y-2.5">
              {phases.map((phase, idx) => {
                const devName = phase.developerId?.name || 'Assigned Dev';
                return (
                  <div
                    key={phase._id}
                    className={`p-3 rounded-xl sm:rounded-2xl border transition-all duration-200 shadow-soft-xs ${
                      phase.completed
                        ? 'bg-emerald-50/30 border-emerald-200/80'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {/* Order & Status Check */}
                        <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
                          <span className="h-5 w-5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <button
                            onClick={() => handleTogglePhase(phase._id)}
                            title="Toggle completion status"
                            className="hover:scale-110 transition-transform"
                          >
                            {phase.completed ? (
                              <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Square className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                            )}
                          </button>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {phase.title}
                          </h4>
                          {phase.description && (
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              {phase.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] sm:text-[11px]">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                              <User className="h-3 w-3 text-brand-600" />
                              {devName}
                            </span>
                            {phase.completed ? (
                              <span className="inline-flex items-center gap-0.5 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                                Done
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <Clock className="h-2.5 w-2.5 text-amber-600" />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Controls: Move Up / Down, Edit, Delete, Notes */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMovePhase(phase._id, 'up')}
                          title="Move Up"
                          className="p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none transition-all"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={idx === phases.length - 1}
                          onClick={() => handleMovePhase(phase._id, 'down')}
                          title="Move Down"
                          className="p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none transition-all"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEditPhaseModal(phase)}
                          title="Edit Phase"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => confirmDeletePhase(phase)}
                          title="Delete Phase"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        {phase.notes && (
                          <button
                            onClick={() => {
                              setExpandedNotePhaseId((prev) => (prev === phase._id ? null : phase._id));
                            }}
                            className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 ml-1"
                          >
                            📝
                            <ChevronDown className={`h-3 w-3 transition-transform ${expandedNotePhaseId === phase._id ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Notes Box (only 1 open at a time) */}
                    {phase.notes && expandedNotePhaseId === phase._id && (
                      <div className="mt-2.5 p-2.5 rounded-lg sm:rounded-xl bg-amber-50/90 border border-amber-300 text-[11px] text-amber-950 font-mono animate-in fade-in duration-150">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5" />
                            Developer Work Log / Note:
                          </span>
                          <button
                            onClick={() => {
                              setSelectedPhaseForNotes(phase);
                              setIsNotesModalOpen(true);
                            }}
                            className="text-[10px] font-bold text-amber-800 underline hover:text-amber-950"
                          >
                            Full View ➔
                          </button>
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
      )}

      {/* VIEW 2: VISUAL ANALYTICS */}
      {viewMode === 'analytics' && (
        <ProjectAnalytics project={project} phases={phases} />
      )}

      {/* VIEW 3: TEAM MEMBERS ROSTER */}
      {viewMode === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Assigned Developers</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Developers and individual milestone progress
              </p>
            </div>

            <button
              onClick={() => setIsAssignOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white shadow-soft-xs hover:from-brand-500 hover:to-indigo-500 transition-all active:scale-95 shrink-0"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Assign Engineer
            </button>
          </div>

          {!project.developerStats || project.developerStats.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No engineers assigned"
              description="Assign engineers to this project so they can create phases and start tracking deliverables."
              actionText="Assign Engineer"
              onAction={() => setIsAssignOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
              {project.developerStats.map((stat) => {
                const dev = stat.developer;
                const isExpanded = expandedDevId === dev._id;
                // Developer's phases in this project
                const devPhases = phases.filter(
                  (p) => (p.developerId?._id || p.developerId) === dev._id
                );

                return (
                  <div
                    key={dev._id}
                    className="glass-card glass-card-hover rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between transition-all"
                  >
                    <div>
                      {/* Dev Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-soft-xs shrink-0">
                            {dev.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{dev.name}</h4>
                            <p className="text-xs text-slate-500 truncate">{dev.email}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setDevToRemove(dev);
                            setIsRemoveOpen(true);
                          }}
                          title="Remove Developer from Project"
                          className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-transparent transition-all shrink-0"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Developer Metrics */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 mb-4 text-center">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500">Phases</p>
                          <p className="text-base font-extrabold text-slate-800 mt-0.5 font-mono">
                            {stat.phasesCount || stat.totalPhases || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500">Total</p>
                          <p className="text-base font-extrabold text-slate-800 mt-0.5 font-mono">
                            {stat.totalPhases || stat.totalTasks || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-emerald-600">Done</p>
                          <p className="text-base font-extrabold text-emerald-600 mt-0.5 font-mono">
                            {stat.completedPhases || stat.completedTasks || 0}
                          </p>
                        </div>
                      </div>

                      {/* Personal Progress Bar */}
                      <div className="mb-4">
                        <ProgressBar
                          progress={stat.progress}
                          label="Engineer Velocity"
                          size="md"
                        />
                      </div>
                    </div>

                    {/* Expand/Collapse Phase Viewer */}
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        onClick={() =>
                          setExpandedDevId(isExpanded ? null : dev._id)
                        }
                        className="w-full flex items-center justify-between text-xs font-bold text-brand-600 hover:text-brand-700 py-1"
                      >
                        <span className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          {isExpanded ? 'Hide Deliverables' : 'View Deliverables'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {/* Expanded Phases */}
                      {isExpanded && (
                        <div className="mt-3 space-y-2 pt-3 border-t border-slate-100 max-h-64 overflow-y-auto pr-1">
                          {devPhases.length === 0 ? (
                            <p className="text-xs text-slate-400 italic text-center py-3">
                              Engineer has not created any phases yet.
                            </p>
                          ) : (
                            devPhases.map((phase) => (
                              <div
                                key={phase._id}
                                className={`rounded-xl border p-3 flex items-start gap-2.5 transition-all ${
                                  phase.completed
                                    ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
                                    : 'bg-white border-slate-200 text-slate-800 shadow-soft-xs'
                                }`}
                              >
                                {phase.completed ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-600 fill-emerald-100 shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`text-xs font-semibold ${
                                      phase.completed
                                        ? 'line-through text-slate-400'
                                        : 'text-slate-800'
                                    }`}
                                  >
                                    {phase.title}
                                  </p>
                                  {phase.description && (
                                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                      {phase.description}
                                    </p>
                                  )}
                                  {phase.notes && (
                                    <div className="mt-1.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200/60 text-[10px] text-amber-900 font-mono whitespace-pre-wrap">
                                      <span className="font-bold text-amber-700">Dev Note: </span>
                                      {phase.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Assign Developer Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Engineer to Project"
        subtitle={`Add an active developer to "${project.name}"`}
        maxWidth="md"
      >
        <form onSubmit={handleAssignDeveloper} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Engineer
            </label>
            {unassignedDevelopers.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-xs text-slate-500 font-medium">
                All registered engineers are already assigned to this project.
              </div>
            ) : (
              <select
                value={selectedDevToAssign}
                onChange={(e) => setSelectedDevToAssign(e.target.value)}
                className="block w-full rounded-2xl border border-slate-300/80 bg-white px-3.5 py-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
              >
                <option value="">-- Select an engineer --</option>
                {unassignedDevelopers.map((dev) => (
                  <option key={dev._id} value={dev._id}>
                    {dev.name} ({dev.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-soft-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAssigning || unassignedDevelopers.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-soft-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all disabled:opacity-50"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Engineer'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Remove Developer Confirmation Modal */}
      <ConfirmModal
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        onConfirm={handleRemoveDeveloper}
        title="Remove Developer"
        message={`Are you sure you want to remove ${devToRemove?.name} from "${project.name}"?`}
        confirmText="Remove from Project"
        confirmVariant="danger"
        isLoading={isRemoving}
      />

      {/* Add / Edit Phase Modal */}
      <Modal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        title={
          phaseModalMode === 'create'
            ? typeof insertPosition === 'number'
              ? `Insert Phase at #${insertPosition + 1}`
              : 'Add Deliverable Phase'
            : 'Edit Deliverable Phase'
        }
        subtitle={
          phaseModalMode === 'create'
            ? 'Define a new milestone step for project roadmap.'
            : 'Update title and description for this phase.'
        }
        maxWidth="md"
      >
        <form onSubmit={handlePhaseFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Phase Title *
            </label>
            <input
              type="text"
              required
              value={phaseTitle}
              onChange={(e) => setPhaseTitle(e.target.value)}
              placeholder="e.g. Database Connection, Testing & QA..."
              className="block w-full rounded-xl border border-slate-300/80 bg-white/70 py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={phaseDescription}
              onChange={(e) => setPhaseDescription(e.target.value)}
              placeholder="Provide context, acceptance criteria, or implementation details..."
              className="block w-full rounded-xl border border-slate-300/80 bg-white/70 py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
            />
          </div>

          {/* If project has developers, allow choosing which developer this phase belongs to */}
          {project.developers && project.developers.length > 1 && phaseModalMode === 'create' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Assign to Developer
              </label>
              <select
                value={targetDevId}
                onChange={(e) => setTargetDevId(e.target.value)}
                className="block w-full rounded-xl border border-slate-300/80 bg-white py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {project.developers.map((d) => (
                  <option key={d._id || d} value={d._id || d}>
                    {d.name || d.email || 'Developer'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsPhaseModalOpen(false)}
              className="rounded-xl border border-slate-300/80 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-soft-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingPhase}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-soft-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all disabled:opacity-50"
            >
              {isSubmittingPhase ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : phaseModalMode === 'create' ? (
                typeof insertPosition === 'number'
                  ? `Insert at #${insertPosition + 1}`
                  : 'Add Phase'
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Phase Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeletePhaseOpen}
        onClose={() => setIsDeletePhaseOpen(false)}
        onConfirm={handleDeletePhase}
        title="Delete Deliverable Phase"
        message={`Are you sure you want to permanently delete "${phaseToDelete?.title}"?`}
        confirmText="Delete Phase"
        confirmVariant="danger"
        isLoading={isDeletingPhase}
      />

      {/* Bulk Phase & Templates Modal */}
      <BulkPhaseModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        projectId={id}
        onPhasesCreated={() => fetchProjectData()}
      />
    </div>
  );
};

export default ProjectDetailsPage;

