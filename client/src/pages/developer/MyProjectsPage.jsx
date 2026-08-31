import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ProgressBar from '../../components/common/ProgressBar';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import {
  FolderGit2,
  Search,
  ExternalLink,
  Loader2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

const MyProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
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
    const matchesStatus =
      statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          My Assigned Projects
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Open a workspace to organize your phases and check off completed tasks.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assigned projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-sm"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 bg-white shadow-sm w-full sm:w-auto overflow-x-auto">
          {['All', 'Planning', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title={searchQuery ? 'No matching projects found' : 'No assigned projects'}
          description={
            searchQuery
              ? 'Try modifying your search query or status filter.'
              : 'You are currently not assigned to any projects.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                    {project.name}
                  </h3>
                  <StatusBadge status={project.status} />
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed min-h-[32px]">
                  {project.description || 'No description provided.'}
                </p>

                {/* Personal Progress */}
                <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <ProgressBar
                    progress={project.myProgress || 0}
                    label="My Personal Progress"
                    size="md"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2 font-medium">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      {project.myCompletedTasks || 0} / {project.myTotalTasks || 0} tasks done
                    </span>
                    <span className="font-bold text-amber-600">
                      {project.myPendingTasks || 0} pending
                    </span>
                  </div>
                </div>

                {/* Overall Progress */}
                <div className="mb-5">
                  <ProgressBar
                    progress={project.overallProgress || 0}
                    label="Team Overall Progress"
                    size="sm"
                  />
                </div>
              </div>

              <Link
                to={`/developer/workspace/${project._id}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/20 hover:bg-brand-500 transition-all active:scale-[0.99]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Workspace
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjectsPage;
