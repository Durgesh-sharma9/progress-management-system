import React, { useState } from 'react';
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
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const { success, error } = useToast();

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
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          User Profile
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account credentials, security, and personal information.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-md">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Administrator
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Code2 className="h-3.5 w-3.5" />
                Developer
              </span>
            )}
          </div>

          <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-2">
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
        <div className="bg-white rounded-2xl p-6 lg:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <User className="h-5 w-5 text-brand-600" />
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
                className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/20 hover:bg-brand-500 transition-all disabled:opacity-50"
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
        <div className="bg-white rounded-2xl p-6 lg:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <KeyRound className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Change Password</h3>
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
                className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-all disabled:opacity-50 shadow-sm"
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
      </div>
    </div>
  );
};

export default ProfilePage;
