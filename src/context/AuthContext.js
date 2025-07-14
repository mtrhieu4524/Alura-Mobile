import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';
import Toast from 'react-native-toast-message';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const loggedIn = await authService.isLoggedIn();
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        const userInfo = await authService.getCurrentUser();
        setUser(userInfo);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        setIsLoggedIn(true);
        setUser(result.data);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: result.message
        });
        return { success: true };
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: result.message
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    try {
      const result = await authService.register(name, email, password);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: result.message
        });
        return { success: true };
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: result.message
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      const result = await authService.logout();
      setIsLoggedIn(false);
      setUser(null);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: result.message
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Logout failed';
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  };

  const getRememberedCredentials = async () => {
    return await authService.getRememberedCredentials();
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    register,
    logout,
    getRememberedCredentials,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 