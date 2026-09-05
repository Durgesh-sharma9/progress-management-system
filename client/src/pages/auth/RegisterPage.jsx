import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Code2,
  ArrowRight,
  Loader2,
  Sparkles,
  Calendar,
} from 'lucide-react';

import { getLocalDateString } from '../../utils/dateUtils';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [joiningDate, setJoiningDate] = useState(getLocalDateString());
  const [role, setRole] = useState('developer');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      error('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const res = await register(name, email, password, role, joiningDate);
    setLoading(false);

    if (res.success) {
      success(`Account created! Welcome, ${res.user.name}`);
      const targetPath =
        res.user.role === 'admin' ? '/admin/dashboard' : '/developer/dashboard';
      navigate(targetPath, { replace: true });
    } else {
      error(res.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Mesh Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[1000px] h-[350px] sm:h-[500px] bg-gradient-to-b from-brand-300/25 via-indigo-200/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center mb-3 sm:mb-5">
          <img
            src="/logo.jpg"
            alt="CodePilot Logo"
            className="h-14 w-14 sm:h-18 sm:w-18 rounded-2xl sm:rounded-3xl object-cover shadow-xl shadow-brand-500/25 ring-2 ring-white"
          />
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
          Create <span className="text-brand-600">CodePilot</span> Account
        </h2>
        <p className="mt-1 sm:mt-2.5 text-xs sm:text-sm text-slate-600 font-medium">
          Start collaborating and tracking project deliverables
        </p>
      </div>

      <div className="mt-5 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-9 shadow-soft-xl border border-slate-200/90 backdrop-blur-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-soft-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="block w-full rounded-xl border border-slate-300/80 bg-white/70 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-soft-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full rounded-xl border border-slate-300/80 bg-white/70 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-soft-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300/80 bg-white/70 py-2.5 px-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono"
                />
              </div>
            </div>

            {/* Select Role */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('developer')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 text-center ${
                    role === 'developer'
                      ? 'border-emerald-400 bg-emerald-50/80 text-emerald-900 shadow-soft-xs font-bold'
                      : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs">Developer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 text-center ${
                    role === 'admin'
                      ? 'border-brand-400 bg-brand-50/80 text-brand-900 shadow-soft-xs font-bold'
                      : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="h-5 w-5 text-brand-600" />
                  <span className="text-xs">Admin</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 py-3.5 px-4 text-sm font-bold text-white shadow-soft-md shadow-brand-600/30 hover:from-brand-500 hover:to-indigo-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 mt-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-brand-600 hover:text-brand-500 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

