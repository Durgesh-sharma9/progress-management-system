import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ProgressBar from '../../components/common/ProgressBar';
import ProjectTypeBadge from '../../components/common/ProjectTypeBadge';
import ProjectCategoryBadge from '../../components/common/ProjectCategoryBadge';
import TechStackPills from '../../components/common/TechStackPills';
import EmptyState from '../../components/common/EmptyState';
import RocketLoader from '../../components/common/RocketLoader';
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
  ArrowUpDown,
} from 'lucide-react';

const projectColorThemes = [
  {
    topBar: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
    border: 'hover:border-purple-300',
    iconBg: 'bg-gradient-to-tr from-indigo-600 to-purple-600',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    btn: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-purple-500/20',
  },
  {
    topBar: 'bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400',
    border: 'hover:border-cyan-300',
    iconBg: 'bg-gradient-to-tr from-blue-600 to-cyan-600',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    btn: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-cyan-500/20',
  },
  {
    topBar: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400',
    border: 'hover:border-emerald-300',
    iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    btn: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20',
  },
  {
    topBar: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500',
    border: 'hover:border-amber-300',
    iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-600',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    btn: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/20',
  },
  {
    topBar: 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500',
    border: 'hover:border-rose-300',
    iconBg: 'bg-gradient-to-tr from-rose-500 to-pink-600',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    btn: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-rose-500/20',
  },
  {
    topBar: 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500',
    border: 'hover:border-fuchsia-300',
    iconBg: 'bg-gradient-to-tr from-violet-600 to-fuchsia-600',
    badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    btn: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-fuchsia-500/20',
  },
];

const devAvatarGradients = [
  'from-blue-600 to-indigo-600',
  'from-emerald-600 to-teal-600',
  'from-purple-600 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-rose-600 to-red-600',
  'from-cyan-600 to-blue-600',
];

