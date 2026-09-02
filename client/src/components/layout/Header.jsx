import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Shield,
  Code2,
  ChevronRight,
  Search,
  Sparkles,
  Activity,
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
  const { user, isAdmin } = useAuth();
  const location = useLocation();

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
    <header className="sticky top-0 z-30 flex h-16 sm:h-20 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 sm:px-8 backdrop-blur-xl shadow-soft-xs">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open Navigation Menu"
          className="rounded-xl border border-slate-200 p-2 sm:p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden shadow-soft-xs shrink-0 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
            <span className="font-semibold text-slate-500">DevTrack</span>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="text-slate-600 font-semibold truncate">
              {isAdmin ? 'Admin Console' : 'Developer Hub'}
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 truncate">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right side: Live Sync, Role badge & Quick Profile summary */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Live Pulse Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 text-emerald-800 text-xs font-semibold shadow-soft-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-mono">System Live</span>
        </div>

        {/* Role Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-soft-xs">
          {isAdmin ? (
            <>
              <Shield className="h-3.5 w-3.5 text-brand-600" />
              <span className="text-brand-900 font-bold">Admin</span>
            </>
          ) : (
            <>
              <Code2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-900 font-bold">Developer</span>
            </>
          )}
        </div>

        {/* Profile Avatar Pill Link */}
        <Link
          to="/profile"
          className="group flex items-center gap-2.5 rounded-2xl p-1 sm:pr-3 border border-transparent hover:border-slate-200 hover:bg-slate-100/70 transition-all duration-200"
          title="View Profile Settings"
        >
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
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
      </div>
    </header>
  );
};

export default Header;

