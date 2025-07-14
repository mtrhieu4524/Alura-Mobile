import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { login, getRememberedCredentials } = useAuth();

  // Load remembered credentials on component mount
  // useEffect(() => {
  //   loadRememberedCredentials();
  // }, []);

  // const loadRememberedCredentials = async () => {
  //   try {
  //     const credentials = await getRememberedCredentials();
  //     if (credentials) {
  //       setEmail(credentials.email);
  //       setPassword(credentials.password);
  //       // setRememberMe(true);
  //     }
  //   } catch (error) {
  //     console.error('Error loading remembered credentials:', error);
  //   }
  // };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password!');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      
      if (result.success) {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => navigation.replace('MainTabs');

  return (
    <View style={styles.container}>
      {/* Ảnh nền tràn toàn màn hình */}
      <Image 
        source={require('../../assets/login-bg.png')} 
        style={styles.backgroundImage} 
        resizeMode="cover" 
      />
      
      {/* Form đăng nhập */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Hello!</Text>
        <Text style={styles.subtitle}>Welcome back</Text>
        
        {/* Email */}
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            placeholderTextColor="#bbb"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#bbb"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Remember Me */}
        <View style={styles.rememberForgotRow}>
          <TouchableOpacity 
            style={styles.rememberContainer}
            onPress={() => setRememberMe(!rememberMe)}
            disabled={loading}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>
          
          {/* Quên mật khẩu */}
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} disabled={loading}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Nút đăng nhập */}
        <TouchableOpacity 
          style={[styles.signInBtn, loading && styles.signInBtnDisabled]} 
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.signInText}>Signing In...</Text>
            </View>
          ) : (
            <Text style={styles.signInText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* OR CONTINUE WITH */}
        <Text style={styles.orText}>OR CONTINUE WITH</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn} disabled={loading}>
            <FontAwesome name="google" size={24} color="#EA4335" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} disabled={loading}>
            <FontAwesome name="facebook" size={24} color="#1877F3" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} disabled={loading}>
            <FontAwesome name="apple" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Đăng ký */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} disabled={loading}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Login */}
        <TouchableOpacity style={styles.guestBtn} onPress={handleGuestLogin} disabled={loading}>
          <Text style={styles.guestText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height * 0.5, // Tăng chiều cao lên 50% thay vì 35%
    zIndex: 1,
  },
  formContainer: {
    flex: 1,
    marginTop: height * 0.35, // Giữ nguyên vị trí form
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 3,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  rememberText: {
    color: '#666',
    fontSize: 14,
  },
  forgotText: {
    color: colors.accent,
    fontSize: 14,
  },
  signInBtn: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 16,
  },
  signInBtnDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 12,
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  socialBtn: {
    marginHorizontal: 12,
    backgroundColor: '#F5F6FA',
    borderRadius: 50,
    padding: 10,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  signupText: {
    color: '#888',
    fontSize: 14,
  },
  signupLink: {
    color: colors.accent,
    fontWeight: 'bold',
    fontSize: 14,
  },
  guestBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});