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
  Sparkles,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/admin/projects', icon: FolderGit2 },
    { name: 'Developers', path: '/admin/developers', icon: Users },
    { name: 'Profile & Security', path: '/profile', icon: User },
  ];

  const developerNavItems = [
    { name: 'Overview', path: '/developer/dashboard', icon: LayoutDashboard },
    { name: 'My Projects', path: '/developer/projects', icon: FolderGit2 },
    { name: 'My Phases', path: '/developer/phases', icon: CheckSquare },
    { name: 'Profile & Security', path: '/profile', icon: User },
  ];

  const navItems = isAdmin ? adminNavItems : developerNavItems;

  return (
    <aside className="fixed top-0 bottom-0 left-0 z-40 hidden lg:flex w-72 flex-col border-r border-slate-200/90 bg-white/95 backdrop-blur-2xl shadow-soft-md">
        {/* Brand Header */}
        <div className="flex h-16 sm:h-20 items-center justify-between px-6 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-brand-700 shadow-md shadow-brand-500/25 text-white">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight font-sans">
                  Dev<span className="text-brand-600">Track</span>
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Progress Management
              </p>
            </div>
          </div>
        </div>

        {/* Role Pill Banner */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/70 border border-slate-200/80 text-xs shadow-soft-xs">
            {isAdmin ? (
              <>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-600 shrink-0" />
                  <span className="font-bold text-slate-800 text-xs">Admin Console</span>
                </div>
                <span className="text-[10px] bg-brand-100/90 text-brand-700 border border-brand-200/80 px-2 py-0.5 rounded-full font-mono font-bold">
                  ADMIN
                </span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-800 text-xs">Developer Portal</span>
                </div>
                <span className="text-[10px] bg-emerald-100/90 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full font-mono font-bold">
                  DEV
                </span>
              </>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 border border-brand-600'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-brand-600'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight
                      className={`h-3.5 w-3.5 transition-all duration-200 ${
                        isActive
                          ? 'text-white opacity-90 translate-x-0.5'
                          : 'opacity-0 group-hover:opacity-60'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/60">
          <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900">
                  {user?.name || 'User'}
                </p>
                <p className="truncate text-[10px] text-slate-400 font-medium">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-transparent transition-all"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
  );
};

export default Sidebar;

