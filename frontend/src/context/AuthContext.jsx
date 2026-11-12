import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set default auth header whenever accessToken changes
  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  // Restore authenticated session on initial load via refresh token
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const refreshRes = await api.post('/auth/refresh-token');
        if (refreshRes?.data?.accessToken) {
          const newAccessToken = refreshRes.data.accessToken;
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          const meRes = await api.get('/auth/me');
          if (isMounted && meRes?.data?.user) {
            setUser(meRes.data.user);
            setAccessToken(newAccessToken);
          }
        }
      } catch {
        // No active or valid refresh token; user is unauthenticated
        if (isMounted) {
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Register
  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res?.data?.accessToken && res?.data?.user) {
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
    }
    return res;
  };

  // 2. Login
  const login = async (loginIdentifier, password) => {
    const res = await api.post('/auth/login', { loginIdentifier, password });
    if (res?.mfaRequired) {
      return { mfaRequired: true, tempToken: res.tempToken, message: res.message };
    }
    if (res?.data?.accessToken && res?.data?.user) {
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
    }
    return res;
  };

  // 3. Complete MFA Login
  const validateMfaLogin = async (tempToken, totpCode) => {
    const res = await api.post('/auth/mfa/validate-login', { tempToken, totpCode });
    if (res?.data?.accessToken && res?.data?.user) {
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
    }
    return res;
  };

  // 4. Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue client cleanup even if network fails
    } finally {
      setUser(null);
      setAccessToken(null);
      delete api.defaults.headers.common['Authorization'];
    }
  };

  // 5. Update user state locally
  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    validateMfaLogin,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

