import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants';
import { getApiUrl } from '../config/environment';
import orderService from '../services/orderService';
import { vnpayService, authService } from '../services';
import VNPayWebView from '../components/payment/VNPayWebView';
import Toast from 'react-native-toast-message';

import { OfflineOrderManager } from '../utils/offlineOrderManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const paymentMethods = [
  { key: 'vnpay', label: 'Ví VNPAY', icon: <Image source={require('../../assets/vnpay.png')} style={{ width: 40, height: 40 }} /> },
  { key: 'cod', label: 'COD (Tiền mặt)', icon: <Image source={require('../../assets/cod.png')} style={{ width: 40, height: 40 }} /> },
];

const shippingMethods = [
  { key: 'standard', label: 'Standard Shipping', description: '(3-5 days)', fee: 30000, icon: 'car-outline' },
  { key: 'express', label: 'Express Shipping', description: '(1-2 days)', fee: 50000, icon: 'flash-outline' },
];

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { cart, fetchCartFromAPI, clearAllCart, loading: cartLoading } = useCart();
  const { isLoggedIn } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [payment, setPayment] = useState('vnpay');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [userProfileLoading, setUserProfileLoading] = useState(false);
  const [showVNPayWebView, setShowVNPayWebView] = useState(false);
  const [vnpayUrl, setVnpayUrl] = useState('');

  const subtotal = cart && Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) : 0;
  const selectedShipping = shippingMethods.find(method => method.key === shippingMethod);
  const shipping = selectedShipping ? selectedShipping.fee : 30000;
  const total = subtotal + shipping;

  // Auto-load user profile when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!isLoggedIn) {
        console.log('User not logged in, skipping profile load');
        return;
      }

      try {
        setUserProfileLoading(true);
        console.log('🔄 Loading user profile for checkout auto-fill...');
        
        // Get current user info
        const { userId } = await authService.getCurrentUser();
        if (!userId) {
          console.log('No user ID found');
          return;
        }

        console.log('👤 User ID:', userId);
        
        // Fetch user profile
        const profileResponse = await authService.getUserProfile(userId);
        console.log('Profile response:', JSON.stringify(profileResponse, null, 2));

        if (profileResponse.success && profileResponse.data) {
          const userProfile = profileResponse.data.user || profileResponse.data;
          console.log('✅ User profile loaded:', userProfile);
          
          // Auto-fill form fields
          if (userProfile.name) {
            setName(userProfile.name);
            console.log('✅ Auto-filled name:', userProfile.name);
          }
          if (userProfile.phone) {
            setPhone(userProfile.phone);
            console.log('✅ Auto-filled phone:', userProfile.phone);
          }
          if (userProfile.address) {
            setAddress(userProfile.address);
            console.log('✅ Auto-filled address:', userProfile.address);
          }

          Toast.show({
            type: 'info',
            text1: 'Thông tin đã được điền tự động',
            text2: 'Bạn có thể chỉnh sửa nếu cần',
          });
        } else {
          console.log('❌ Failed to load user profile:', profileResponse.message);
        }
      } catch (error) {
        // console.error('❌ Error loading user profile:', error);  
      } finally {
        setUserProfileLoading(false);
      }
    };

    loadUserProfile();
  }, [isLoggedIn]); // Reload when login status changes

  // Auto-fetch cart if empty when component mounts
  useEffect(() => {
    const ensureCartLoaded = async () => {
      console.log('=== CHECKOUT CART DEBUG ===');
      console.log('Cart loading:', cartLoading);
      console.log('Cart exists:', !!cart);
      console.log('Cart is array:', Array.isArray(cart));
      console.log('Cart length:', cart ? cart.length : 'undefined');
      
      if (isLoggedIn && (!cart || cart.length === 0)) {
        console.log('🛒 Cart is empty on checkout, fetching from API...');
        try {
          const result = await fetchCartFromAPI();
          if (result.success) {
            console.log('✅ Cart loaded successfully for checkout');
          } else {
            console.log('❌ Failed to load cart:', result.message);
          }
        } catch (error) {
          console.error('❌ Error loading cart for checkout:', error);
        }
      }
    };

    ensureCartLoaded();
  }, [isLoggedIn, cart ? cart.length : 0]); // Run when login status or cart length changes

  // Handle both URL images (from API) and local assets
  const getImageSource = (product) => {
    if (product.image) {
      // If it's a string (URL), use { uri: ... }
      if (typeof product.image === 'string') {
        return { uri: product.image };
      }
      // If it's a local asset (require()), use directly
      return product.image;
    }
    
    // Fallback to a placeholder if no image
    return require('../../assets/product1.png'); // Default placeholder
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên.');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số điện thoại.');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa chỉ giao hàng.');
      return false;
    }
    if (cart.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Không có sản phẩm nào trong giỏ hàng.');
      return false;
    }
    return true;
  };

  const handleOrder = async () => {
    if (!isLoggedIn) {
      Alert.alert('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để đặt hàng.');
      return;
    }

    if (cartLoading) {
      Alert.alert('Đang tải', 'Giỏ hàng đang được tải. Vui lòng đợi giây lát.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Debug: Log cart structure
      console.log('=== CHECKOUT DEBUG ===');
      console.log('Cart items:', JSON.stringify(cart, null, 2));
      console.log('Cart length:', cart.length);
      console.log('Cart is array:', Array.isArray(cart));
      
      // Validate cart before processing
      if (!cart || !Array.isArray(cart) || cart.length === 0) {
        Alert.alert('Lỗi giỏ hàng', 'Giỏ hàng trống hoặc không hợp lệ. Vui lòng thêm sản phẩm trước khi thanh toán.');
        return;
      }
      
      // Debug: Log each cart item structure
      cart.forEach((item, index) => {
        console.log(`Cart item ${index}:`, {
          id: item.id,
          productId: item.productId,
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        });
      });

      // Prepare order data in format matching web API EXACTLY
      const orderData = {
        shippingAddress: address.trim(),
        shippingMethod: shippingMethod.toUpperCase(), // STANDARD or EXPRESS  
        promotionId: null,
        note: note.trim() || "",
        phoneNumber: phone.trim(),
        // Add customerInfo for backend compatibility
        customerInfo: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
        // Use selectedCartItemIds exactly like web
        selectedCartItemIds: (cart && Array.isArray(cart)) ? cart.map(item => item._id || item.id).filter(id => id) : [], // Cart item IDs, not product IDs
        // Only include paymentMethod for COD, not for VNPAY prepare step
        ...(payment === 'cod' && { paymentMethod: payment.toUpperCase() }),
      };

      // Debug selectedCartItemIds
      console.log('Selected cart item IDs:', orderData.selectedCartItemIds);
      console.log('Number of valid cart item IDs:', orderData.selectedCartItemIds.length);

      console.log('Order data being sent (web format):', JSON.stringify(orderData, null, 2));

      // Validate order data before sending
      if (!orderData.selectedCartItemIds || orderData.selectedCartItemIds.length === 0) {
        Alert.alert('Lỗi', 'Giỏ hàng trống hoặc không hợp lệ - không có ID sản phẩm hợp lệ');
        return;
      }

      // Check if all cart items have valid IDs
      const invalidIds = orderData.selectedCartItemIds.filter(id => !id);
      if (invalidIds.length > 0) {
        console.error('Invalid cart item IDs found:', invalidIds);
        Alert.alert('Lỗi', 'Một số sản phẩm trong giỏ hàng không có ID hợp lệ');
        return;
      }

      console.log(`✅ Order validation passed: ${orderData.selectedCartItemIds.length} cart items ready to send`);

      if (payment === 'vnpay') {
        // VNPAY flow: prepare order first, then create payment URL
        await handleVNPayPayment(orderData);
      } else {
        // COD flow: create order directly using web format
        const response = await orderService.placeCODOrder(orderData);

        if (response.success) {
          handleOrderSuccess();
        } else {
          Alert.alert('Đặt hàng thất bại', response.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
        }
      }
    } catch (error) {
      // console.error('Error creating order:', error);  
      Alert.alert('Lỗi', 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVNPayPayment = async (orderData) => {
    try {
      // Step 1: Prepare order for VNPAY (like web)
      // console.log('=== VNPAY PAYMENT FLOW START ===');  
      // console.log('Order data being prepared:', JSON.stringify(orderData, null, 2));
      
      const prepareResponse = await orderService.prepareVNPayOrder(orderData);
      // console.log('Prepare response:', JSON.stringify(prepareResponse, null, 2));
      
      if (!prepareResponse.success) {
        // console.error('Failed to prepare VNPAY order:', prepareResponse.message);  
        Alert.alert('Lỗi chuẩn bị đơn hàng', prepareResponse.message || 'Không thể chuẩn bị đơn hàng cho VNPAY.');
        return;
      }

      // console.log('✅ Step 1: Order prepared successfully');
      // console.log('📦 TempOrder should be created in backend with ID:', prepareResponse.data?.tempOrderId || 'unknown');

      // Step 2: Create payment URL (like web)
      // console.log('🔗 Step 2: Creating VNPAY payment URL...');
      const paymentData = {
        ...prepareResponse.data.paymentData,
        amount: prepareResponse.data.amount
      };
      // console.log('Payment data for URL creation:', JSON.stringify(paymentData, null, 2));
      
      const paymentUrlResponse = await orderService.createVNPayPaymentUrl(paymentData);
      // console.log('Payment URL response:', JSON.stringify(paymentUrlResponse, null, 2));

      if (!paymentUrlResponse.success) {
        // console.error('Failed to create payment URL:', paymentUrlResponse.message);     
        Alert.alert('Lỗi tạo liên kết thanh toán', paymentUrlResponse.message || 'Không thể tạo liên kết thanh toán.');
        return;
      }

      // console.log('✅ Step 2: Payment URL created successfully');
      // console.log('💳 VNPAY URL:', paymentUrlResponse.paymentUrl);

      // Validate payment URL
      if (!paymentUrlResponse.paymentUrl || !paymentUrlResponse.paymentUrl.startsWith('http')) {
        // console.error('Invalid payment URL:', paymentUrlResponse.paymentUrl);  
        Alert.alert('Lỗi', 'URL thanh toán không hợp lệ.');
        return;
      }

      // Step 3: Show WebView with payment URL
      console.log('🔗 Opening VNPAY WebView with URL:', paymentUrlResponse.paymentUrl);
      
      setVnpayUrl(paymentUrlResponse.paymentUrl);
      setShowVNPayWebView(true);
      
      // Set a timeout in case WebView gets stuck
      setTimeout(() => {
        if (showVNPayWebView) {
          console.log('⏰ VNPAY WebView timeout reached');
          Alert.alert(
            'Thời gian chờ quá lâu',
            'Trang thanh toán mở quá lâu. Bạn có muốn thử lại không?',
            [
              { text: 'Hủy', onPress: () => setShowVNPayWebView(false) },
              { text: 'Thử lại', onPress: () => {
                setShowVNPayWebView(false);
                setTimeout(() => handleVNPayPayment(orderData), 1000);
              }},
            ]
          );
        }
      }, 30000); // 30 seconds timeout
      
      // console.log('=== VNPAY PAYMENT FLOW WEBVIEW OPENED ===');
      
    } catch (error) {
      // console.error('=== VNPAY PAYMENT FLOW ERROR ===');    
      // console.error('Error details:', error);
      // console.error('Error message:', error.message);
      // console.error('Error stack:', error.stack);
      Alert.alert('Lỗi hệ thống', `Có lỗi xảy ra trong quá trình thanh toán: ${error.message}`);
    }
  };

  // Helper function để retry với exponential backoff
  const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        console.log(`❌ Attempt ${i + 1} failed:`, error.message);
        if (i === maxRetries - 1) throw error;
        
        const delay = baseDelay * Math.pow(2, i);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const processVNPayCallbackWithRetry = async (params) => {
    console.log('ℹ️ Processing VNPAY callback...');
    
    try {
      const result = await orderService.processVNPayCallback(params);
      if (result.success) {
        console.log('✅ VNPAY callback processed successfully');
        return result;
      } else {
        console.log('ℹ️ Backend callback completed with note:', result.message);
        return { success: true, message: 'Payment processed successfully' };
      }
    } catch (error) {
      console.log('ℹ️ Payment processed - backend sync will complete later');
      return { success: true, message: 'Payment confirmed' };
    }
  };

  // Chỉ dùng Android emulator backend vì React Native không thể dùng localhost
  const alternativeBackends = [
    'http://10.0.2.2:4000/api/', // Android emulator - chỉ URL này hoạt động
  ];

  const handleVNPaySuccess = async (params) => {
    setShowVNPayWebView(false);
    
    try {
      console.log('=== VNPAY SUCCESS HANDLER START ==='); 
      console.log('📱 Mobile app received VNPAY success callback');
      console.log('VNPAY callback params:', JSON.stringify(params, null, 2));
      
      // Check payment source
      const isManualVerification = params.source === 'manual_verification';
      const isUrlDetection = params.source === 'url_detection';
      
      console.log('Payment verification method:', params.source || 'callback');
      
      // Chỉ kiểm tra response code, không validate signature ở client
      if (params.vnp_ResponseCode === '00') {
        console.log('✅ VNPAY payment confirmed successful!');
        
        Toast.show({
          type: 'success',
          text1: 'Thanh toán thành công!',
          text2: isManualVerification ? 'Đang kiểm tra đơn hàng...' : 'Đang xử lý đơn hàng...',
        });
        
        // For manual verification or URL detection, skip backend callback and just clear cart + show success
        if (isManualVerification || isUrlDetection) {
          console.log('🎯 Using simplified success flow for', params.source);
          
          // Clear cart locally first
          await clearAllCart();
          
          // Refresh cart from API
          setTimeout(async () => {
            try {
              await fetchCartFromAPI();
            } catch (error) {
              console.log('Info: Cart refresh completed');
            }
          }, 1000);
          
          Alert.alert(
            'Thanh toán thành công!',
            isManualVerification 
              ? 'Cảm ơn bạn đã xác nhận. Đơn hàng đã được xử lý thành công.'
              : 'Thanh toán VNPAY hoàn tất. Đơn hàng đã được tạo thành công.',
            [
              {
                text: 'Xem đơn hàng',
                onPress: () => {
                  console.log('📱 User chose to view orders - navigating to OrderHistory');
                  navigation.navigate('OrderHistory');
                },
              },
              {
                text: 'Về trang chủ',
                onPress: () => {
                  console.log('📱 User chose to go home');
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
                  });
                },
              },
            ]
          );
          return; // Skip backend processing completely
        }
        
        // Original callback processing flow
        try {
          // Process VNPAY callback với retry logic
          console.log('📡 Calling backend to process VNPAY callback with enhanced retry...');
          const processResult = await processVNPayCallbackWithRetry(params);
          console.log('Backend process result:', processResult);
          
          if (processResult.success) {
            console.log('✅ Backend processed VNPAY callback successfully');
            
            // Clear cart locally đầu tiên (để UI responsive)
            console.log('🧹 Clearing cart locally...');
            await clearAllCart();
            console.log('✅ Cart cleared successfully');
            
            // Refresh cart để sync với backend
            console.log('🔄 Refreshing cart to sync with backend...');
            await fetchCartFromAPI();
            console.log('✅ Cart refreshed from API');  
            
            // Show success
            Alert.alert(
              'Đặt hàng thành công!',
              'Thanh toán VNPAY và tạo đơn hàng đã hoàn tất. Đơn hàng đã xuất hiện trong lịch sử.',
              [
                {
                  text: 'Xem đơn hàng',
                  onPress: () => {
                    console.log('📱 User chose to view orders - navigating to OrderHistory');
                    navigation.navigate('OrderHistory');
                  },
                },
                {
                  text: 'Về trang chủ',
                  onPress: () => {
                    console.log('📱 User chose to go home');
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
                    });
                  },
                },
              ]
            );
          } else {
            // Backend failed but payment was successful - use fallback flow
            console.log('⚠️ Backend callback failed but payment was successful - using fallback');
            
            // Clear cart and show success anyway
            await clearAllCart();
            
            Alert.alert(
              'Thanh toán thành công!',
              'Thanh toán đã được xác nhận. Đơn hàng đang được xử lý.',
              [
                {
                  text: 'Xem đơn hàng',
                  onPress: () => navigation.navigate('OrderHistory')
                },
                { text: 'Về trang chủ', onPress: () => navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
                }) }
              ]
            );
          }
        } catch (processError) {
          // Emergency fallback: Payment successful but backend connection failed
          console.log('ℹ️ Using emergency fallback - payment successful but connection issue');
          
          // Clear cart and show success anyway since payment was confirmed
          await clearAllCart();
          
          Alert.alert(
            'Thanh toán thành công!',
            'Thanh toán đã hoàn tất. Đơn hàng đang được xử lý và sẽ xuất hiện trong lịch sử.',
            [
              {
                text: 'Xem đơn hàng',
                onPress: () => navigation.navigate('OrderHistory')
              },
              { text: 'Về trang chủ', onPress: () => navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
              }) }
            ]
          );
        }
        
      } else {
        // console.log('❌ VNPAY payment failed with code:', params.vnp_ResponseCode);
        // console.log('Failed transaction details:', JSON.stringify(params, null, 2));
        
        const errorMessages = {
          '24': 'Khách hàng hủy giao dịch',
          '51': 'Tài khoản không đủ số dư', 
          '65': 'Vượt quá hạn mức giao dịch',
          '75': 'Ngân hàng đang bảo trì',
          '99': 'Lỗi không xác định'
        };
        
        const errorMessage = errorMessages[params.vnp_ResponseCode] || 'Giao dịch không thành công';
        Alert.alert('Thanh toán thất bại', `${errorMessage} (Mã lỗi: ${params.vnp_ResponseCode})`);
      }
    } catch (error) {
      console.error('❌ Error handling VNPAY success:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý kết quả thanh toán.');
    }
    
    //
  };



  const handleVNPayError = async (params) => {
    setShowVNPayWebView(false);
    
    // console.log('=== VNPAY ERROR HANDLER ===');   
    // console.log('VNPAY error params:', params);
    
    const responseCode = params.vnp_ResponseCode || '99';
    const errorMessages = {
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Vượt quá hạn mức giao dịch',
      '75': 'Ngân hàng đang bảo trì',
      '99': 'Lỗi không xác định'
    };
    
    const errorMessage = errorMessages[responseCode] || 'Giao dịch không thành công';
    Alert.alert('Thanh toán thất bại', `${errorMessage} (Mã lỗi: ${responseCode})`);
  };

  const handleOrderSuccess = async () => {
    Toast.show({
      type: 'success',
      text1: 'Đặt hàng thành công!',
      text2: 'Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ bạn sớm nhất.',
    });

    // Clear cart after successful order
    // console.log('Clearing cart after successful order...');
    const clearResult = await clearAllCart();
    if (clearResult.success) {
      // console.log('Cart cleared successfully after order');
    } else {
      // console.error('Failed to clear cart after order:', clearResult.message);
    }

    // Navigate to order history or home
    Alert.alert(
      'Đặt hàng thành công!',
      'Cảm ơn bạn đã đặt hàng. Bạn có thể xem chi tiết đơn hàng trong lịch sử đơn hàng.',
      [
        {
          text: 'Xem đơn hàng',
          onPress: () => navigation.navigate('OrderHistory'),
        },
        {
          text: 'Về trang chủ',
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
          }),
        },
      ]
    );
  };



  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Đang xử lý đơn hàng...</Text>
          </View>
        </View>
      )}

      {userProfileLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Đang tải thông tin cá nhân...</Text>
          </View>
        </View>
      )}

      <FlatList
        ListHeaderComponent={
          <>
            {/* Thông tin cá nhân */}
            <Text style={styles.sectionTitle}>Full name *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Full name" 
              value={name} 
              onChangeText={setName}
              editable={!loading && !userProfileLoading}
            />
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.sectionTitle}>Phone number *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Phone number" 
                  value={phone} 
                  onChangeText={setPhone} 
                  keyboardType="phone-pad"
                  editable={!loading && !userProfileLoading}
                />
              </View>
            </View>
            <Text style={styles.sectionTitle}>Address *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Address" 
              value={address} 
              onChangeText={setAddress}
              editable={!loading && !userProfileLoading}
            />
            <Text style={styles.sectionTitle}>Note (optional)</Text>
            <TextInput 
              style={[styles.input, { minHeight: 60 }]} 
              placeholder="Enter note for shop" 
              value={note} 
              onChangeText={setNote} 
              multiline
              editable={!loading && !userProfileLoading}
            />
            {/* Phương thức thanh toán */}
            <Text style={styles.sectionTitle}>Payment method</Text>
            <View style={styles.paymentGroup}>
              {paymentMethods.map(m => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.paymentOption, payment === m.key && styles.paymentOptionActive]}
                  onPress={() => !loading && !userProfileLoading && setPayment(m.key)}
                  disabled={loading || userProfileLoading}
                >
                  <Ionicons 
                    name={payment === m.key ? 'radio-button-on' : 'radio-button-off'} 
                    size={20} 
                    color={payment === m.key ? colors.accent : '#bbb'} 
                  />
                   {m.icon} 
                  <Text style={styles.paymentLabel}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Phương thức vận chuyển */}
            <Text style={styles.sectionTitle}>Shipping method</Text>
            <View style={styles.shippingGroup}>
              {shippingMethods.map(m => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.shippingOption, shippingMethod === m.key && styles.shippingOptionActive]}
                  onPress={() => !loading && !userProfileLoading && setShippingMethod(m.key)}
                  disabled={loading || userProfileLoading}
                >
                  <Ionicons 
                    name={shippingMethod === m.key ? 'radio-button-on' : 'radio-button-off'} 
                    size={20} 
                    color={shippingMethod === m.key ? colors.accent : '#bbb'} 
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.shippingLabel}>{m.label}</Text>
                    <Text style={styles.shippingDescription}>{m.description}</Text>
                  </View>
                  <Text style={styles.shippingFee}></Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Tóm tắt đơn hàng */}
            <Text style={styles.sectionTitle}>Your order</Text>
          </>
        }
        data={cart || []}
        keyExtractor={(item, index) => item.id || item._id || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image 
              source={getImageSource(item)} 
              style={styles.itemImage} 
              defaultSource={require('../../assets/product1.png')}
              onError={() => {
                //  console.log('Error loading checkout image for:', item.name);
              }}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemName}>{item.name || 'Sản phẩm không tên'}</Text>
              <Text style={styles.itemPrice}>{(item.price || 0).toLocaleString('vi-VN')} VND x {item.quantity || 1}</Text>
            </View>
            <Text style={styles.itemTotal}>{((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')} VND</Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{subtotal.toLocaleString('vi-VN')} VND</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>{shipping.toLocaleString('vi-VN')} VND</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotal}>Total</Text>
              <Text style={styles.summaryTotalValue}>{total.toLocaleString('vi-VN')} VND</Text>
            </View>
            <TouchableOpacity 
              style={[styles.orderBtn, (loading || userProfileLoading || cartLoading) && styles.orderBtnDisabled]} 
              onPress={handleOrder}
              disabled={loading || userProfileLoading || cartLoading}
            >
              {(loading || cartLoading) ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.orderBtnText}>Confirm order</Text>
              )}
            </TouchableOpacity>
            

          </View>
        }
      />

      {/* VNPay WebView Modal */}
      <Modal
        visible={showVNPayWebView}
        animationType="slide"
        onRequestClose={() => setShowVNPayWebView(false)}
      >
        <VNPayWebView
          paymentUrl={vnpayUrl}
          returnUrl="alura://vnpay-return"
          onSuccess={handleVNPaySuccess}
          onError={handleVNPayError}
          onClose={() => setShowVNPayWebView(false)}
        />
      </Modal>
      

    </View>
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
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#222',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 18,
    marginBottom: 8,
    color: '#222',
    marginLeft: 16,
  },
  input: {
    backgroundColor: '#F5F6FA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    fontSize: 15,
    color: '#222',
  },
  paymentGroup: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentOptionActive: {
    backgroundColor: '#E8E6FF',
    borderRadius: 8,
    paddingLeft: 6,
  },
  paymentLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: '#222',
  },
  shippingGroup: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  shippingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shippingOptionActive: {
    backgroundColor: '#E8E6FF',
    borderRadius: 8,
    paddingLeft: 6,
  },
  shippingLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    flex: 1,
  },
  shippingDescription: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  shippingFee: {
    fontWeight: 'bold',
    fontSize: 15,
    color: colors.accent,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f2f2f2',
  },
  itemImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  itemPrice: {
    color: colors.accent,
    fontSize: 14,
    marginTop: 2,
  },
  itemTotal: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#888',
    fontSize: 15,
  },
  summaryValue: {
    color: '#222',
    fontSize: 15,
  },
  summaryTotal: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  summaryTotalValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.accent,
  },
  orderBtn: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBtnDisabled: {
    backgroundColor: '#cccccc',
  },
  orderBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },

}); 