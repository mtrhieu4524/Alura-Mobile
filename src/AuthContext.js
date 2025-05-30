import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

const MOCK_USER = {
  name: 'Nguyễn Văn A',
  email: 'user@gmail.com',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
};

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const login = () => {
    setIsLoggedIn(true);
    setUser(MOCK_USER);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
} 