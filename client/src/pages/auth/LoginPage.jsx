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
  CheckCircle2,
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

  return (
    <div className="min-h-screen flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Mesh Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[1000px] h-[350px] sm:h-[500px] bg-gradient-to-b from-brand-300/25 via-indigo-200/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="/logo.jpg"
            alt="CodePilot Logo"
            className="h-14 w-14 sm:h-18 sm:w-18 rounded-2xl sm:rounded-3xl object-cover shadow-soft-xl shadow-brand-500/30 ring-2 ring-white"
          />
        </div>
        <h2 className="mt-3 sm:mt-5 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          Code<span className="text-brand-600">Pilot</span>
        </h2>
        <p className="mt-0.5 sm:mt-1 text-center text-xs sm:text-sm text-slate-500 font-medium">
          Sign in to access your project dashboard and workspaces
        </p>
      </div>

      <div className="mt-5 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-6 sm:py-8 px-4 sm:px-10 rounded-2xl sm:rounded-3xl shadow-soft-xl border border-white/60">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Work Email Address
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
