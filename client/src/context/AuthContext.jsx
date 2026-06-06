import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get(`http://${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser({ ...res.data, token });
        } catch (error) {
          sessionStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`http://${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
    sessionStorage.setItem('token', res.data.token);
    setUser(res.data);
  };

  const register = async (name, email, password, role) => {
    const res = await axios.post(`http://${import.meta.env.VITE_API_URL}/api/auth/register`, { name, email, password, role });
    sessionStorage.setItem('token', res.data.token);
    setUser(res.data);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
