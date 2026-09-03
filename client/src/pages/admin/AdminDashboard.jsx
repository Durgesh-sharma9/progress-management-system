import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import ProjectTypeBadge from '../../components/common/ProjectTypeBadge';
import EmptyState from '../../components/common/EmptyState';
import {
  FolderGit2,
  Users,
  User,
  Plus,
  ArrowRight,
  Loader2,
  Sparkles,
  Layers,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects/admin/dashboard-stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-xs font-semibold text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 p-4 sm:p-6 lg:p-8 text-white shadow-soft-xl border border-slate-800">
        <div className="absolute -right-10 -top-10 h-48 sm:h-64 w-48 sm:w-64 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-10 h-36 sm:h-48 w-36 sm:w-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] sm:text-[11px] font-semibold text-brand-200 mb-2 sm:mb-3">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-300" />
              Organizational Command Center
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-sans">
              Admin Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl line-clamp-2 sm:line-clamp-none">
              Monitor real-time development velocity, inspect tree workflows, and manage cross-functional engineering teams.
            </p>
          </div>
          <Link
            to="/admin/projects"
            className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-600 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-soft-md shadow-brand-500/30 hover:from-brand-400 hover:to-indigo-500 transition-all duration-200 active:scale-95 shrink-0"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Manage Projects
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects || 0}
          icon={FolderGit2}
          color="blue"
          subtitle="All active workspaces"
          trend="Overview"
        />
        <StatCard
          title="Standalone"
          value={stats?.standaloneProjects || 0}
          icon={User}
          color="amber"
          subtitle="Solo engineer deliverables"
          trend="Solo Focus"
        />
        <StatCard
          title="Group Teams"
          value={stats?.groupProjects || 0}
          icon={Users}
          color="purple"
          subtitle="Multi-developer teams"
          trend="Team Collab"
        />
        <StatCard
          title="Engineers"
          value={stats?.totalDevelopers || 0}
          icon={Layers}
          color="emerald"
          subtitle="Registered members"
          trend="Active Devs"
        />
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">Recent Projects</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block">
              Live progress, Standalone vs Group classification, and active team assignments
            </p>
          </div>
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/80 border border-brand-200/80 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full transition-all duration-200 shrink-0"
          >
            View All
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Link>
        </div>

        {!stats?.recentProjects || stats.recentProjects.length === 0 ? (
          <EmptyState
            title="No projects available"
            description="Create your first project to start assigning developers and tracking progress."
            actionText="Create Project"
            onAction={() => window.location.href = '/admin/projects'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {stats.recentProjects.map((project) => {
              const currentType =
                project.projectType ||
                (project.developers && project.developers.length > 1 ? 'Group' : 'Standalone');
              const isGroup = currentType === 'Group';

              return (
                <div
                  key={project._id}
                  className="glass-card glass-card-hover rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badge (Type) */}
                    <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                      <ProjectTypeBadge
                        projectType={currentType}
                        memberCount={project.developerCount || 0}
                        showCount={isGroup}
                        size="xs"
                      />
                    </div>

                    <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 mb-1">
                      {project.name}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-5 leading-relaxed font-normal">
                      {project.description || 'No project description provided.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-5 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60">
                      <ProgressBar
                        progress={project.overallProgress}
                        label="Milestones Delivered"
                        size="md"
                      />
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 flex flex-col gap-2.5">
                    {project.developers && project.developers.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                        {project.developers.map((d, i) => (
                          <div
                            key={d._id || i}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[11px]"
                          >
                            <div className="h-4 w-4 rounded bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-[8px] font-bold">
                              {(d.name || 'D').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-800 truncate max-w-[110px]">
                              {d.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No engineers assigned</span>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {isGroup ? `${project.developerCount || 0} Engineers` : 'Solo Engineer'}
                      </span>
                      <Link
                        to={`/admin/projects/${project._id}`}
                        className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-colors text-xs"
                      >
                        Details
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
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

export default AdminDashboard;
