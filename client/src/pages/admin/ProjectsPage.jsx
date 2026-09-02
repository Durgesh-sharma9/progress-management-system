import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ProgressBar from '../../components/common/ProgressBar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import {
  FolderGit2,
  Plus,
  Search,
  Users,
  Calendar,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  Check,
  Sparkles,
  X,
} from 'lucide-react';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [developersList, setDevelopersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Planning',
    developers: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    fetchProjects();
    fetchDevelopers();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const res = await api.get('/users/developers');
      if (res.data.success) {
        setDevelopersList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch developers list:', err);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedProjectId(null);
    setFormData({
      name: '',
      description: '',
      status: 'Planning',
      developers: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setModalMode('edit');
    setSelectedProjectId(project._id);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status || 'Planning',
      developers: project.developers ? project.developers.map((d) => d._id || d) : [],
    });
    setIsModalOpen(true);
  };

  const toggleDeveloperSelection = (devId) => {
    setFormData((prev) => {
      const exists = prev.developers.includes(devId);
      if (exists) {
        return { ...prev, developers: prev.developers.filter((id) => id !== devId) };
      } else {
        return { ...prev, developers: [...prev.developers, devId] };
      }
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error('Project name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const res = await api.post('/projects', formData);
        if (res.data.success) {
          success('Project created successfully');
          setIsModalOpen(false);
          fetchProjects();
        }
      } else {
        const res = await api.put(`/projects/${selectedProjectId}`, formData);
        if (res.data.success) {
          success('Project updated successfully');
          setIsModalOpen(false);
          fetchProjects();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (project) => {
    setProjectToDelete(project);
    setIsDeleteOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/projects/${projectToDelete._id}`);
      if (res.data.success) {
        success('Project and associated phases/tasks deleted');
        setIsDeleteOpen(false);
        setProjectToDelete(null);
        fetchProjects();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-7">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Projects
            </h2>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              {projects.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Create, track deliverables, and manage engineering team allocations.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-soft-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all duration-200 active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by title or description..."
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

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-slate-200/80 bg-white shadow-soft-xs w-full sm:w-auto overflow-x-auto">
          {['All', 'Planning', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                statusFilter === status
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
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
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            <p className="text-xs font-semibold text-slate-400">Loading projects...</p>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matching projects' : 'No projects found'}
          description={
            searchQuery
              ? 'Try adjusting your search criteria or status filter.'
              : 'Create a new project to start tracking developer phases and progress.'
          }
          actionText={searchQuery ? undefined : 'Create First Project'}
          onAction={searchQuery ? undefined : openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                    {project.name}
                  </h3>
                  <StatusBadge status={project.status} />
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-5 leading-relaxed min-h-[32px] font-normal">
                  {project.description || 'No description provided.'}
                </p>

                {/* Progress Bar */}
                <div className="mb-5 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60">
                  <ProgressBar
                    progress={project.overallProgress}
                    label="Delivery Velocity"
                    size="md"
                  />
                </div>

                {/* Assigned Developers Avatar Stack */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mb-4 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-brand-50 text-brand-600 border border-brand-200">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-bold text-slate-700">
                      {project.developerCount || 0}{' '}
                      {project.developerCount === 1 ? 'Engineer' : 'Engineers'}
                    </span>
                  </div>

                  {project.developers && project.developers.length > 0 && (
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {project.developers.slice(0, 3).map((d, i) => (
                        <div
                          key={d._id || i}
                          title={d.name}
                          className="h-6 w-6 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-soft-xs"
                        >
                          {(d.name || 'D').charAt(0)}
                        </div>
                      ))}
                      {project.developers.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-700">
                          +{project.developers.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/admin/projects/${project._id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-200/80 px-3 py-2 text-xs font-bold text-brand-700 transition-colors shadow-soft-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Details
                </Link>

                <button
                  onClick={() => openEditModal(project)}
                  title="Edit Project"
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-soft-xs"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => confirmDelete(project)}
                  title="Delete Project"
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-soft-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create New Project' : 'Edit Project'}
        subtitle="Manage project specifications and assign team members."
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Mobile Banking Application"
              className="block w-full rounded-xl border border-slate-300/80 bg-white/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Summarize project scope, objectives, and deliverables..."
              className="block w-full rounded-xl border border-slate-300/80 bg-white/70 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="block w-full rounded-xl border border-slate-300/80 bg-white/70 px-3.5 py-2.5 text-sm text-slate-900 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Assigned Developers Multi-Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Assign Engineers ({formData.developers.length} selected)
            </label>
            <div className="max-h-44 overflow-y-auto space-y-2 pr-1 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-2.5">
              {developersList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">
                  No registered developers available.
                </p>
              ) : (
                developersList.map((dev) => {
                  const isSelected = formData.developers.includes(dev._id);
                  return (
                    <div
                      key={dev._id}
                      onClick={() => toggleDeveloperSelection(dev._id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-brand-50 border border-brand-300 text-brand-900 shadow-soft-xs'
                          : 'bg-white border border-slate-200/80 text-slate-700 hover:border-slate-300 shadow-soft-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {dev.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-slate-900">{dev.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{dev.email}</p>
                        </div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-soft-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-soft-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : modalMode === 'create' ? (
                'Create Project'
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${projectToDelete?.name}"? All associated phases and tasks will also be deleted.`}
        confirmText="Delete Project"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjectsPage;

