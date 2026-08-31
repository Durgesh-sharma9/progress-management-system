import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import StatusBadge from '../../components/common/StatusBadge';
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
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-50 via-white to-indigo-50 border border-brand-200 p-6 lg:p-8 relative overflow-hidden shadow-sm">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 border border-brand-200 text-brand-800 text-xs font-bold mb-3 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            Developer Workspace Active
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed font-medium">
            Manage your project phases, check off completed milestones with checkboxes, and watch project progress sync automatically across your team.
          </p>
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
        />
        <StatCard
          title="Total My Phases"
          value={stats?.totalPhases || stats?.totalTasks || 0}
          icon={Layers}
          color="purple"
          subtitle="Created across projects"
        />
        <StatCard
          title="Completed Phases"
          value={stats?.completedPhases || stats?.completedTasks || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Checked off & verified"
        />
        <StatCard
          title="Pending Phases"
          value={stats?.pendingPhases || stats?.pendingTasks || 0}
          icon={Clock}
          color="amber"
          subtitle="Awaiting completion"
        />
      </div>

      {/* My Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">My Projects</h3>
            <p className="text-xs text-slate-500">
              Assigned project workspaces with live progress tracking
            </p>
          </div>
          <Link
            to="/developer/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            View All My Projects
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {!stats?.myProjects || stats.myProjects.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="No assigned projects yet"
            description="You have not been assigned to any projects by the admin yet. Once assigned, your project workspaces will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.myProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                      {project.name}
                    </h4>
                    <StatusBadge status={project.status} />
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-5 leading-relaxed min-h-[32px]">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* My Personal Progress Bar */}
                  <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <ProgressBar
                      progress={project.myProgress || 0}
                      label="My Personal Progress"
                      size="md"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2 font-medium">
                      <span>
                        {project.myCompletedPhases || project.myCompletedTasks || 0} of{' '}
                        {project.myTotalPhases || project.myTotalTasks || 0} phases done
                      </span>
                      <span className="font-bold text-emerald-600">
                        {project.myPendingTasks || 0} pending
                      </span>
                    </div>
                  </div>

                  {/* Overall Project Progress Bar */}
                  <div className="mb-4">
                    <ProgressBar
                      progress={project.overallProgress || 0}
                      label="Team Overall Progress"
                      size="sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    to={`/developer/workspace/${project._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/20 hover:bg-brand-500 transition-all active:scale-[0.99]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Workspace
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
