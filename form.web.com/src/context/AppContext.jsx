import React, { createContext, useContext, useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const SECRET_KEY = 'ocr-sticker-intake-2025';

  useEffect(() => {
    // Check for existing session
    const encryptedSession = localStorage.getItem('ocr-session');
    if (encryptedSession) {
      try {
        const decrypted = CryptoJS.AES.decrypt(encryptedSession, SECRET_KEY);
        const session = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        if (session && session.token && session.user) {
          setIsAuthenticated(true);
          setCurrentUser(session.user);
        }
      } catch (error) {
        console.error('Session validation error:', error);
        localStorage.removeItem('ocr-session');
      }
    }
  }, []);

  const login = async (username, password) => {
    // Static credentials check
    if (username === 'admin' && password === 'admin123') {
      const user = { username: 'admin', id: '1' };
      const token = `token_${Date.now()}`;
      const session = { user, token, timestamp: Date.now() };
      
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(session), SECRET_KEY);
      localStorage.setItem('ocr-session', encrypted.toString());
      
      setIsAuthenticated(true);
      setCurrentUser(user);
      return { success: true };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const logout = () => {
    localStorage.removeItem('ocr-session');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const value = {
    isAuthenticated,
    currentUser,
    sidebarCollapsed,
    login,
    logout,
    toggleSidebar,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};