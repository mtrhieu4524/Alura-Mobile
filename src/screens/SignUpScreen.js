import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants';

const { width, height } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validateInputs = () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill all required fields.');
      return false;
    }
    
    if (password.length < 8) {
      Alert.alert('Error', 'Password must have at least 8 characters.');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return false;
    }
    
    if (!agree) {
      Alert.alert('Error', 'You must agree to Terms of Service & Privacy Policy to create an account.');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const result = await register(name.trim(), email.trim(), password);
      
      if (result.success) {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  const TermsModal = () => (
    <Modal
      visible={isModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsModalOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms of Service & Privacy Policy</Text>
            <TouchableOpacity
              onPress={() => setIsModalOpen(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#222" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalIntro}>
              Welcome to Alurà Mobile! By signing up and creating an account on
              our app, you agree to the following terms, conditions, and
              privacy policy. You acknowledge that you have read and agree to our
              Terms of Service & Privacy Policy. Thank you for your visit.
            </Text>

            <Text style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>1. Introduction</Text>
              {'\n'}
              We value your privacy and are committed to protecting your personal
              information. This Privacy Policy outlines how we collect, use, and
              protect your data.
            </Text>

            <Text style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>2. Information We Collect</Text>
              {'\n'}
              We collect information that you provide to us directly, such as when
              you create an account, make a purchase, or contact us. This may
              include your name, email address, phone number, shipping address,
              and payment information.
            </Text>

            <Text style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>3. How We Use Your Information</Text>
              {'\n'}
              We use your information to provide and improve our services, process
              transactions, communicate with you, and for marketing purposes.
            </Text>

            <Text style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>4. Data Security</Text>
              {'\n'}
              We implement various security measures to protect your personal
              information. However, no method of transmission over the internet
              is 100% secure.
            </Text>

            <Text style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>5. Contact Us</Text>
              {'\n'}
              If you have any questions or concerns about this Privacy Policy,
              please contact us through the app.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/login-bg.png')} 
        style={styles.backgroundImage} 
        resizeMode="cover" 
      />
      
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
        
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#bbb"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#bbb"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#bbb"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="#bbb"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
            <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={styles.termsCheckboxContainer}
            onPress={() => setAgree(!agree)}
            disabled={loading}
          >
            <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
              {agree && (
                <Ionicons name="checkmark" size={12} color="#fff" />
              )}
            </View>
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>I agree with the </Text>
              <TouchableOpacity onPress={() => setIsModalOpen(true)} disabled={loading}>
                <Text style={styles.termsLink}>Terms of Service & Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.signUpBtn, loading && styles.signUpBtnDisabled]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.signUpText}>Creating account...</Text>
            </View>
          ) : (
            <Text style={styles.signUpText}>Sign up</Text>
          )}
        </TouchableOpacity>

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

        <View style={styles.signInRow}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleSignIn} disabled={loading}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TermsModal />
    </View>
  );
};

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
    height: height * 0.4,
    zIndex: 1,
  },
  formContainer: {
    flex: 1,
    marginTop: height * 0.3,
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
  termsContainer: {
    marginBottom: 18,
  },
  termsCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 3,
    marginRight: 8,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  termsText: {
    fontSize: 13,
    color: '#666',
  },
  termsLink: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  signUpBtn: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 16,
  },
  signUpBtnDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  signInText: {
    color: '#888',
    fontSize: 14,
  },
  signInLink: {
    color: colors.accent,
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  closeButton: {
    marginLeft: 10,
  },
  modalBody: {
    padding: 20,
  },
  modalIntro: {
    fontSize: 14,
    color: '#222',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalSection: {
    fontSize: 14,
    color: '#222',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalSectionTitle: {
    fontWeight: 'bold',
  },
});

export default SignUpScreen; 