import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, Shield, Code, ChevronRight } from 'lucide-react';

const routeTitleMap = {
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/projects': 'Project Management',
  '/admin/developers': 'Developer Directory',
  '/developer/dashboard': 'Developer Dashboard',
  '/developer/projects': 'My Assigned Projects',
  '/developer/phases': 'My Phases',
  '/developer/tasks': 'My Phases',
  '/profile': 'User Profile & Settings',
};

const Header = ({ onMenuClick }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  // Determine page title
  let currentTitle = routeTitleMap[location.pathname];
  if (!currentTitle) {
    if (location.pathname.startsWith('/admin/projects/')) {
      currentTitle = 'Project Details & Members';
    } else if (location.pathname.startsWith('/developer/workspace/')) {
      currentTitle = 'Project Workspace';
    } else {
      currentTitle = 'DevTrack';
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 sm:h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-3.5 sm:px-6 backdrop-blur-xl shadow-sm">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open Navigation Menu"
          className="rounded-xl border border-slate-200 p-2 sm:p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden shadow-sm shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <div className="hidden xs:flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400">
            <span className="font-medium text-slate-500">DevTrack</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-600 font-semibold truncate">
              {isAdmin ? 'Admin' : 'Developer'}
            </span>
          </div>
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 truncate">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right side: Role badge & Quick Profile summary */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-700 shadow-sm">
          {isAdmin ? (
            <>
              <Shield className="h-3.5 w-3.5 text-brand-600" />
              <span className="font-semibold text-brand-900">Admin</span>
            </>
          ) : (
            <>
              <Code className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-semibold text-emerald-900">Developer</span>
            </>
          )}
        </div>

        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-100 transition-colors"
          title="View Profile"
        >
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
            {user?.name?.substring(0, 2)?.toUpperCase() || 'DT'}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
