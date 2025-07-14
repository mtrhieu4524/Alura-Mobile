import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, typography, dimensions } from '../constants';
import authService from '../services/authService';
import Toast from 'react-native-toast-message';

const ProfileScreen = ({ navigation }) => {
  const { user, isLoggedIn, logout } = useAuth();
  
  // Profile form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  
  // Password form states
  const [isPasswordFormVisible, setPasswordFormVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!isLoggedIn) {
        setProfileLoading(false);
        return;
      }

      try {
        const { userId: currentUserId } = await authService.getCurrentUser();
        if (currentUserId) {
          setUserId(currentUserId);
          
          const response = await authService.getUserProfile(currentUserId);
          if (response.success && response.data && response.data.user) {
            const userData = response.data.user;
            setName(userData.name || '');
            setEmail(userData.email || '');
            setPhone(userData.phone || '');
            setAddress(userData.address || '');
            setIsGoogleUser(userData.isGoogle || false);
          } else {
            Toast.show({
              type: 'error',
              text1: 'Lỗi',
              text2: 'Không thể tải thông tin profile',
            });
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Có lỗi xảy ra khi tải profile',
        });
      } finally {
        setProfileLoading(false);
      }
    };

    loadUserProfile();
  }, [isLoggedIn]);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể cập nhật profile',
      });
      return;
    }

    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập tên',
      });
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        name: name.trim(),
        email: email,
        phone: phone.trim(),
        address: address.trim(),
      };

      const response = await authService.updateUserProfile(userId, profileData);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Cập nhật profile thành công!',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: response.message || 'Cập nhật profile thất bại',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Có lỗi xảy ra khi cập nhật profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng điền đầy đủ thông tin',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu mới không khớp',
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Đổi mật khẩu thành công!',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordFormVisible(false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: response.message || 'Đổi mật khẩu thất bại',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Có lỗi xảy ra khi đổi mật khẩu',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
  return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.guestScrollView} contentContainerStyle={styles.guestContainer}>
          {/* Header */}
          <Text style={styles.guestHeaderTitle}>Your Profile</Text>
          
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.guestAvatarContainer}>
              <View style={styles.guestAvatar}>
                <Ionicons name="person" size={48} color={colors.textSecondary} />
              </View>
            </View>
            
      <Text style={styles.welcomeTitle}>Welcome to Alurà!</Text>
            <Text style={styles.welcomeSubtitle}>
        Log in to access your personal details, order history, prescriptions, and exclusive offers.
      </Text>
            
            <TouchableOpacity 
              style={styles.loginSignupButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginSignupButtonText}>Log in or Sign Up</Text>
      </TouchableOpacity>
    </View>

          {/* Why Log In Section */}
          <View style={styles.whyLoginSection}>
      <Text style={styles.sectionTitle}>Why Log In?</Text>
            
            <TouchableOpacity style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="receipt-outline" size={24} color={colors.accent} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>View Order History</Text>
                <Text style={styles.benefitDescription}>Track your past purchases and reorder easily.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="medical-outline" size={24} color={colors.accent} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Manage Prescriptions</Text>
                <Text style={styles.benefitDescription}>Request refills and view your active prescriptions securely.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="star-outline" size={24} color={colors.accent} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Exclusive Offers & Rewards</Text>
                <Text style={styles.benefitDescription}>Unlock personalized discounts and loyalty rewards.</Text>
        </View>
            </TouchableOpacity>
      </View>

          {/* Visit Us Section */}
          <View style={styles.visitUsSection}>
            <Text style={styles.sectionTitle}>Visit Us</Text>
            
            <View style={styles.pharmacyDetailsCard}>
              <Text style={styles.pharmacyDetailsTitle}>Pharmacy Details</Text>
              
              <View style={styles.pharmacyDetailItem}>
                <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.pharmacyDetailText}>
                  D1 Street, Long Thanh My, Thu Duc City, Ho Chi Minh City
                </Text>
        </View>
              
              <View style={styles.pharmacyDetailItem}>
                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.pharmacyDetailText}>
                  Mon - Fri: 8:00 AM - 8:00 PM, Sat: 9:00 AM - 6:00 PM
                </Text>
      </View>
              
              <View style={styles.pharmacyDetailItem}>
                <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.pharmacyDetailText}>0795 795 959</Text>
        </View>
      </View>
    </View>
        </ScrollView>
      </SafeAreaView>
  );
}

  if (profileLoading) {
  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </Text>
        </View>
      </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{name || 'Người dùng'}</Text>
              <Text style={styles.userEmail}>{email}</Text>
              {isGoogleUser && (
                <View style={styles.googleBadge}>
                  <Ionicons name="logo-google" size={12} color={colors.accent} />
                  <Text style={styles.googleBadgeText}>Google Account</Text>
                </View>
              )}
    </View>

            <TouchableOpacity style={styles.logoutIconButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('OrderHistory')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="receipt-outline" size={24} color={colors.accent} />
              </View>
              <Text style={styles.quickActionText}>Order history</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Profile Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal information</Text>
            
            {/* Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={[styles.textInput, isGoogleUser && styles.disabledInput]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                editable={!isGoogleUser}
                placeholderTextColor={colors.textSecondary}
              />
              {isGoogleUser && (
                <Text style={styles.helperText}>
                  Không thể chỉnh sửa tên với tài khoản Google
                </Text>
              )}
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Phone Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone number</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Address Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={address}
                onChangeText={setAddress}
                placeholder="Nhập địa chỉ của bạn"
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={colors.textSecondary}
              />
        </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>Save changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Password Section */}
          {!isGoogleUser && (
            <View style={styles.formSection}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setPasswordFormVisible(!isPasswordFormVisible)}
              >
                <Text style={styles.sectionTitle}>Change password</Text>
                <Ionicons 
                  name={isPasswordFormVisible ? 'chevron-up' : 'chevron-down'} 
                  size={24} 
                  color={colors.textPrimary} 
                />
              </TouchableOpacity>

              {isPasswordFormVisible && (
                <View style={styles.passwordForm}>
                  {/* Current Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mật khẩu hiện tại *</Text>
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="Nhập mật khẩu hiện tại"
                        secureTextEntry={!showCurrentPassword}
                        placeholderTextColor={colors.textSecondary}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        <Ionicons 
                          name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'} 
                          size={20} 
                          color={colors.textSecondary} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* New Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mật khẩu mới *</Text>
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Nhập mật khẩu mới"
                        secureTextEntry={!showNewPassword}
                        placeholderTextColor={colors.textSecondary}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                      >
                        <Ionicons 
                          name={showNewPassword ? 'eye-outline' : 'eye-off-outline'} 
                          size={20} 
                          color={colors.textSecondary} 
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.helperText}>Mật khẩu phải có ít nhất 6 ký tự</Text>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Xác nhận mật khẩu mới *</Text>
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Xác nhận mật khẩu mới"
                        secureTextEntry={!showConfirmPassword}
                        placeholderTextColor={colors.textSecondary}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <Ionicons 
                          name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                          size={20} 
                          color={colors.textSecondary} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Save Password Button */}
                  <TouchableOpacity
                    style={[styles.secondaryButton, loading && styles.disabledButton]}
                    onPress={handleChangePassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.accent} size="small" />
        ) : (
          <>
                        <Ionicons name="key-outline" size={20} color={colors.accent} style={{ marginRight: 8 }} />
                        <Text style={styles.secondaryButtonText}>Update password</Text>
          </>
        )}
                  </TouchableOpacity>
      </View>
              )}
    </View>
          )}

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Space for floating tab bar
  },
  guestScrollView: {
    flex: 1,
  },
  guestContainer: {
    paddingHorizontal: dimensions.spacing.large,
    paddingBottom: 120, // Space for floating tab bar
  },
  guestHeaderTitle: {
    fontSize: typography.sizes.xLarge,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: dimensions.spacing.large,
    marginBottom: dimensions.spacing.small,
    textAlign: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    padding: dimensions.spacing.large,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: dimensions.borderRadius.large,
    marginBottom: dimensions.spacing.large,
  },
  guestAvatarContainer: {
    marginBottom: dimensions.spacing.medium,
  },
  guestAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: dimensions.spacing.small,
  },
  welcomeSubtitle: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    marginBottom: dimensions.spacing.xLarge,
  },
  loginSignupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.buttonPrimary,
    paddingVertical: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 120,
  },
  loginSignupButtonText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
  },
  whyLoginSection: {
    padding: dimensions.spacing.large,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: dimensions.borderRadius.large,
    marginBottom: dimensions.spacing.large,
  },
  sectionTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: dimensions.spacing.medium,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: dimensions.spacing.medium,
    backgroundColor: colors.background,
    borderRadius: dimensions.borderRadius.large,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: dimensions.spacing.medium,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: dimensions.spacing.small,
  },
  benefitDescription: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
  },
  visitUsSection: {
    padding: dimensions.spacing.large,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: dimensions.borderRadius.large,
  },
  pharmacyDetailsCard: {
    padding: dimensions.spacing.large,
    backgroundColor: colors.background,
    borderRadius: dimensions.borderRadius.large,
  },
  pharmacyDetailsTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: dimensions.spacing.medium,
  },
  pharmacyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.spacing.medium,
  },
  pharmacyDetailText: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: dimensions.spacing.large,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: dimensions.spacing.medium,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.sizes.xLarge,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  googleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  googleBadgeText: {
    fontSize: typography.sizes.small,
    color: colors.accent,
    marginLeft: 4,
    fontWeight: typography.weights.medium,
  },
  logoutIconButton: {
    padding: dimensions.spacing.small,
    borderRadius: dimensions.borderRadius.medium,
    backgroundColor: colors.error + '15',
  },
  quickActionsSection: {
    paddingHorizontal: dimensions.spacing.large,
    paddingVertical: dimensions.spacing.medium,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: dimensions.spacing.medium,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: dimensions.borderRadius.large,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: dimensions.spacing.medium,
  },
  quickActionText: {
    flex: 1,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  formSection: {
    marginTop: dimensions.spacing.medium,
    marginHorizontal: dimensions.spacing.large,
    padding: dimensions.spacing.large,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: dimensions.borderRadius.large,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: dimensions.spacing.large,
  },
  inputLabel: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: dimensions.spacing.small,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.borderRadius.medium,
    paddingHorizontal: dimensions.spacing.medium,
    paddingVertical: dimensions.spacing.medium,
    fontSize: typography.sizes.medium,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    minHeight: 48,
  },
  multilineInput: {
    height: 80,
    paddingTop: dimensions.spacing.medium,
  },
  disabledInput: {
    backgroundColor: colors.lightGray,
    color: colors.textSecondary,
  },
  helperText: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 48,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.accent,
    minHeight: 48,
  },
  secondaryButtonText: {
    color: colors.accent,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  passwordForm: {
    marginTop: dimensions.spacing.medium,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.borderRadius.medium,
    backgroundColor: colors.background,
    minHeight: 48,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: dimensions.spacing.medium,
    paddingVertical: dimensions.spacing.medium,
    fontSize: typography.sizes.medium,
    color: colors.textPrimary,
  },
  eyeButton: {
    padding: dimensions.spacing.medium,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacing: {
    height: dimensions.spacing.xLarge,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    marginTop: dimensions.spacing.medium,
  },
}); 

export default ProfileScreen; 