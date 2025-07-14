import { config, getApiUrl } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  // Login function
  async login(email, password) {
    try {
      const apiUrl = getApiUrl(config.endpoints.auth.login);
      console.log('Login API URL:', apiUrl); // Debug log
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      console.log('Login response status:', response); // Debug log

      if (response.status !== 200) {
        throw new Error('Wrong email or password.');
      }

      const data = await response.json();
      console.log('Login response data:', data); // Debug log

      // Lưu token và user info
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', data.accountId);

      // Lưu remember me info nếu được chọn
      // if (rememberMe) {
      //   await AsyncStorage.setItem('rememberEmail', email);
      //   await AsyncStorage.setItem('rememberPassword', password);
      // } else {
      //   await AsyncStorage.removeItem('rememberEmail');
      //   await AsyncStorage.removeItem('rememberPassword');
      // }

      return {
        success: true,
        data: data,
        message: 'Login successful.'
      };
    } catch (error) {
      console.error('Login error o day phai ko ?: ', error); // Debug log
      return {
        success: false,
        message: 'Login failed.'
      };
    }
  }

  // Register function
  async register(name, email, password, phone = '', address = '') {
    try {
      const apiUrl = getApiUrl(config.endpoints.auth.register);
      console.log('Register API URL:', apiUrl); // Debug log
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone, address }),
      });

      if (response.status !== 201) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message === "Email already registered") {
          throw new Error('Email already registered an account. Please use another email.');
        } else {
          throw new Error(errorData.message || `Register failed with status ${response.status}`);
        }
      }

      return {
        success: true,
        message: 'Account created successfully.'
      };
    } catch (error) {
      console.error('Register error:', error); // Debug log
      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.'
      };
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = getApiUrl(`profile/${userId}`);
      console.log('Get profile API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      console.log('Profile data:', data);

      return {
        success: true,
        data: data,
        message: 'Profile fetched successfully.'
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch profile.'
      };
    }
  }

  // Update user profile
  async updateUserProfile(userId, profileData) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = getApiUrl(`profile/${userId}`);
      console.log('Update profile API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.status !== 200) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      console.log('Profile update response:', data);

      return {
        success: true,
        data: data,
        message: 'Profile updated successfully.'
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update profile.'
      };
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = getApiUrl('auth/change-password');
      console.log('Change password API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      if (response.status !== 200) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to change password');
      }

      const data = await response.json();
      console.log('Password change response:', data);

      return {
        success: true,
        data: data,
        message: 'Password changed successfully.'
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error.message || 'Failed to change password.'
      };
    }
  }

  // Logout function
  async logout() {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      return {
        success: true,
        message: 'Logged out successfully.'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Logout failed.'
      };
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem('token');
      return token !== null;
    } catch (error) {
      return false;
    }
  }

  // Get saved remember me credentials
  async getRememberedCredentials() {
    try {
      const email = await AsyncStorage.getItem('rememberEmail');
      const password = await AsyncStorage.getItem('rememberPassword');
      
      if (email && password) {
        return { email, password };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Get current user info
  async getCurrentUser() {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('user');
      return { token, userId };
    } catch (error) {
      return { token: null, userId: null };
    }
  }
}

export default new AuthService(); 