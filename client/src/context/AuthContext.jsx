import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('devtrack_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('devtrack_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token and load fresh user profile
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('devtrack_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Failed to verify token', err);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('devtrack_token', newToken);
        localStorage.setItem('devtrack_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        return { success: true, user: newUser };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const register = async (name, email, password, role = 'developer') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('devtrack_token', newToken);
        localStorage.setItem('devtrack_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        return { success: true, user: newUser };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('devtrack_token');
    localStorage.removeItem('devtrack_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('devtrack_user', JSON.stringify(updatedUser));
  };

  const isAdmin = user?.role === 'admin';
  const isDeveloper = user?.role === 'developer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAdmin,
        isDeveloper,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
