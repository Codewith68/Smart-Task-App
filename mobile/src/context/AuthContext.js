import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/client';

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

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const savedUser = await SecureStore.getItemAsync('user');
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        // Verify with backend
        const res = await api.get('/auth/me');
        setUser(res.data.data);
        await SecureStore.setItemAsync('user', JSON.stringify(res.data.data));
      }
    } catch (e) {
      console.log('Session check failed', e);
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData } = res.data.data;
    await SecureStore.setItemAsync('token', accessToken);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const signup = async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password });
    const { accessToken, user: userData } = res.data.data;
    await SecureStore.setItemAsync('token', accessToken);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout API failure
    }
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
