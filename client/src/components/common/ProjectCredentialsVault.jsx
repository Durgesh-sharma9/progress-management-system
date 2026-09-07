import React, { useState, useMemo } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from './Modal';
import ConfirmModal from './ConfirmModal';
import EmptyState from './EmptyState';
import {
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  Plus,
  Edit2,
  Trash2,
  Globe,
  Database,
  Server,
  FileText,
  ShieldCheck,
  Lock,
  Search,
  Filter,
  Sparkles,
  Link2,
  Terminal,
  Cpu,
  User,
  Clock,
  Loader2,
  X,
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Items', icon: KeyRound },
  { id: 'url', label: 'Links & URLs', icon: Globe },
  { id: 'login', label: 'Logins', icon: Lock },
  { id: 'api_key', label: 'API Keys', icon: Cpu },
  { id: 'database', label: 'Databases', icon: Database },
  { id: 'server', label: 'Servers / SSH', icon: Server },
  { id: 'note', label: 'Notes & Config', icon: FileText },
];

const TYPE_CONFIG = {
  url: {
    label: 'Link / URL',
    icon: Globe,
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
    iconBg: 'bg-blue-600',
  },
  login: {
    label: 'Login Credential',
    icon: Lock,
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    iconBg: 'bg-emerald-600',
  },
  api_key: {
    label: 'API Key / Secret',
    icon: Cpu,
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
    iconBg: 'bg-purple-600',
  },
  database: {
    label: 'Database / DB Host',
    icon: Database,
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    iconBg: 'bg-amber-600',
  },
  server: {
    label: 'Server / SSH / FTP',
    icon: Server,
    badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    iconBg: 'bg-indigo-600',
  },
  note: {
    label: 'Config Note / Doc',
    icon: FileText,
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
    iconBg: 'bg-slate-700',
  },
  other: {
    label: 'Resource',
    icon: KeyRound,
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
    iconBg: 'bg-teal-600',
  },
};

const formatRedirectUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};

