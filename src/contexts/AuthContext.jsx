import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { login as apiLogin, signup as apiSignup, getMe } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start true for auto-login
  const [authError, setAuthError] = useState(null);

  // Auto-login on mount and handle unauthorized events
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        try {
          const response = await getMe();
          setUser(response.data.user);
        } catch (error) {
          console.error("Auto-login failed:", error);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();

    // Listen for unauthorized events from api interceptors
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (credentials, rememberMe = false) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await apiLogin(credentials);
      const { token, user: userData } = response.data;
      
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      setUser(userData);
      return userData;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (data) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await apiSignup(data);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token); // Default remember for signup
      setUser(userData);
      return userData;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  const value = useMemo(() => ({
    user, 
    login, 
    logout, 
    signup, 
    loading, 
    authError, 
    updateUser
  }), [user, login, logout, signup, loading, authError, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
