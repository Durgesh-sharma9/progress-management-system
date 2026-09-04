import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Code2,
  LogOut,
  Sparkles,
  Settings,
} from 'lucide-react';

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-11 sm:h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 px-3 sm:px-6 lg:px-8 backdrop-blur-xl shadow-soft-xs">
      {/* Left side: Brand Logo & Portal Badge */}
      <div className="flex items-center gap-2">
        <Link
          to={isAdmin ? '/admin/dashboard' : '/developer/dashboard'}
          className="flex items-center gap-2 group"
          title="CodePilot Home"
        >
          <img
            src="/logo.jpg"
            alt="CodePilot"
            className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg object-cover shadow-soft-xs group-hover:scale-105 transition-transform"
          />
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors">
              CodePilot
            </span>
            <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-full border ${
              isAdmin
                ? 'bg-brand-50 text-brand-700 border-brand-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isAdmin ? 'Admin' : 'Dev'}
            </span>
          </div>
        </Link>
      </div>

      {/* Right side: Live Pulse, Role badge, Profile & Quick Logout */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Live Pulse Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 text-emerald-800 text-[10px] font-bold shadow-2xs">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="font-mono text-[9px]">Live</span>
        </div>

        {/* Profile / Settings Button */}
        <Link
          to="/profile"
          className="group flex items-center gap-1.5 rounded-lg p-0.5 sm:pr-2 border border-transparent hover:border-slate-200 hover:bg-slate-100/70 transition-all duration-150"
          title="Settings & Profile"
          aria-label="Settings"
        >
          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-2xs group-hover:scale-105 group-hover:rotate-45 transition-all">
            <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <div className="hidden lg:block text-left min-w-0">
            <p className="text-[11px] font-bold text-slate-800 truncate leading-tight group-hover:text-brand-600 transition-colors">
              {user?.name || 'Settings'}
            </p>
          </div>
        </Link>

        {/* Quick Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          aria-label="Sign Out"
          className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg border border-slate-200/90 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-2xs"
        >
          <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