const ProjectCredentialsVault = ({ project, onUpdate, isDeveloper = false }) => {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedFieldId, setCopiedFieldId] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingCredId, setEditingCredId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'url',
    url: '',
    username: '',
    password: '',
    description: '',
  });

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [credToDelete, setCredToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const credentialsList = useMemo(() => {
    return project?.credentials || [];
  }, [project]);

  const filteredCredentials = useMemo(() => {
    return credentialsList.filter((cred) => {
      const matchesTab = activeTab === 'all' || cred.type === activeTab;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesTab;

      const matchesSearch =
        (cred.title && cred.title.toLowerCase().includes(q)) ||
        (cred.url && cred.url.toLowerCase().includes(q)) ||
        (cred.username && cred.username.toLowerCase().includes(q)) ||
        (cred.description && cred.description.toLowerCase().includes(q));

      return matchesTab && matchesSearch;
    });
  }, [credentialsList, activeTab, searchQuery]);

  const togglePasswordVisibility = (credId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [credId]: !prev[credId],
    }));
  };

  const handleCopyText = async (text, fieldIdentifier, label = 'Copied') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFieldId(fieldIdentifier);
      success(`${label} copied to clipboard!`);
      setTimeout(() => {
        setCopiedFieldId((current) => (current === fieldIdentifier ? null : current));
      }, 2000);
    } catch (err) {
      error('Failed to copy to clipboard');
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingCredId(null);
    setFormData({
      title: '',
      type: 'url',
      url: '',
      username: '',
      password: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cred) => {
    setModalMode('edit');
    setEditingCredId(cred._id);
    setFormData({
      title: cred.title || '',
      type: cred.type || 'url',
      url: cred.url || '',
      username: cred.username || '',
      password: cred.password || '',
      description: cred.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      error('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const res = await api.post(`/projects/${project._id}/credentials`, formData);
        if (res.data.success) {
          success('Credential added to project vault!');
          setIsModalOpen(false);
          if (onUpdate) onUpdate();
        }
      } else {
        const res = await api.put(
          `/projects/${project._id}/credentials/${editingCredId}`,
          formData
        );
        if (res.data.success) {
          success('Credential updated successfully!');
          setIsModalOpen(false);
          if (onUpdate) onUpdate();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save credential');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (cred) => {
    setCredToDelete(cred);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!credToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(
        `/projects/${project._id}/credentials/${credToDelete._id}`
      );
      if (res.data.success) {
        success('Credential removed from project');
        setIsDeleteOpen(false);
        setCredToDelete(null);
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete credential');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      {/* Vault Header Banner (Mobile Optimized) */}
      <div className="glass-card rounded-2xl p-3.5 sm:p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-soft-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                <KeyRound className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Project Vault</span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {credentialsList.length} Items
                </span>
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300/80 leading-relaxed max-w-2xl">
              Store repository links, server accounts, database credentials, API keys, and deployment notes for{' '}
              <span className="font-bold text-white">{project?.name}</span>.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-soft-sm shadow-indigo-500/25 transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Credential / Resource</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar (Mobile Optimized) */}
      <div className="glass-card rounded-2xl p-2.5 sm:p-4 bg-white border border-slate-200/90 shadow-soft-xs space-y-2.5 sm:space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Category Tabs (Wrapped cleanly for mobile so no scrolling needed) */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const count =
                tab.id === 'all'
                  ? credentialsList.length
                  : credentialsList.filter((c) => c.type === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-50 text-brand-700 border border-brand-200/80 shadow-soft-2xs'
                      : 'text-slate-600 hover:bg-slate-100/70 border border-transparent'
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        activeTab === tab.id
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input with quick clear */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, URL, username..."
              className="w-full rounded-xl border border-slate-300/80 bg-white/70 py-1.5 pl-8 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Credentials Grid (Responsive Mobile Card Layout) */}
      {filteredCredentials.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title={
            searchQuery || activeTab !== 'all'
              ? 'No matching credentials found'
              : 'No credentials added yet'
          }
          description={
            searchQuery || activeTab !== 'all'
              ? 'Try adjusting your search query or category filter.'
              : 'Store URLs, database logins, API keys, and deployment credentials for this project.'
          }
          actionText="Add Credential"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredCredentials.map((cred) => {
            const config = TYPE_CONFIG[cred.type] || TYPE_CONFIG.other;
            const TypeIcon = config.icon;
            const isPasswordVisible = Boolean(visiblePasswords[cred._id]);

            return (
              <div
                key={cred._id}
                className="glass-card rounded-2xl p-3.5 sm:p-4 bg-white border border-slate-200/90 shadow-soft-xs hover:shadow-soft-md transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Card Header: Type Icon, Title & Edit/Delete */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`h-7 w-7 sm:h-8 sm:w-8 rounded-xl ${config.iconBg} text-white flex items-center justify-center shrink-0 shadow-soft-2xs`}
                      >
                        <TypeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                          {cred.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span
                            className={`text-[8px] sm:text-[9px] uppercase tracking-wider font-bold px-2 py-0.2 rounded-md border ${config.badgeBg}`}
                          >
                            {config.label}
                          </span>
                          {cred.createdBy?.name && (
                            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                              by {cred.createdBy.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => openEditModal(cred)}
                        title="Edit Credential"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => confirmDelete(cred)}
                        title="Delete Credential"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Body: URL, Username, Password, Description */}
                  <div className="space-y-2 pt-2 text-xs">
                    {/* URL Redirection Row (Responsive Stacking for Mobile) */}
                    {cred.url && (
                      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-2">
                        <div className="min-w-0 flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span
                            className="text-xs font-mono text-slate-700 truncate"
                            title={cred.url}
                          >
                            {cred.url}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 justify-end shrink-0 pt-1 sm:pt-0 border-t border-slate-200/50 sm:border-t-0">
                          <button
                            onClick={() => handleCopyText(cred.url, `${cred._id}_url`, 'URL')}
                            title="Copy URL Link"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-200 text-[11px] font-semibold transition-all"
                          >
                            {copiedFieldId === `${cred._id}_url` ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span className="text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <a
                            href={formatRedirectUrl(cred.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/70 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors shrink-0"
                            title="Open Link in New Tab"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Username / Identifier */}
                    {cred.username && (
                      <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
                        <div className="min-w-0 pr-2">
                          <p className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400">
                            Username / Account
                          </p>
                          <p className="font-mono font-bold text-slate-900 truncate mt-0.5 text-xs sm:text-sm">
                            {cred.username}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            handleCopyText(cred.username, `${cred._id}_user`, 'Username')
                          }
                          className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-600 hover:text-brand-600 bg-white hover:bg-slate-100/80 px-2 py-1 rounded-lg border border-slate-200 transition-all shrink-0"
                          title="Copy Username"
                        >
                          {copiedFieldId === `${cred._id}_user` ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Password / Secret Value */}
                    {cred.password && (
                      <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
                        <div className="min-w-0 pr-2">
                          <p className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400">
                            Password / Secret
                          </p>
                          <p className="font-mono font-bold text-slate-900 truncate mt-0.5 text-xs sm:text-sm tracking-wider">
                            {isPasswordVisible ? cred.password : '••••••••••••'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(cred._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                            title={isPasswordVisible ? 'Hide password' : 'Show password'}
                          >
                            {isPasswordVisible ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() =>
                              handleCopyText(cred.password, `${cred._id}_pass`, 'Password')
                            }
                            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-600 hover:text-brand-600 bg-white hover:bg-slate-100/80 px-2 py-1 rounded-lg border border-slate-200 transition-all"
                            title="Copy Password"
                          >
                            {copiedFieldId === `${cred._id}_pass` ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span className="text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Description / Instructions */}
                    {cred.description && (
                      <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50/40 border border-amber-200/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase text-amber-800">
                            Usage Notes / Instructions
                          </span>
                          <button
                            onClick={() =>
                              handleCopyText(
                                cred.description,
                                `${cred._id}_desc`,
                                'Description Notes'
                              )
                            }
                            className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-amber-900 hover:text-amber-950 bg-amber-100/60 hover:bg-amber-100 px-1.5 py-0.5 rounded transition-colors"
                            title="Copy Notes Text"
                          >
                            {copiedFieldId === `${cred._id}_desc` ? (
                              <>
                                <Check className="h-2.5 w-2.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-2.5 w-2.5" />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap font-sans text-[11px] sm:text-xs leading-relaxed break-words">
                          {cred.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer info */}
                <div className="pt-2 border-t border-slate-100 text-[9px] sm:text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated {new Date(cred.updatedAt || cred.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-mono uppercase text-[9px] font-bold text-slate-400">
                    {cred.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Credential Modal (Mobile Optimized) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Add Project Credential' : 'Edit Credential'}
        subtitle={`Store safe access details and resources for ${project?.name || 'this project'}`}
        maxWidth="md"
      >
        <form onSubmit={handleSubmitModal} className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Title / Resource Name *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. GitHub Repo / Staging Database / AWS Console"
              className="block w-full rounded-xl border border-slate-300/80 bg-white py-2 px-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Resource Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="block w-full rounded-xl border border-slate-300/80 bg-white py-2 px-3 text-xs font-bold text-slate-800 focus:border-brand-500 focus:outline-none"
              >
                <option value="url">🌐 Link / Website</option>
                <option value="login">🔐 Login Credentials</option>
                <option value="api_key">⚡ API Key / Secret</option>
                <option value="database">🗄️ Database / Host</option>
                <option value="server">🖥️ Server / SSH / FTP</option>
                <option value="note">📝 Config Note / Doc</option>
                <option value="other">📌 Other Resource</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                URL / Link (Optional)
              </label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://github.com/..."
                className="block w-full rounded-xl border border-slate-300/80 bg-white py-2 px-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Username / Identifier (Optional)
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin@example.com / dev_user"
                className="block w-full rounded-xl border border-slate-300/80 bg-white py-2 px-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password / Secret Key (Optional)
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password or secret token"
                className="block w-full rounded-xl border border-slate-300/80 bg-white py-2 px-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Instructions / Description / Code Snippet (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Branch name, port details, how to use this token..."
              className="block w-full rounded-xl border border-slate-300/80 bg-white py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-soft-sm shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{modalMode === 'create' ? 'Save Credential' : 'Update Credential'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Credential"
        message={`Are you sure you want to remove "${credToDelete?.title}" from this project's vault?`}
        confirmText="Delete Credential"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjectCredentialsVault;
