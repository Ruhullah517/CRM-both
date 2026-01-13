import React, { createContext, useContext, useState } from 'react';
import authService from '../services/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email, password) => {
    const userData = await authService.login(email, password);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Helpers for easy access
  const userInfo = user?.user || null; // { id, name, email, role, mentorId }
  const token = user?.token || null;
  const role = userInfo?.role || null;

  return (
    <AuthContext.Provider value={{ user, userInfo, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

