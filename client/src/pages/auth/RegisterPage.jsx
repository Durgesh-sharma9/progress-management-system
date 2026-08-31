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
} from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    const res = await register(name, email, password, role);
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
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-brand-100/60 via-indigo-100/30 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 shadow-lg text-white mb-4">
          <Layers className="h-7 w-7" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Create <span className="text-brand-600">DevTrack</span> Account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Get started with project progress tracking
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
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
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
                    role === 'developer'
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm font-semibold'
                      : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs">Developer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
                    role === 'admin'
                      ? 'border-brand-400 bg-brand-50 text-brand-800 shadow-sm font-semibold'
                      : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:text-slate-900'
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
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 px-4 text-sm font-semibold text-white shadow-md shadow-brand-600/30 hover:from-brand-500 hover:to-indigo-500 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
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