const getProjectTheme = (idOrName, index = 0) => {
  let hash = index;
  if (idOrName) {
    for (let i = 0; i < idOrName.length; i++) {
      hash = idOrName.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  return projectColorThemes[Math.abs(hash) % projectColorThemes.length];
};

const getDevAvatarGradient = (str) => {
  let hash = 0;
  if (str) {
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  return devAvatarGradients[Math.abs(hash) % devAvatarGradients.length];
};

const MyProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');
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

  // Compute counts
  const standaloneCount = projects.filter((p) => {
    const type = p.projectType || (p.developers?.length > 1 ? 'Group' : 'Standalone');
    return type === 'Standalone';
  }).length;

  const groupCount = projects.filter((p) => {
    const type = p.projectType || (p.developers?.length > 1 ? 'Group' : 'Standalone');
    return type === 'Group';
  }).length;

  const inProgressCount = projects.filter((p) => {
    const isCompleted =
      p.status === 'Completed' ||
      (p.totalPhases > 0 && p.completedPhases === p.totalPhases) ||
      (p.overallProgress === 100 && p.totalPhases > 0);
    return !isCompleted;
  }).length;

  const completedCount = projects.filter((p) => {
    const isCompleted =
      p.status === 'Completed' ||
      (p.totalPhases > 0 && p.completedPhases === p.totalPhases) ||
      (p.overallProgress === 100 && p.totalPhases > 0);
    return isCompleted;
  }).length;

  // Filter and sort
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.techStack && project.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const currentType =
        project.projectType ||
        (project.developers && project.developers.length > 1 ? 'Group' : 'Standalone');
      const matchesType =
        typeFilter === 'All' || currentType.toLowerCase() === typeFilter.toLowerCase();

      const isCompleted =
        project.status === 'Completed' ||
        (project.totalPhases > 0 && project.completedPhases === project.totalPhases) ||
        (project.overallProgress === 100 && project.totalPhases > 0);

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'In Progress' && !isCompleted) ||
        (statusFilter === 'Completed' && isCompleted);

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      const progA = a.overallProgress || 0;
      const progB = b.overallProgress || 0;

      if (sortBy === 'progress-asc') {
        return progA - progB;
      }
      if (sortBy === 'progress-desc') {
        return progB - progA;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              My Assigned Projects
            </h2>
            <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 shrink-0">
              {projects.length} Assigned
            </span>
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0 hidden sm:inline-block">
              ⚡ {inProgressCount} In Progress
            </span>
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 hidden sm:inline-block">
              ✅ {completedCount} Completed
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5 hidden sm:block">
            Open a workspace to organize your phases and sync live project flows.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assigned projects by name, tech stack..."
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

        {/* Sort Selector Dropdown */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl px-3 py-2 shadow-soft-xs shrink-0">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
          >
            <option value="default">Default</option>
            <option value="progress-asc">📈 Lowest Progress (0% → 100%)</option>
            <option value="progress-desc">📉 Highest Progress (100% → 0%)</option>
            <option value="name">🔤 Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Double Filter Bar: Project Type + Status */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white shadow-soft-xs overflow-x-auto no-scrollbar">
          {[
            { id: 'All', label: 'All', count: projects.length },
            { id: 'Standalone', label: '👤 Standalone', count: standaloneCount },
            { id: 'Group', label: '👥 Group', count: groupCount },
          ].map((type) => {
            const active = typeFilter === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setTypeFilter(type.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span>{type.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {type.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Filter Tabs (Double Filter) */}
        <div className="flex items-center gap-1 p-1 rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white shadow-soft-xs overflow-x-auto no-scrollbar">
          {[
            { id: 'All', label: 'All Status', count: projects.length },
            { id: 'In Progress', label: '⚡ In Progress', count: inProgressCount, activeColor: 'bg-amber-500 text-white' },
            { id: 'Completed', label: '✅ Completed', count: completedCount, activeColor: 'bg-emerald-600 text-white' },
          ].map((status) => {
            const active = statusFilter === status.id;
            return (
              <button
                key={status.id}
                onClick={() => setStatusFilter(status.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? (status.activeColor ? `${status.activeColor} shadow-sm` : 'bg-slate-900 text-white shadow-sm')
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span>{status.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    active
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {status.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Progress Sort Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider shrink-0">
          Progress Sort:
        </span>
        <button
          onClick={() => setSortBy(sortBy === 'progress-asc' ? 'default' : 'progress-asc')}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border transition-all shrink-0 ${
            sortBy === 'progress-asc'
              ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>📈 Lowest to Highest (0% → 100%)</span>
          {sortBy === 'progress-asc' && <span className="text-amber-600 font-extrabold">✓</span>}
        </button>
        <button
          onClick={() => setSortBy(sortBy === 'progress-desc' ? 'default' : 'progress-desc')}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border transition-all shrink-0 ${
            sortBy === 'progress-desc'
              ? 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-2xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>📉 Highest to Lowest (100% → 0%)</span>
          {sortBy === 'progress-desc' && <span className="text-indigo-600 font-extrabold">✓</span>}
        </button>
        {sortBy !== 'default' && (
          <button
            onClick={() => setSortBy('default')}
            className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 underline ml-1 shrink-0"
          >
            Reset
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RocketLoader size="lg" text="Loading assigned projects..." subtitle="Fetching repositories" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredProjects.map((project, idx) => {
            const currentType =
              project.projectType ||
              (project.developers && project.developers.length > 1 ? 'Group' : 'Standalone');
            const isGroup = currentType === 'Group';
            const theme = getProjectTheme(project._id || project.name, idx);

            return (
              <div
                key={project._id}
                className={`relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 hover:shadow-soft-lg ${theme.border} flex flex-col justify-between transition-all duration-300 group`}
              >
                {/* Top Accent Ribbon */}
                <div className={`h-1.5 w-full ${theme.topBar}`} />

                <div className="p-3 sm:p-4">
                  {/* Card Header: Icon + Type Badge + Title */}
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl ${theme.iconBg} text-white flex items-center justify-center shrink-0 shadow-soft-xs`}>
                      <FolderGit2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <ProjectCategoryBadge
                          category={project.category || 'Web App'}
                          size="xs"
                        />
                        <ProjectTypeBadge
                          projectType={currentType}
                          memberCount={project.developerCount || 0}
                          showCount={isGroup}
                          size="xs"
                        />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-brand-600 transition-colors">
                        {project.name}
                      </h3>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mb-1.5 font-normal leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  {/* Tech Stack Pills */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="mb-2">
                      <TechStackPills techStack={project.techStack} max={3} size="xs" />
                    </div>
                  )}

                  {/* Start Date info */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-1.5">
                    <span className="inline-flex items-center gap-1 font-mono text-slate-500">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      Start: {new Date(project.startDate || project.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* My Personal Progress Box */}
                  <div className="my-2 bg-slate-50/90 p-2 sm:p-2.5 rounded-xl border border-slate-200/70">
                    <ProgressBar
                      progress={project.myProgress || 0}
                      label="My Deliverables"
                      size="sm"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-600 mt-1.5 font-medium">
                      <span className="flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        {project.myCompletedTasks || 0}/{project.myTotalTasks || 0} done
                      </span>
                      <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded font-mono">
                        {project.myPendingTasks || 0} pending
                      </span>
                    </div>
                  </div>

                  {/* Team Members Avatar Stack */}
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="flex items-center -space-x-1.5 overflow-hidden py-0.5">
                        {project.developers && project.developers.length > 0 ? (
                          project.developers.slice(0, 4).map((d, i) => (
                            <div
                              key={d._id || i}
                              title={d.name || d.email}
                              className={`inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-tr ${getDevAvatarGradient(d.name || d._id)} text-white text-[8px] sm:text-[9px] font-bold ring-1.5 sm:ring-2 ring-white shadow-xs`}
                            >
                              {(d.name || 'D').charAt(0).toUpperCase()}
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Solo project</span>
                        )}
                      </div>
                      {project.developers && project.developers.length > 4 && (
                        <span className="text-[10px] font-bold text-slate-500 font-mono">
                          +{project.developers.length - 4}
                        </span>
                      )}
                    </div>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${theme.badge} font-mono`}>
                      {project.overallProgress || 0}% Total
                    </span>
                  </div>
                </div>

                {/* Open Workspace Action */}
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-0.5">
                  <Link
                    to={`/developer/workspace/${project._id}`}
                    className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl ${theme.btn} py-1.5 sm:py-2 text-xs font-extrabold transition-all shadow-soft-xs active:scale-98`}
                  >
                    <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>Open Workspace</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProjectsPage;
