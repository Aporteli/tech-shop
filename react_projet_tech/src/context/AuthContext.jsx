import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. useState-ის ინიციალიზაცია (სინქრონულად იღებს მონაცემებს პირველივე რენდერზე)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('LocalStorage-ის წაკითხვის შეცდომა:', error);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  // 2. Login ფუნქცია
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    if (userToken) {
      localStorage.setItem('token', userToken);
    }
  };

  // 3. Logout ფუნქცია
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('wishlist');
    localStorage.removeItem('cart');
    localStorage.removeItem('compare'); // დავამატოთ compare-ც
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
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