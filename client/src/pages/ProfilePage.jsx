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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Profile & Security
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account credentials, security preferences, and personal details.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 p-6 sm:p-8 text-white shadow-soft-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-3xl font-extrabold text-white shadow-soft-md shrink-0 border border-white/20">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2 relative z-10">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{user?.name}</h3>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-400/30 backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5" />
                Administrator
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
                <Code2 className="h-3.5 w-3.5" />
                Developer
              </span>
            )}
          </div>

          <p className="text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-2">
            <Mail className="h-4 w-4 text-slate-400" />
            {user?.email}
          </p>

          <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Member since{' '}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })
              : '2026'}
          </p>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Update Profile Form */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
              <User className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Personal Information
            </h3>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-soft-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <KeyRound className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Security & Password</h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="block w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-soft-xs"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>

        {/* Account Actions / Logout Card */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-soft border border-rose-100 bg-rose-50/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                Sign Out of DevTrack
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                End your current session on this device.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 shadow-soft-xs active:scale-95 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

