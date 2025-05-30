import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const isValidEmail = email && email.includes('@');

  const handleSend = () => {
    if (!isValidEmail) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ!');
      return;
    }
    Alert.alert('Thành công', 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <SafeAreaView style={{ backgroundColor: '#fff' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <View style={{ width: 32 }} />
        </View>
      </SafeAreaView>
      {/* Nội dung */}
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={20} color="#6C63FF" style={{ marginRight: 8 }} />
          <Text style={styles.infoText}>
            Enter your email address below and we'll send you a link to reset your password.
          </Text>
        </View>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="name@example.com"
          placeholderTextColor="#bbb"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !isValidEmail && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!isValidEmail}
        >
          <Text style={[styles.sendText, !isValidEmail && styles.sendTextDisabled]}>Send Reset Link</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpBtn}>
          <Text style={styles.helpText}>Need more help?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  infoText: {
    color: '#666',
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
  label: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: '#222',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sendBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  sendBtnDisabled: {
    backgroundColor: '#E0DEFA',
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sendTextDisabled: {
    color: '#bcbcbc',
  },
  helpBtn: {
    alignSelf: 'center',
    marginTop: 8,
  },
  helpText: {
    color: '#6C63FF',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 