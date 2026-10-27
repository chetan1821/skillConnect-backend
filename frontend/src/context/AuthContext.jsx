import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { INITIAL_USERS } from '../data/mockData';

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
  const [backendOnline, setBackendOnline] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(() => api.useMock);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Check backend health periodically
  useEffect(() => {
    const checkStatus = async () => {
      const isUp = await api.checkBackendHealth();
      setBackendOnline(isUp);
      if (isUp && isDemoMode) {
        // Backend detected
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  const toggleDemoMode = (enabled) => {
    setIsDemoMode(enabled);
    api.setMockMode(enabled);
    showToast(
      enabled ? "Switched to Demo / Mock Mode" : "Switched to Live FastAPI Backend mode",
      "info"
    );
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
      showToast('Registration successful! Please login.', 'success');
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

  const quickLoginAs = async (role) => {
    const target = INITIAL_USERS.find(u => u.role.toLowerCase() === role.toLowerCase());
    if (target) {
      setUser(target);
      const mockToken = `quick-${target.id}-${Date.now()}`;
      setToken(mockToken);
      api.setToken(mockToken);
      localStorage.setItem('skillconnect_user', JSON.stringify(target));

      if (role.toLowerCase() === 'admin') setViewMode('admin');
      else if (role.toLowerCase() === 'provider') setViewMode('provider');
      else setViewMode('customer');

      setIsAuthModalOpen(false);
      showToast(`Switched to demo account: ${target.full_name} (${target.role})`, 'success');
    }
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
        backendOnline,
        isDemoMode,
        toggleDemoMode,
        toast,
        showToast,
        login,
        register,
        logout,
        quickLoginAs
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

