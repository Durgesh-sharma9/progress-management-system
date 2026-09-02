import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ProgressBar from '../../components/common/ProgressBar';
import ProjectTypeBadge from '../../components/common/ProjectTypeBadge';
import EmptyState from '../../components/common/EmptyState';
import {
  FolderGit2,
  Search,
  ExternalLink,
  Loader2,
  Calendar,
  CheckCircle2,
  X,
  Layers,
  Users,
  User,
} from 'lucide-react';

const MyProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const { error } = useToast();

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      error('Failed to load assigned projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const currentType =
      project.projectType ||
      (project.developers && project.developers.length > 1 ? 'Group' : 'Standalone');
    const matchesType =
      typeFilter === 'All' || currentType.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Assigned Projects
          </h2>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            {projects.length} Assigned
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Open a workspace to organize your phases, sync checklist tasks, and visualize live project flows.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assigned projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200/90 bg-white/80 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Project Type Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-slate-200/80 bg-white shadow-soft-xs overflow-x-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pl-2 pr-1 hidden sm:inline">
            Type:
          </span>
          {[
            { id: 'All', label: 'All' },
            { id: 'Standalone', label: '👤 Solo' },
            { id: 'Group', label: '👥 Team' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                typeFilter === type.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            <p className="text-xs font-semibold text-slate-400">Loading assigned projects...</p>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title={searchQuery || typeFilter !== 'All' ? 'No matching projects found' : 'No assigned projects'}
          description={
            searchQuery || typeFilter !== 'All'
              ? 'Try modifying your search query or type filter.'
              : 'You are currently not assigned to any projects.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const currentType =
              project.projectType ||
              (project.developers && project.developers.length > 1 ? 'Group' : 'Standalone');
            const isGroup = currentType === 'Group';

            return (
              <div
                key={project._id}
                className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <ProjectTypeBadge
                      projectType={currentType}
                      memberCount={project.developerCount || 0}
                      showCount={isGroup}
                      size="xs"
                    />
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 mb-1">
                    {project.name}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-5 leading-relaxed min-h-[32px] font-normal">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Personal Progress */}
                  <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50/90 to-brand-50/40 border border-slate-200/70 shadow-soft-xs">
                    <ProgressBar
                      progress={project.myProgress || 0}
                      label="My Deliverable Velocity"
                      size="md"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2.5 font-medium">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        {project.myCompletedTasks || 0} / {project.myTotalTasks || 0} phases done
                      </span>
                      <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full font-mono">
                        {project.myPendingTasks || 0} pending
                      </span>
                    </div>
                  </div>

                  {/* Overall Progress */}
                  <div className="mb-4">
                    <ProgressBar
                      progress={project.overallProgress || 0}
                      label={isGroup ? "Team Overall Velocity" : "Project Overall Velocity"}
                      size="sm"
                    />
                  </div>

                  {/* Team Members List */}
                  {project.developers && project.developers.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 mb-4">
                      <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                        {project.developers.map((d, i) => (
                          <div
                            key={d._id || i}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px]"
                          >
                            <div className="h-3.5 w-3.5 rounded bg-brand-600 text-white flex items-center justify-center text-[8px] font-bold">
                              {(d.name || 'D').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800 truncate max-w-[100px]">
                              {d.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to={`/developer/workspace/${project._id}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-soft-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all duration-200 active:scale-[0.99]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Workspace
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProjectsPage;
