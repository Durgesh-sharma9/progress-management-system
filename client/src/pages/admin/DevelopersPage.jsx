import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Clock,
  Loader2,
  Mail,
  Lock,
  User,
  X,
  Sparkles,
  ShieldCheck,
  FolderGit2,
  CheckCircle2,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';

const DevelopersPage = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Developer Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    joiningDate: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Developer Modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [devToDelete, setDevToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/developers');
      if (res.data.success) {
        setDevelopers(res.data.data);
      }
    } catch (err) {
      error('Failed to load developers list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeveloper = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      error('Name, email, and password are required');
      return;
    }

    if (formData.password.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/users/developers', formData);
      if (res.data.success) {
        success('Developer created successfully');
        setIsAddOpen(false);
        setFormData({ name: '', email: '', password: '', joiningDate: new Date().toISOString().split('T')[0] });
        fetchDevelopers();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create developer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (dev) => {
    setDevToDelete(dev);
    setIsDeleteOpen(true);
  };

  const handleDeleteDeveloper = async () => {
    if (!devToDelete) return;

    setIsDeleting(true);
    try {
      const res = await api.delete(`/users/developers/${devToDelete._id}`);
      if (res.data.success) {
        success('Developer removed successfully');
        setIsDeleteOpen(false);
        setDevToDelete(null);
        fetchDevelopers();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete developer');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDevelopers = developers.filter((dev) =>
    dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dev.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3.5 sm:space-y-6">
      {/* Compact Header */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <h2 className="text-sm sm:text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
            Developer Directory
          </h2>
          <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            {developers.length} Registered
          </span>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white shadow-soft-xs hover:from-brand-500 hover:to-indigo-500 transition-all shrink-0 active:scale-95 ml-auto sm:ml-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Engineer</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search engineer by name or email..."
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

      {/* Developers Roster Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            <p className="text-xs font-semibold text-slate-400">Loading developers roster...</p>
          </div>
        </div>
      ) : filteredDevelopers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No developers found"
          description={
            searchQuery
              ? 'No developers match your search query.'
              : 'Add your first developer or have developers register themselves.'
          }
          actionText={searchQuery ? undefined : 'Add Engineer'}
          onAction={searchQuery ? undefined : () => setIsAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {filteredDevelopers.map((dev) => (
            <div
              key={dev._id}
              className="glass-card glass-card-hover rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between transition-all"
            >
              <div>
                {/* Developer Profile Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-soft-xs shrink-0">
                      {dev.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {dev.name}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                        {dev.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => confirmDelete(dev)}
                    title="Delete Developer"
                    className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-transparent transition-all shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Statistics Box */}
                <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-50/80 border border-slate-200/80 mb-2.5 text-center">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-500">
                      Projects
                    </p>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-800 mt-0.5 font-mono">
                      {dev.assignedProjectsCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-500">
                      Phases
                    </p>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-800 mt-0.5 font-mono">
                      {dev.totalTasks}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-emerald-600">
                      Done
                    </p>
                    <p className="text-xs sm:text-sm font-extrabold text-emerald-600 mt-0.5 font-mono">
                      {dev.completedTasks}
                    </p>
                  </div>
                </div>

                {/* Overall Task Completion */}
                <div className="mb-2">
                  <ProgressBar
                    progress={dev.progress}
                    label="Overall Delivery Rate"
                    size="sm"
                  />
                </div>

                {/* Clickable Assigned Projects Chips */}
                <div className="my-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <FolderGit2 className="h-3 w-3 text-brand-600" />
                      Assigned Projects
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-600">
                      {dev.assignedProjects?.length || 0}
                    </span>
                  </div>

                  {dev.assignedProjects && dev.assignedProjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto no-scrollbar">
                      {dev.assignedProjects.map((proj) => {
                        const done = proj.completedPhases ?? 0;
                        const total = proj.totalPhases ?? 0;
                        return (
                          <Link
                            key={proj._id}
                            to={`/admin/projects/${proj._id}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200/80 hover:border-brand-300 transition-all shadow-2xs group/proj active:scale-95"
                            title={`Open ${proj.name} Details (${done}/${total} Phases Delivered)`}
                          >
                            <span className="truncate max-w-[130px]">{proj.name}</span>
                            <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-white/80 border border-brand-200 text-brand-800 shrink-0 font-extrabold">
                              {done}/{total}
                            </span>
                            <ArrowUpRight className="h-2.5 w-2.5 text-brand-500 group-hover/proj:translate-x-0.5 group-hover/proj:-translate-y-0.5 transition-transform shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic py-0.5">
                      No projects currently assigned
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Clock className="h-3 w-3 text-amber-600" />
                  {dev.pendingTasks} Phases Pending
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  Joined {new Date(dev.joiningDate || dev.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Developer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Engineer"
        subtitle="Create an active developer account in the organization."
        maxWidth="md"
      >
        <form onSubmit={handleAddDeveloper} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name *
            </label>
            <div className="relative rounded-xl shadow-soft-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="block w-full rounded-xl border border-slate-300/80 bg-white/70 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address *
            </label>
            <div className="relative rounded-xl shadow-soft-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="developer@company.com"
                className="block w-full rounded-xl border border-slate-300/80 bg-white/70 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password *
            </label>
            <div className="relative rounded-xl shadow-soft-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="block w-full rounded-xl border border-slate-300/80 bg-white/70 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-brand-600" />
              <span>Joining Date</span>
            </label>
            <div className="relative rounded-xl shadow-soft-xs">
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="block w-full rounded-xl border border-slate-300/80 bg-white/70 py-2.5 px-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
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
                  Creating...
                </>
              ) : (
                'Create Engineer'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Developer Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteDeveloper}
        title="Delete Developer"
        message={`Are you sure you want to delete ${devToDelete?.name}? They will be removed from all projects, and their tasks and phases will also be removed.`}
        confirmText="Delete Developer"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DevelopersPage;

