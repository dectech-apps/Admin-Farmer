import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const response = await authAPI.getMe();
        setUser(response.data.data);
      } catch (error) {
        localStorage.removeItem('adminToken');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const { accessToken, user } = response.data.data;
    localStorage.setItem('adminToken', accessToken);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
  };

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    if (!user) return false;
    // If user has no permissions array or it's empty, they have all permissions (legacy admin)
    if (!user.permissions || user.permissions.length === 0) return true;
    return user.permissions.includes(permission);
  };

  // Get user's first permitted page for redirects
  const getDefaultPage = () => {
    if (!user || !user.permissions || user.permissions.length === 0) return '/';
    const permToPath = {
      dashboard: '/',
      farmers: '/farmers',
      restaurants: '/restaurants',
      riders: '/riders',
      customers: '/customers',
      orders: '/orders',
      payments: '/payments',
      analytics: '/analytics',
      users: '/users',
    };
    for (const perm of user.permissions) {
      if (permToPath[perm]) return permToPath[perm];
    }
    return '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, hasPermission, getDefaultPage }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
