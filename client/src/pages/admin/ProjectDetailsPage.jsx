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

  // Collapsible phases viewer state
  const [expandedDevId, setExpandedDevId] = useState(null);

  // Notes Modal state for Admin inspection
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedPhaseForNotes, setSelectedPhaseForNotes] = useState(null);

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
                <ProjectTypeBadge
                  projectType={project.projectType}
                  memberCount={project.developers?.length || 0}
                  showCount={true}
                  size="xs"
                />
              </div>
              {project.description && (
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {project.description}
                </p>
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
          Team ({project.developerStats?.length || 0})
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
          currentUserId={null}
        />
      )}

      {/* VIEW 2: ALL DELIVERABLES & WORK NOTES */}
      {viewMode === 'deliverables' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Project Deliverables & Developer Logs</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Track all completed deliverables, PR links, and implementation notes from developers
              </p>
            </div>
            <span className="text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
              {phases.filter(p => p.completed).length}/{phases.length} Done
            </span>
          </div>

          {phases.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="No deliverables created"
              description="Assigned engineers have not created any deliverable phases for this project yet."
            />
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {phases.map((phase) => {
                const devName = phase.developerId?.name || 'Developer';
                return (
                  <div
                    key={phase._id}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 shadow-soft-xs ${
                      phase.completed
                        ? 'bg-emerald-50/30 border-emerald-200/80'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="mt-0.5">
                          {phase.completed ? (
                            <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Square className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {phase.title}
                          </h4>
                          {phase.description && (
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              {phase.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] sm:text-[11px]">
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

                      <button
                        onClick={() => {
                          setSelectedPhaseForNotes(phase);
                          setIsNotesModalOpen(true);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all border shadow-soft-xs shrink-0 ${
                          phase.notes
                            ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        📝 {phase.notes ? 'Notes' : 'No Notes'}
                      </button>
                    </div>

                    {/* Prominent Notes Box for Admin */}
                    {phase.notes && (
                      <div className="mt-2.5 p-2.5 rounded-lg sm:rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-950 font-mono">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5" />
                            Dev Log Note:
                          </span>
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
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Assigned Engineering Team</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Engineers and individual milestone progress
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

      {/* Admin Notes Viewer Modal */}
      <PhaseNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
          setSelectedPhaseForNotes(null);
        }}
        phase={selectedPhaseForNotes}
        isOwner={false}
      />
    </div>
  );
};

export default ProjectDetailsPage;

