import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('dms_token');
    const stored = localStorage.getItem('dms_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
        // verify token is still valid
        getMe().then(res => setUser(res.data.user)).catch(() => {
          localStorage.removeItem('dms_token');
          localStorage.removeItem('dms_user');
          setUser(null);
        }).finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('dms_token', token);
    localStorage.setItem('dms_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = async () => {
    try { await apiLogout(); } catch {}
    localStorage.removeItem('dms_token');
    localStorage.removeItem('dms_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
