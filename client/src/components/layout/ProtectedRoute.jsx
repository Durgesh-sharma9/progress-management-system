import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm font-medium text-slate-400">Loading DevTrack...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect user to their own role's dashboard
    const fallbackPath =
      user?.role === 'admin' ? '/admin/dashboard' : '/developer/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
