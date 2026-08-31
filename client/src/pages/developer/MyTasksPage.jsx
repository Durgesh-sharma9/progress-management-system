import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/common/EmptyState';
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
} from 'lucide-react';

const MyTasksPage = () => {
  const [phases, setPhases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Completed' | 'Pending'
  const [projectFilter, setProjectFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleTogglePhase = async (phaseId) => {
    // Optimistic toggle
    const previousPhases = [...phases];
    setPhases((prev) =>
      prev.map((p) =>
        p._id === phaseId
          ? {
              ...p,
              completed: !p.completed,
              completedAt: !p.completed ? new Date().toISOString() : null,
            }
          : p
      )
    );

    try {
      const res = await api.patch(`/phases/${phaseId}/toggle`);
      if (res.data.success) {
        success(res.data.message || 'Phase status updated');
      }
    } catch (err) {
      setPhases(previousPhases);
      error(err.response?.data?.message || 'Failed to update phase');
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Deliverables & Phases
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            View, filter, and check off your development milestones across all assigned projects.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            {totalCompleted} Completed
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-sm">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            {totalPending} Pending
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search your phases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-sm"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-200 bg-white shadow-sm w-full sm:w-auto">
            {['All', 'Completed', 'Pending'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === status
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Project Dropdown */}
          <div className="w-full sm:w-auto min-w-[200px]">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-sm"
            >
              <option value="All">All Projects</option>
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
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : filteredPhases.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={searchQuery ? 'No matching phases' : 'No phases created yet'}
          description={
            searchQuery
              ? 'Try clearing your search or changing the filter options.'
              : 'Open a project workspace to create your first phase.'
          }
          actionText={searchQuery ? undefined : 'View My Projects'}
          onAction={searchQuery ? undefined : () => window.location.href = '/developer/projects'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {filteredPhases.map((phase) => (
            <div
              key={phase._id}
              className={`flex items-start sm:items-center justify-between gap-4 p-4 lg:p-5 transition-colors ${
                phase.completed ? 'bg-slate-50/50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
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
                    className={`text-sm font-semibold cursor-pointer select-none transition-colors ${
                      phase.completed
                        ? 'line-through text-slate-400'
                        : 'text-slate-800'
                    }`}
                  >
                    {phase.title}
                  </p>

                  {phase.description && (
                    <p
                      className={`text-xs mt-0.5 line-clamp-1 ${
                        phase.completed ? 'text-slate-400 line-through' : 'text-slate-500'
                      }`}
                    >
                      {phase.description}
                    </p>
                  )}

                  {/* Project Badge */}
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                      <FolderGit2 className="h-3 w-3 text-brand-600" />
                      {phase.projectId?.name || 'Project'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Link to Workspace */}
              <div className="flex items-center gap-2 shrink-0">
                {phase.completed ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Completed
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    <Clock className="h-3.5 w-3.5" />
                    Pending
                  </span>
                )}

                {phase.projectId?._id && (
                  <Link
                    to={`/developer/workspace/${phase.projectId._id}`}
                    title="Open in Workspace"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
