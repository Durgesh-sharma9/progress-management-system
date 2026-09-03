import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Shield,
  Code2,
  ChevronRight,
  Search,
  Sparkles,
  Activity,
  LogOut,
} from 'lucide-react';

const routeTitleMap = {
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/projects': 'Project Management',
  '/admin/developers': 'Developer Directory',
  '/developer/dashboard': 'Developer Dashboard',
  '/developer/projects': 'My Assigned Projects',
  '/developer/phases': 'My Deliverable Phases',
  '/developer/tasks': 'My Deliverable Phases',
  '/profile': 'Profile & Security',
};

const Header = ({ onMenuClick }) => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine page title
  let currentTitle = routeTitleMap[location.pathname];
  if (!currentTitle) {
    if (location.pathname.startsWith('/admin/projects/')) {
      currentTitle = 'Project Details & Tree Flow';
    } else if (location.pathname.startsWith('/developer/workspace/')) {
      currentTitle = 'Project Workspace';
    } else {
      currentTitle = 'DevTrack';
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 lg:h-20 items-center justify-between border-b border-slate-200/80 bg-white/85 px-3 sm:px-6 lg:px-8 backdrop-blur-xl shadow-soft-xs">
      {/* Left side: Title & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400">
            <span className="font-semibold text-slate-500">DevTrack</span>
            <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-300" />
            <span className="text-slate-600 font-semibold truncate">
              {isAdmin ? 'Admin' : 'Developer'}
            </span>
          </div>
          <h1 className="text-sm sm:text-lg lg:text-2xl font-extrabold tracking-tight text-slate-900 truncate">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right side: Live Sync, Role badge, Profile & Logout */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Live Pulse Indicator */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-200/80 bg-emerald-50/80 text-emerald-800 text-xs font-semibold shadow-soft-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-mono">Live</span>
        </div>

        {/* Role Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-soft-xs">
          {isAdmin ? (
            <>
              <Shield className="h-3 w-3 text-brand-600" />
              <span className="text-brand-900 font-bold text-[11px]">Admin</span>
            </>
          ) : (
            <>
              <Code2 className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-900 font-bold text-[11px]">Developer</span>
            </>
          )}
        </div>

        {/* Profile Avatar Pill Link */}
        <Link
          to="/profile"
          className="group flex items-center gap-1.5 sm:gap-2 rounded-xl p-1 sm:pr-2.5 border border-transparent hover:border-slate-200 hover:bg-slate-100/70 transition-all duration-200"
          title="View Profile Settings"
        >
          <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
            {user?.name?.substring(0, 2)?.toUpperCase() || 'DT'}
          </div>
          <div className="hidden lg:block text-left min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate leading-tight group-hover:text-brand-600 transition-colors">
              {user?.name || 'User'}
            </p>
            <p className="text-[10px] text-slate-400 truncate leading-tight">
              {user?.email || 'user@devtrack.io'}
            </p>
          </div>
        </Link>

        {/* Quick Logout Button */}
        <button
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200/90 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-soft-xs"
        >
          <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;

