import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('skillconnect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('skillconnect_token') || null);
  const [activeRoleView, setActiveRoleView] = useState(() => {
    return localStorage.getItem('skillconnect_view_mode') || 'customer';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const setViewMode = (mode) => {
    setActiveRoleView(mode);
    localStorage.setItem('skillconnect_view_mode', mode);
  };

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('skillconnect_user', JSON.stringify(res.user));
      setIsAuthModalOpen(false);

      if (res.user.role === 'Admin') {
        setViewMode('admin');
      } else if (res.user.role === 'Provider') {
        setViewMode('provider');
      } else {
        setViewMode('customer');
      }

      showToast(`Welcome back, ${res.user.full_name}!`, 'success');
      return res;
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      showToast('Registration successful! Please sign in with your credentials.', 'success');
      setAuthModalTab('login');
      return res;
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    api.setToken(null);
    localStorage.removeItem('skillconnect_user');
    setViewMode('customer');
    showToast('Signed out successfully', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeRoleView,
        setViewMode,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        toast,
        showToast,
        login,
        register,
        logout
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
