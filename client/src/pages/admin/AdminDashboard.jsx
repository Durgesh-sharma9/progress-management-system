import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import {
  FolderGit2,
  Clock,
  CheckCircle2,
  Users,
  Plus,
  ArrowRight,
  Loader2,
  Calendar,
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
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Admin Overview
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitor organizational projects, developer workflows, and completion rates.
          </p>
        </div>
        <Link
          to="/admin/projects"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 hover:bg-brand-500 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Manage Projects
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects || 0}
          icon={FolderGit2}
          color="blue"
          subtitle="All active & archived projects"
        />
        <StatCard
          title="Active Projects"
          value={stats?.activeProjects || 0}
          icon={Clock}
          color="amber"
          subtitle="Currently in progress"
        />
        <StatCard
          title="Completed Projects"
          value={stats?.completedProjects || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Successfully delivered"
        />
        <StatCard
          title="Total Developers"
          value={stats?.totalDevelopers || 0}
          icon={Users}
          color="purple"
          subtitle="Registered team members"
        />
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Projects</h3>
            <p className="text-xs text-slate-500">
              Live progress and status of active initiatives
            </p>
          </div>
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            View All Projects
            <ArrowRight className="h-3.5 w-3.5" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stats.recentProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                      {project.name}
                    </h4>
                    <StatusBadge status={project.status} />
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {project.description || 'No project description provided.'}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <ProgressBar
                      progress={project.overallProgress}
                      label="Overall Progress"
                      size="md"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-brand-600" />
                    <span className="font-medium text-slate-700">
                      {project.developerCount}{' '}
                      {project.developerCount === 1 ? 'Developer' : 'Developers'}
                    </span>
                  </div>

                  <Link
                    to={`/admin/projects/${project._id}`}
                    className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    Details
                    <ArrowRight className="h-3 w-3" />
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

export default AdminDashboard;
