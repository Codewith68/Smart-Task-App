import { createContext, useContext, useState, useEffect } from 'react';
import api, { clearAccessToken, setAccessToken } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore auth from the refresh-token cookie on mount.
  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('user');

      try {
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        const refreshRes = await api.post('/auth/refresh');
        setAccessToken(refreshRes.data.data.accessToken);
        setUser(refreshRes.data.data.user);
        localStorage.setItem('user', JSON.stringify(refreshRes.data.data.user));
      } catch {
        clearAccessToken();
        localStorage.removeItem('user');
        setUser(null);
      }

      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData } = res.data.data;
    setAccessToken(accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const signup = async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password });
    const { accessToken, user: userData } = res.data.data;
    setAccessToken(accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAccessToken();
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const resetPassword = async (token, password) => {
    const res = await api.post('/auth/reset-password', { token, password });
    const { accessToken, user: userData } = res.data.data;
    setAccessToken(accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
