import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';

const { width, height } = Dimensions.get('window');

// User cứng
const MOCK_USER = {
  email: 'user@gmail.com',
  password: 'user123',
};

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);

  const handleSignIn = () => {
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      login();
      navigation.replace('Main');
    } else {
      Alert.alert('Đăng nhập thất bại', 'Email hoặc mật khẩu không đúng!');
    }
  };

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
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
          </TouchableOpacity>
        </View>
        
        {/* Quên mật khẩu */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end', marginBottom: 18 }}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
        
        {/* Nút đăng nhập */}
        <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
        
        {/* OR CONTINUE WITH */}
        <Text style={styles.orText}>OR CONTINUE WITH</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <FontAwesome name="google" size={24} color="#EA4335" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <FontAwesome name="facebook" size={24} color="#1877F3" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <FontAwesome name="apple" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        {/* Đăng ký */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    color: '#6C63FF',
    fontSize: 14,
  },
  signInBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 16,
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
    color: '#6C63FF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});