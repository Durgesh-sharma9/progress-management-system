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
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-brand-100/60 via-indigo-100/30 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 shadow-lg text-white mb-4">
          <Layers className="h-7 w-7" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          Sign in to <span className="text-brand-600">DevTrack</span>
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          MERN Project Progress & Developer Workflow Tracker
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 px-4 text-sm font-semibold text-white shadow-md shadow-brand-600/30 hover:from-brand-500 hover:to-indigo-500 transition-all active:scale-[0.99] disabled:opacity-50"
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
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1-Click Demo Logins
              </span>
              <span className="text-[10px] text-brand-600 font-bold">Instant Test</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@devtrack.io', 'Admin@123')}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-brand-300 text-left transition-all group shadow-sm"
              >
                <div className="h-7 w-7 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-brand-600 truncate">
                    Admin
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">Alex Vance</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('rahul@devtrack.io', 'Dev@123')}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 text-left transition-all group shadow-sm"
              >
                <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Code2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 truncate">
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
