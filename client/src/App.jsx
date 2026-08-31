import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout & Protected Route
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProjectsPage from './pages/admin/ProjectsPage';
import ProjectDetailsPage from './pages/admin/ProjectDetailsPage';
import DevelopersPage from './pages/admin/DevelopersPage';

// Developer Pages
import DeveloperDashboard from './pages/developer/DeveloperDashboard';
import MyProjectsPage from './pages/developer/MyProjectsPage';
import ProjectWorkspacePage from './pages/developer/ProjectWorkspacePage';
import MyTasksPage from './pages/developer/MyTasksPage';

// Shared Pages
import ProfilePage from './pages/ProfilePage';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/developer/dashboard" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailsPage />} />
        <Route path="developers" element={<DevelopersPage />} />
      </Route>

      {/* Developer Protected Routes */}
      <Route
        path="/developer"
        element={
          <ProtectedRoute allowedRoles={['developer']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/developer/dashboard" replace />} />
        <Route path="dashboard" element={<DeveloperDashboard />} />
        <Route path="projects" element={<MyProjectsPage />} />
        <Route path="workspace/:id" element={<ProjectWorkspacePage />} />
        <Route path="phases" element={<MyTasksPage />} />
        <Route path="tasks" element={<Navigate to="/developer/phases" replace />} />
      </Route>

      {/* Shared Protected Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin', 'developer']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback Root and Catch-All */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default App;
