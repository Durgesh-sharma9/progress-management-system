import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderGit2,
  Users,
  CheckSquare,
  User,
  LogOut,
  Layers,
  ChevronRight,
  ShieldCheck,
  Code2,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/admin/projects', icon: FolderGit2 },
    { name: 'Developers', path: '/admin/developers', icon: Users },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const developerNavItems = [
    { name: 'Dashboard', path: '/developer/dashboard', icon: LayoutDashboard },
    { name: 'My Projects', path: '/developer/projects', icon: FolderGit2 },
    { name: 'My Phases', path: '/developer/phases', icon: CheckSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const navItems = isAdmin ? adminNavItems : developerNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 shadow-md text-white">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-base text-slate-900 tracking-tight">
                  Dev<span className="text-brand-600">Track</span>
                </span>
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-500"></span>
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500">
                Progress Tracker
              </p>
            </div>
          </div>
        </div>

        {/* Role Pill */}
        <div className="px-4 py-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            {isAdmin ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                <span className="font-semibold text-brand-900 text-[11px]">Admin Mode</span>
                <span className="ml-auto text-[9px] bg-brand-100 text-brand-700 border border-brand-200 px-1.5 py-0.2 rounded font-mono font-bold">
                  ADMIN
                </span>
              </>
            ) : (
              <>
                <Code2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-emerald-900 text-[11px]">Developer</span>
                <span className="ml-auto text-[9px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono font-bold">
                  DEV
                </span>
              </>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-1.5 space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700 border border-brand-200">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {user?.name || 'User'}
                </p>
                <p className="truncate text-[10px] text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
