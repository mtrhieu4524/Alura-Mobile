import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SignUpScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);

  return (
    <View style={styles.container}>
      {/* Ảnh nền tràn toàn màn hình */}
      <Image 
        source={require('../../assets/login-bg.png')} 
        style={styles.backgroundImage} 
        resizeMode="cover" 
      />
      {/* Form đăng ký */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>Create an account</Text>
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
        {/* Đồng ý điều khoản - custom checkbox */}
        <View style={styles.agreeRow}>
          <TouchableOpacity onPress={() => setAgree(!agree)} style={styles.customCheckbox}>
            {agree ? (
              <Ionicons name="checkbox" size={22} color="#6C63FF" />
            ) : (
              <Ionicons name="square-outline" size={22} color="#bbb" />
            )}
          </TouchableOpacity>
          <Text style={styles.agreeText}>I agree with Terms & Conditions</Text>
        </View>
        {/* Nút đăng ký */}
        <TouchableOpacity style={styles.signUpBtn} disabled={!agree}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
        {/* OR SIGN UP WITH */}
        <Text style={styles.orText}>OR SIGN UP WITH</Text>
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
        {/* Đã có tài khoản? */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signupLink}>Sign in</Text>
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
    height: height * 0.5,
    zIndex: 1,
  },
  formContainer: {
    flex: 1,
    marginTop: height * 0.35,
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
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customCheckbox: {
    marginRight: 4,
  },
  agreeText: {
    marginLeft: 8,
    color: '#444',
    fontSize: 14,
  },
  signUpBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 16,
    opacity: 1,
  },
  signUpText: {
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