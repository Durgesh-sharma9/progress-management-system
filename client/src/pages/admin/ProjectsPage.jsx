import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ProgressBar from '../../components/common/ProgressBar';
import ProjectTypeBadge from '../../components/common/ProjectTypeBadge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import {
  FolderGit2,
  Plus,
  Search,
  Users,
  User,
  Calendar,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  Check,
  Sparkles,
  X,
  Layers,
} from 'lucide-react';

const projectColorThemes = [
  {
    gradient: 'from-indigo-600 via-purple-600 to-pink-500',
    border: 'hover:border-purple-300',
    topBar: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
    iconBg: 'bg-gradient-to-tr from-indigo-600 to-purple-600',
    iconColor: 'text-white',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    btn: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-purple-500/20',
  },
  {
    gradient: 'from-blue-600 via-cyan-600 to-teal-500',
    border: 'hover:border-cyan-300',
    topBar: 'bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400',
    iconBg: 'bg-gradient-to-tr from-blue-600 to-cyan-600',
    iconColor: 'text-white',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    btn: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-cyan-500/20',
  },
  {
    gradient: 'from-emerald-600 via-teal-600 to-cyan-500',
    border: 'hover:border-emerald-300',
    topBar: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400',
    iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600',
    iconColor: 'text-white',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    btn: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20',
  },
  {
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    border: 'hover:border-amber-300',
    topBar: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500',
    iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-600',
    iconColor: 'text-white',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    btn: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/20',
  },
  {
    gradient: 'from-rose-500 via-pink-500 to-purple-500',
    border: 'hover:border-rose-300',
    topBar: 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500',
    iconBg: 'bg-gradient-to-tr from-rose-500 to-pink-600',
    iconColor: 'text-white',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    btn: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-rose-500/20',
  },
  {
    gradient: 'from-violet-600 via-fuchsia-600 to-indigo-600',
    border: 'hover:border-fuchsia-300',
    topBar: 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500',
    iconBg: 'bg-gradient-to-tr from-violet-600 to-fuchsia-600',
    iconColor: 'text-white',
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

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [developersList, setDevelopersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'Standalone' | 'Group'

  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectType: 'Standalone', // 'Standalone' | 'Group'
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
      projectType: 'Standalone',
      developers: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setModalMode('edit');
    setSelectedProjectId(project._id);
    const assignedDevIds = project.developers ? project.developers.map((d) => d._id || d) : [];
    const inferredType =
      project.projectType || (assignedDevIds.length > 1 ? 'Group' : 'Standalone');

    setFormData({
      name: project.name,
      description: project.description || '',
      projectType: inferredType,
      developers: assignedDevIds,
    });
    setIsModalOpen(true);
  };

  const handleTypeChange = (newType) => {
    setFormData((prev) => {
      let updatedDevs = [...prev.developers];
      if (newType === 'Standalone' && updatedDevs.length > 1) {
        updatedDevs = [updatedDevs[0]];
      }
      return {
        ...prev,
        projectType: newType,
        developers: updatedDevs,
      };
    });
  };

  const toggleDeveloperSelection = (devId) => {
    setFormData((prev) => {
      if (prev.projectType === 'Standalone') {
        const isSelected = prev.developers.includes(devId);
        return {
          ...prev,
          developers: isSelected ? [] : [devId],
        };
      } else {
        const exists = prev.developers.includes(devId);
        if (exists) {
          return { ...prev, developers: prev.developers.filter((id) => id !== devId) };
        } else {
          return { ...prev, developers: [...prev.developers, devId] };
        }
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
        success('Project and associated phases deleted');
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

  // Compute Standalone vs Group counts
  const standaloneCount = projects.filter((p) => {
    const type = p.projectType || (p.developers?.length > 1 ? 'Group' : 'Standalone');
    return type === 'Standalone';
  }).length;

  const groupCount = projects.filter((p) => {
    const type = p.projectType || (p.developers?.length > 1 ? 'Group' : 'Standalone');
    return type === 'Group';
  }).length;

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const pType =
      project.projectType || (project.developers?.length > 1 ? 'Group' : 'Standalone');
    const matchesType =
      typeFilter === 'All' || pType.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              Projects
            </h2>
            <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 shrink-0">
              {projects.length} Total
            </span>
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 shrink-0 hidden sm:inline-block">
              👤 {standaloneCount} Solo
            </span>
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 shrink-0 hidden sm:inline-block">
              👥 {groupCount} Group
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5 hidden sm:block">
            Create, track deliverables, and manage engineering team allocations.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white shadow-soft-xs hover:from-brand-500 hover:to-indigo-500 transition-all shrink-0 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
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

        {/* Project Type Filter Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white shadow-soft-xs overflow-x-auto no-scrollbar">
          {[
            { id: 'All', label: 'All' },
            { id: 'Standalone', label: '👤 Standalone' },
            { id: 'Group', label: '👥 Group' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-200 ${
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
            <p className="text-xs font-semibold text-slate-400">Loading projects...</p>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title={searchQuery || typeFilter !== 'All' ? 'No matching projects' : 'No projects found'}
          description={
            searchQuery || typeFilter !== 'All'
              ? 'Try adjusting your search query or project type filter.'
              : 'Create a new project to start tracking developer phases and progress.'
          }
          actionText={searchQuery ? undefined : 'Create First Project'}
          onAction={searchQuery ? undefined : openCreateModal}
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
                {/* Top Accent Gradient Ribbon */}
                <div className={`h-1.5 w-full ${theme.topBar}`} />

                <div className="p-3 sm:p-4">
                  {/* Card Header: Project Icon + Name + Actions */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Colorful Project Icon */}
                      <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl ${theme.iconBg} ${theme.iconColor} flex items-center justify-center shrink-0 shadow-soft-xs`}>
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
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {project.name}
                        </h3>
                      </div>
                    </div>

                    {/* Quick Edit/Delete Actions */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => openEditModal(project)}
                        title="Edit Project"
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => confirmDelete(project)}
                        title="Delete Project"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mb-2 font-normal leading-relaxed">
                      {project.description}
                    </p>
                  )}

                  {/* Dynamic Colorful Progress Bar Container */}
                  <div className="my-2 bg-slate-50/90 p-2 sm:p-2.5 rounded-xl border border-slate-200/70">
                    <ProgressBar
                      progress={project.overallProgress}
                      label="Delivery Velocity"
                      size="sm"
                    />
                  </div>

                  {/* Assigned Team Row with Colorful Gradient Avatar Stack */}
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
                          <span className="text-[10px] text-slate-400 italic">No dev assigned</span>
                        )}
                      </div>
                      {project.developers && project.developers.length > 4 && (
                        <span className="text-[10px] font-bold text-slate-500 font-mono">
                          +{project.developers.length - 4}
                        </span>
                      )}
                    </div>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${theme.badge} font-mono`}>
                      {project.developers?.length || 0} {project.developers?.length === 1 ? 'Dev' : 'Devs'}
                    </span>
                  </div>
                </div>

                {/* View Details Action with Colorful Gradient */}
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-0.5">
                  <Link
                    to={`/admin/projects/${project._id}`}
                    className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl ${theme.btn} py-1.5 sm:py-2 text-xs font-extrabold transition-all shadow-soft-xs active:scale-98`}
                  >
                    <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>View Details & Tree</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create New Project' : 'Edit Project'}
        subtitle="Specify project type, title, description, and developer assignments."
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Project Type Selection (Standalone vs Group) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Project Structure / Mode *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Standalone Card */}
              <div
                onClick={() => handleTypeChange('Standalone')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  formData.projectType === 'Standalone'
                    ? 'border-sky-500 bg-sky-50/70 shadow-soft-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-xl ${
                        formData.projectType === 'Standalone'
                          ? 'bg-sky-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      Standalone Project
                    </span>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      formData.projectType === 'Standalone'
                        ? 'border-sky-600 bg-sky-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {formData.projectType === 'Standalone' && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Single developer assignment. Focused individual deliverable workflow.
                </p>
              </div>

              {/* Group Card */}
              <div
                onClick={() => handleTypeChange('Group')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  formData.projectType === 'Group'
                    ? 'border-purple-500 bg-purple-50/70 shadow-soft-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-xl ${
                        formData.projectType === 'Group'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      Group Project
                    </span>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      formData.projectType === 'Group'
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {formData.projectType === 'Group' && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Multi-developer team collaboration with cross-phase sprint planning.
                </p>
              </div>
            </div>
          </div>

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

          {/* Assigned Developers Multi-Selection / Single selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {formData.projectType === 'Standalone'
                  ? 'Assign Solo Engineer (Optional / 1 max)'
                  : `Assign Team Engineers (${formData.developers.length} selected)`}
              </label>
              <span className="text-[11px] text-slate-500">
                {formData.projectType === 'Standalone'
                  ? formData.developers.length > 0
                    ? '1 Developer Assigned'
                    : 'None Selected (Can assign later)'
                  : `${formData.developers.length} Assigned`}
              </span>
            </div>

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
                          ? formData.projectType === 'Standalone'
                            ? 'bg-sky-50 border border-sky-300 text-sky-900 shadow-soft-xs'
                            : 'bg-brand-50 border border-brand-300 text-brand-900 shadow-soft-xs'
                          : 'bg-white border border-slate-200/80 text-slate-700 hover:border-slate-300 shadow-soft-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`h-8 w-8 rounded-lg text-white flex items-center justify-center text-xs font-bold shrink-0 ${
                            formData.projectType === 'Standalone' && isSelected
                              ? 'bg-gradient-to-tr from-sky-600 to-blue-600'
                              : 'bg-gradient-to-tr from-brand-600 to-indigo-600'
                          }`}
                        >
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
                            ? formData.projectType === 'Standalone'
                              ? 'bg-sky-600 border-sky-600 text-white'
                              : 'bg-brand-600 border-brand-600 text-white'
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
