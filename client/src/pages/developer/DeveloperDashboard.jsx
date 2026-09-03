import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import ProjectTypeBadge from '../../components/common/ProjectTypeBadge';
import EmptyState from '../../components/common/EmptyState';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Loader2,
  ExternalLink,
  Sparkles,
  Code2,
  CheckSquare,
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

const getProjectTheme = (idOrName, index = 0) => {
  let hash = index;
  if (idOrName) {
    for (let i = 0; i < idOrName.length; i++) {
      hash = idOrName.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  return projectColorThemes[Math.abs(hash) % projectColorThemes.length];
};

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects/developer/dashboard-stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching developer dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-xs font-semibold text-slate-400">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 sm:space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 p-3 sm:p-5 text-white shadow-soft-xl border border-slate-800">
        <div className="absolute -right-10 -top-10 h-48 sm:h-64 w-48 sm:w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-10 h-36 sm:h-48 w-36 sm:w-48 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[9px] sm:text-[10px] font-semibold text-emerald-300 mb-0.5 sm:mb-1">
              <Code2 className="h-2.5 w-2.5" />
              <span>Developer Workspace</span>
            </div>
            <h2 className="text-base sm:text-xl lg:text-2xl font-extrabold tracking-tight text-white font-sans">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 line-clamp-1 hidden sm:block font-normal">
              Manage your deliverable phases and track live milestone velocity.
            </p>
          </div>
          <Link
            to="/developer/phases"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white shadow-soft-xs hover:from-emerald-400 hover:to-teal-500 transition-all shrink-0 active:scale-95"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>My Phases</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <StatCard
          title="Assigned Projects"
          value={stats?.totalProjects || 0}
          icon={FolderGit2}
          color="blue"
          subtitle="Active workspaces"
          trend="In Progress"
        />
        <StatCard
          title="My Phases"
          value={stats?.totalPhases || stats?.totalTasks || 0}
          icon={Layers}
          color="purple"
          subtitle="Total deliverables"
          trend="All Phases"
        />
        <StatCard
          title="Delivered"
          value={stats?.completedPhases || stats?.completedTasks || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Completed milestones"
          trend="Done"
        />
        <StatCard
          title="Pending"
          value={stats?.pendingPhases || stats?.pendingTasks || 0}
          icon={Clock}
          color="amber"
          subtitle="In progress"
          trend="Remaining"
        />
      </div>

      {/* My Projects Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">Active Workspaces</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block">
              Assigned project workspaces with interactive checklist & flowchart synchronization
            </p>
          </div>
          <Link
            to="/developer/projects"
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/80 border border-brand-200/80 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full transition-all duration-200 shrink-0"
          >
            View All
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Link>
        </div>

        {!stats?.myProjects || stats.myProjects.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="No assigned projects yet"
            description="You have not been assigned to any projects by the administrator yet. Once assigned, your project workspaces will automatically appear here."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {stats.myProjects.map((project, idx) => {
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
                    {/* Header: Icon + Type Badge + Title */}
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl ${theme.iconBg} text-white flex items-center justify-center shrink-0 shadow-soft-xs`}>
                        <FolderGit2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <ProjectTypeBadge
                            projectType={currentType}
                            memberCount={project.developerCount || 0}
                            showCount={isGroup}
                            size="xs"
                          />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {project.name}
                        </h4>
                      </div>
                    </div>

                    {project.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mb-2 font-normal leading-relaxed">
                        {project.description}
                      </p>
                    )}

                    {/* Personal Progress Bar */}
                    <div className="my-2 bg-slate-50/90 p-2 sm:p-2.5 rounded-xl border border-slate-200/70">
                      <ProgressBar
                        progress={project.myProgress || 0}
                        label="My Deliverables"
                        size="sm"
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-600 mt-1.5 font-medium">
                        <span className="flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          {project.myCompletedPhases || project.myCompletedTasks || 0}/
                          {project.myTotalPhases || project.myTotalTasks || 0} done
                        </span>
                        <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded font-mono">
                          {project.myPendingTasks || 0} pending
                        </span>
                      </div>
                    </div>

                    {/* Overall Progress Badge */}
                    <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {isGroup ? 'Team Project' : 'Solo Project'}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${theme.badge} font-mono`}>
                        {project.overallProgress || 0}% Team Done
                      </span>
                    </div>
                  </div>

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
    </div>
  );
};

export default DeveloperDashboard;

