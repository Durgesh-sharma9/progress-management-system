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
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 p-6 sm:p-8 text-white shadow-soft-xl border border-slate-800">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-10 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-emerald-300 mb-3">
              <Code2 className="h-3.5 w-3.5" />
              Developer Workspace Active
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
              Manage your deliverable phases, check off sprint milestones in real-time, and monitor team velocity across your active projects.
            </p>
          </div>
          <Link
            to="/developer/phases"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-soft-md shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500 transition-all duration-200 active:scale-95 shrink-0"
          >
            <CheckSquare className="h-4 w-4" />
            My Phases
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Projects"
          value={stats?.totalProjects || 0}
          icon={FolderGit2}
          color="blue"
          subtitle="Active project workspaces"
          trend="In Progress"
        />
        <StatCard
          title="My Phases"
          value={stats?.totalPhases || stats?.totalTasks || 0}
          icon={Layers}
          color="purple"
          subtitle="Created across projects"
          trend="Total Deliverables"
        />
        <StatCard
          title="Delivered"
          value={stats?.completedPhases || stats?.completedTasks || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Checked off & verified"
          trend="Completed Milestones"
        />
        <StatCard
          title="Pending"
          value={stats?.pendingPhases || stats?.pendingTasks || 0}
          icon={Clock}
          color="amber"
          subtitle="Awaiting completion"
          trend="Action Required"
        />
      </div>

      {/* My Projects Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">My Active Workspaces</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned project workspaces with real-time interactive checklist & flowchart synchronization
            </p>
          </div>
          <Link
            to="/developer/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/80 border border-brand-200/80 px-3.5 py-1.5 rounded-full transition-all duration-200"
          >
            View All Workspaces
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {!stats?.myProjects || stats.myProjects.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="No assigned projects yet"
            description="You have not been assigned to any projects by the administrator yet. Once assigned, your project workspaces will automatically appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.myProjects.map((project) => (
              <div
                key={project._id}
                className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <ProjectTypeBadge
                      projectType={project.projectType}
                      memberCount={project.developerCount || 0}
                      showCount={project.projectType === 'Group' || (project.developers && project.developers.length > 1)}
                      size="xs"
                    />
                  </div>

                  <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 mb-1">
                    {project.name}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-5 leading-relaxed min-h-[32px] font-normal">
                    {project.description || 'No project description specified.'}
                  </p>

                  {/* My Personal Progress Bar */}
                  <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50/90 to-brand-50/40 border border-slate-200/70 shadow-soft-xs">
                    <ProgressBar
                      progress={project.myProgress || 0}
                      label="My Phase Velocity"
                      size="md"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2.5 font-medium">
                      <span>
                        {project.myCompletedPhases || project.myCompletedTasks || 0} of{' '}
                        {project.myTotalPhases || project.myTotalTasks || 0} delivered
                      </span>
                      <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full font-mono">
                        {project.myPendingTasks || 0} pending
                      </span>
                    </div>
                  </div>

                  {/* Overall Project Progress Bar */}
                  <div className="mb-4">
                    <ProgressBar
                      progress={project.overallProgress || 0}
                      label="Team Overall Velocity"
                      size="sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    to={`/developer/workspace/${project._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-soft-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all duration-200 active:scale-[0.99]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Project Workspace
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperDashboard;

