import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderGit2,
  Users,
  CheckSquare,
  User,
  Shield,
  Code2,
} from 'lucide-react';

const BottomNav = () => {
  const { isAdmin } = useAuth();

  const adminNavItems = [
    { name: 'Home', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/admin/projects', icon: FolderGit2 },
    { name: 'Developers', path: '/admin/developers', icon: Users },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const developerNavItems = [
    { name: 'Home', path: '/developer/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/developer/projects', icon: FolderGit2 },
    { name: 'Phases', path: '/developer/phases', icon: CheckSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const navItems = isAdmin ? adminNavItems : developerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.06)] lg:hidden safe-area-pb">
      <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative min-w-[56px] ${
                  isActive
                    ? 'text-brand-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex items-center justify-center h-7 w-7 rounded-lg transition-transform ${
                      isActive
                        ? 'bg-brand-50 text-brand-600 scale-105'
                        : 'text-slate-500'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                    {item.name}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 h-0.5 w-6 bg-brand-600 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
