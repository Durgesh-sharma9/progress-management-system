import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Code2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      success(`Welcome back, ${res.user.name}!`);
      const targetPath =
        res.user.role === 'admin' ? '/admin/dashboard' : '/developer/dashboard';
      navigate(location.state?.from?.pathname || targetPath, { replace: true });
    } else {
      error(res.message);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    const res = await login(demoEmail, demoPass);
    setLoading(false);

    if (res.success) {
      success(`Logged in as ${res.user.name} (${res.user.role})`);
      const targetPath =
        res.user.role === 'admin' ? '/admin/dashboard' : '/developer/dashboard';
      navigate(targetPath, { replace: true });
    } else {
      error(res.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Mesh Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-300/25 via-indigo-200/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-brand-700 shadow-xl shadow-brand-500/25 text-white mb-5 animate-float">
          <Layers className="h-8 w-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
          Sign in to <span className="text-brand-600">DevTrack</span>
        </h2>
        <p className="mt-2.5 text-sm text-slate-600 font-medium">
          Modern Project Progress & Developer Workflow Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card rounded-3xl p-7 sm:p-9 shadow-soft-xl border border-slate-200/90 backdrop-blur-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
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
                  className="block w-full rounded-xl border border-slate-300/80 bg-white/70 py-3 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-soft-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-300/80 bg-white/70 py-3 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 py-3.5 px-4 text-sm font-bold text-white shadow-soft-md shadow-brand-600/30 hover:from-brand-500 hover:to-indigo-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In to Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Fast-Track */}
          <div className="mt-7 pt-6 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  1-Click Demo Accounts
                </span>
              </div>
              <span className="text-[10px] text-brand-700 font-bold bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                Instant Access
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@devtrack.io', 'Admin@123')}
                disabled={loading}
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 hover:border-brand-400 hover:shadow-soft text-left transition-all duration-200 group"
              >
                <div className="h-8 w-8 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-brand-600 truncate transition-colors">
                    Admin
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">Alex Vance</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('rahul@devtrack.io', 'Dev@123')}
                disabled={loading}
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 hover:border-emerald-400 hover:shadow-soft text-left transition-all duration-200 group"
              >
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Code2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 truncate transition-colors">
                    Developer
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">Rahul Sharma</p>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-brand-600 hover:text-brand-500 transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

