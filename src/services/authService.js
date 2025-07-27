import { config, getApiUrl } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  // Login function
  async login(email, password, rememberMe = false) {
    try {
      const apiUrl = getApiUrl(config.endpoints.auth.login);
      console.log('Login API URL:', apiUrl); 
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      console.log('Login response status:', response); 

      if (response.status !== 200) {
        return {
          success: false,
          message: 'Wrong email or password.'
        };
      }

      const data = await response.json();
      console.log('Login response data:', data); 


      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', data.accountId);


      if (rememberMe) {
        await this.saveRememberedCredentials(email, password);
      } else {
        await this.clearRememberedCredentials();
      }

      return {
        success: true,
        data: data,
        message: 'Login successful.'
      };
    } catch (error) {

      return {
        success: false,
        message: 'Wrong email or password.'
      };
    }
  }


  async register(name, email, password, phone = '', address = '') {
    try {
      const apiUrl = getApiUrl(config.endpoints.auth.register);
      console.log('Register API URL:', apiUrl); 
      
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

      return {
        success: false,
        message: 'Registration failed.'
      };
    }
  }


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

      return {
        success: false,
        message: error.message || 'Failed to fetch profile.'
      };
    }
  }


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

      return {
        success: false,
        message: error.message || 'Failed to update profile.'
      };
    }
  }


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

      return {
        success: false,
        message: error.message || 'Failed to change password.'
      };
    }
  }


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


  async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem('token');
      return token !== null;
    } catch (error) {
      return false;
    }
  }


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


  async saveRememberedCredentials(email, password) {
    try {
      await AsyncStorage.setItem('rememberEmail', email);
      await AsyncStorage.setItem('rememberPassword', password);
    } catch (error) {
      console.log('Error saving remembered credentials:', error);
    }
  }


  async clearRememberedCredentials() {
    try {
      await AsyncStorage.removeItem('rememberEmail');
      await AsyncStorage.removeItem('rememberPassword');
    } catch (error) {
      console.log('Error clearing remembered credentials:', error);
    }
  }


  async getCurrentUser() {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('user');
      return { token, userId };
    } catch (error) {
      return { token: null, userId: null };
    }
  }


  async forgotPassword(email) {
    try {
      const apiUrl = getApiUrl(config.endpoints.auth.forgotPassword);
      console.log('Forgot password API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Check your email for verify code.'
        };
      } else {
        return {
          success: false,
          message: 'Email not registered an account.'
        };
      }
    } catch (error) {

      return {
        success: false,
        message: 'Something went wrong. Please try again later.'
      };
    }
  }


  async verifyResetCode(email, code) {
    try {
      const apiUrl = getApiUrl(config.endpoints.auth.verifyResetCode);
      console.log('Verify reset code API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code })
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Code verified successfully.'
        };
      } else {
        return {
          success: false,
          message: 'Verify code is incorrect.'
        };
      }
    } catch (error) {

      return {
        success: false,
        message: 'Something went wrong. Please try again.'
      };
    }
  }


  async resetPassword(email, code, newPassword) {
    try {
      const apiUrl = getApiUrl(config.endpoints.auth.resetPassword);
      console.log('Reset password API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, newPassword })
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Reset password successfully!'
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to reset password.'
        };
      }
    } catch (error) {

      return {
        success: false,
        message: 'Something went wrong. Please try again.'
      };
    }
  }
}

export default new AuthService(); 