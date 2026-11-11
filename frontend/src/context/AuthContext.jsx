import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev && prev.message === message ? null : prev));
    }, 4500);
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return null;
    }
    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        setUser((prev) => {
          const updated = { ...prev, ...res.data };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
        return res.data;
      }
    } catch (err) {
      console.warn('Could not refresh user session:', err.message);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  useEffect(() => {
    refreshUser();

    const handleUnauthorized = () => {
      setUser(null);
      showToast('Session expired. Please log in again.', 'warning');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [refreshUser, showToast]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.data) {
      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      showToast(`Welcome back, ${userData.name}!`, 'success');
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    showToast('Logged out successfully', 'success');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        toast,
        showToast,
        clearToast,
        isAdmin: user?.role === 'admin',
        isDesigner: user?.role === 'designer',
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
