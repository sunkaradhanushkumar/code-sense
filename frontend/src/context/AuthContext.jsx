import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('codesense_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Load user data on startup if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('codesense_token');
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          setToken(storedToken);
        } catch (err) {
          console.warn('[Auth] Token invalid or expired, clearing session.');
          localStorage.removeItem('codesense_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('codesense_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const data = await authApi.register(userData);
      localStorage.setItem('codesense_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      throw err;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('codesense_token');
    setToken(null);
    setUser(null);
    toast.info('You have been logged out.');
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authApi.updateProfile(profileData);
      setUser(updatedUser);
      toast.success('Profile settings updated successfully!');
      return updatedUser;
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
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
