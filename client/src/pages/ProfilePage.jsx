import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  Code2,
  Calendar,
  Loader2,
  Save,
  KeyRound,
  Sparkles,
  LogOut,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, isAdmin, logout } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      error('Name and email are required');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name: name.trim(),
        email: email.trim(),
      });
      if (res.data.success) {
        updateUser(res.data.user);
        success('Profile updated successfully');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      error('Current password and new password are required');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await api.put('/auth/profile', {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
      {/* Compact Page Header */}
      <div>
        <h2 className="text-sm sm:text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
          Account Profile & Security
        </h2>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
          Manage your credentials, security preferences, and personal details.
        </p>
      </div>

      {/* Ultra-Compact Horizontal Profile Banner */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 p-3 sm:p-4 text-white shadow-soft-md border border-slate-800 flex items-center gap-3">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-500/20 blur-2xl pointer-events-none" />
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-base sm:text-lg font-black text-white shadow-xs shrink-0 border border-white/20">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>

        <div className="min-w-0 flex-1 relative z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
              {user?.name}
            </h3>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-bold bg-brand-500/25 text-brand-200 border border-brand-400/30">
                <ShieldCheck className="h-2.5 w-2.5" />
                Admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/25 text-emerald-200 border border-emerald-400/30">
                <Code2 className="h-2.5 w-2.5" />
                Developer
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] sm:text-[11px] text-slate-300 mt-0.5">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3 text-slate-400" />
              {user?.email}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="h-3 w-3 text-slate-500" />
              Since{' '}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    year: 'numeric',
                  })
                : '2026'}
            </span>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
        {/* Update Profile Form */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4.5 space-y-2.5 sm:space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="p-1 rounded-lg bg-brand-50 text-brand-600 border border-brand-100">
              <User className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
              Personal Information
            </h3>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-2.5">
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg sm:rounded-xl border border-slate-200/90 bg-white/80 px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg sm:rounded-xl border border-slate-200/90 bg-white/80 px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white shadow-soft-xs hover:from-brand-500 hover:to-indigo-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3 w-3" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4.5 space-y-2.5 sm:space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="p-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <KeyRound className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Security & Password</h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-2.5">
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-lg sm:rounded-xl border border-slate-200/90 bg-white/80 px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="block w-full rounded-lg sm:rounded-xl border border-slate-200/90 bg-white/80 px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-lg sm:rounded-xl border border-slate-200/90 bg-white/80 px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-soft-xs"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Account Actions / Logout Card */}
      <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-soft border border-rose-100 bg-rose-50/20">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Sign Out of DevTrack
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500">
              End your active session on this device.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 sm:px-3.5 sm:py-2 shadow-soft-xs active:scale-95 transition-all shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

