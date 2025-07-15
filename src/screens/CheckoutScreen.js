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
  const { cart, fetchCartFromAPI, clearAllCart } = useCart();
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

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
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

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare order data in format matching web API
      const orderData = {
        customerInfo: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
        shippingMethod: shippingMethod.toUpperCase(), // STANDARD or EXPRESS
        note: note.trim(),
        // Use cart item IDs, not product IDs (same as web's selectedCartItemIds)
        items: cart.map(item => ({
          productId: item._id, // Use cart item ID for selectedCartItemIds
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        paymentMethod: payment,
        shippingFee: shipping,
        totalAmount: total,
      };

      console.log('Creating order with data:', orderData);

      if (payment === 'vnpay') {
        // VNPAY flow: prepare order first, then create payment URL
        await handleVNPayPayment(orderData);
      } else {
        // COD flow: create order directly
        const response = await orderService.createOrder(orderData);

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
        //
      
      setVnpayUrl(paymentUrlResponse.paymentUrl);
      setShowVNPayWebView(true);
      // console.log('=== VNPAY PAYMENT FLOW WEBVIEW OPENED ===');
      
    } catch (error) {
      // console.error('=== VNPAY PAYMENT FLOW ERROR ===');    
      // console.error('Error details:', error);
      // console.error('Error message:', error.message);
      // console.error('Error stack:', error.stack);
      // Alert.alert('Lỗi hệ thống', `Có lỗi xảy ra trong quá trình thanh toán: ${error.message}`);
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

  // Chỉ dùng Android emulator backend vì React Native không thể dùng localhost
  const alternativeBackends = [
    'http://10.0.2.2:4000/api/', // Android emulator - chỉ URL này hoạt động
  ];

  const processVNPayCallbackWithRetry = async (params) => {
    // console.log('🔄 Attempting to process VNPAY callback with retry logic...');
    
    // Lưu callback vào storage trước khi thử
    try {
      await AsyncStorage.setItem('pending_vnpay_callback', JSON.stringify(params));
      // console.log('💾 VNPAY callback saved to local storage for backup');
    } catch (err) {
      // console.log('⚠️ Could not save callback to storage:', err.message);
    }

    // Thử với backend mặc định trước
    try {
      return await retryWithBackoff(async () => {
        return await orderService.processVNPayCallback(params);
      }, 3, 2000);
    } catch (error) {
      // console.log('❌ Default backend failed, trying alternatives...');
      
      // Thử với alternative backends
      for (const baseUrl of alternativeBackends) {
        try {
          // console.log(`🧪 Trying alternative backend: ${baseUrl}`);
          
          // Tạo URL cho alternative backend
          const fullUrl = `${baseUrl}payment/vnpay/return`;
          const queryParams = new URLSearchParams(params).toString();
          const url = `${fullUrl}?${queryParams}`;
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          });
          
          if (response.ok) {
            const result = await response.json();
            // console.log(`✅ Alternative backend ${baseUrl} succeeded!`);
            
            // Xóa pending callback vì đã thành công
            await AsyncStorage.removeItem('pending_vnpay_callback');
            
            return { success: true, message: 'Processed successfully', data: result };
          } else {
            // console.log(`❌ Alternative backend ${baseUrl} returned ${response.status}`);
          }
        } catch (altError) {
          // console.log(`❌ Alternative backend ${baseUrl} failed:`, altError.message);
        }
      }
      
      // Nếu tất cả đều fail, throw original error
      throw error;
    }
  };

  const handleVNPaySuccess = async (params) => {
    setShowVNPayWebView(false);
    
    try {
      // console.log('=== VNPAY SUCCESS HANDLER START ==='); 
      // console.log('📱 Mobile app received VNPAY success callback');
      // console.log('VNPAY callback params:', JSON.stringify(params, null, 2));
      
      // Debug: Log all VNPAY transaction details
      // console.log('🔍 VNPAY Transaction Details:');
      // console.log('- Response Code:', params.vnp_ResponseCode);
      // console.log('- Transaction Ref:', params.vnp_TxnRef);
      // console.log('- Transaction No:', params.vnp_TransactionNo);
      // console.log('- Amount:', params.vnp_Amount);
      // console.log('- Pay Date:', params.vnp_PayDate);
      
      // Chỉ kiểm tra response code, không validate signature ở client
      if (params.vnp_ResponseCode === '00') {
        // console.log('✅ VNPAY payment confirmed successful!');
        // console.log('🔄 Mobile will notify backend about successful payment');
        
        Toast.show({
          type: 'success',
          text1: 'Thanh toán thành công!',
          text2: 'Đang xử lý đơn hàng...',
        });
        
        try {
          // Process VNPAY callback với retry logic
          // console.log('📡 Calling backend to process VNPAY callback with enhanced retry...');
          const processResult = await processVNPayCallbackWithRetry(params);
          // console.log('Backend process result:', processResult);
          
          if (processResult.success) {
            // console.log('✅ Backend processed VNPAY callback successfully');
            
            // Clear cart locally đầu tiên (để UI responsive)
            // console.log('🧹 Clearing cart locally...
            await clearAllCart();
            // console.log('✅ Cart cleared successfully');
            
            // Refresh cart để sync với backend
            // console.log('🔄 Refreshing cart to sync with backend...');
            await fetchCartFromAPI();
            // console.log('✅ Cart refreshed from API');  
            
            // Show success
            Alert.alert(
              'Đặt hàng thành công!',
              'Thanh toán VNPAY và tạo đơn hàng đã hoàn tất. Đơn hàng đã xuất hiện trong lịch sử.',
              [
                {
                  text: 'Xem đơn hàng',
                  onPress: () => {
                    // console.log('📱 User chose to view orders - navigating to OrderHistory');
                    navigation.navigate('OrderHistory');
                  },
                },
                {
                  text: 'Về trang chủ',
                  onPress: () => {
                    // console.log('📱 User chose to go home');
                    navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
        });
                  },
                },
              ]
            );
          } else {
            // console.error('❌ Backend failed to process VNPAY callback:', processResult.message);
            
            // Nếu backend fail nhưng payment thành công, vẫn clear cart và thông báo
            await clearAllCart();
            
            Alert.alert(
              'Thanh toán thành công',
              'Thanh toán đã được xác nhận. Nếu đơn hàng chưa xuất hiện, vui lòng liên hệ hỗ trợ hoặc thử làm mới.',
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
          // console.error('❌ Error processing VNPAY callback:', processError);
          
          // EMERGENCY FALLBACK: Thanh toán thành công nhưng backend không kết nối được
          // console.log('🚨 EMERGENCY FALLBACK: Payment successful but backend unreachable');
          // console.log('Saving order offline and clearing cart');
          
          // Lưu đơn hàng offline để process sau
          try {
            const orderDetails = {
              customerInfo: customerInfo,
              shippingMethod: selectedShippingMethod,
              note: note,
              items: cart.map(item => ({
                productId: item._id || item.id,
                quantity: item.quantity
              }))
            };

            const offlineOrderId = await OfflineOrderManager.saveOfflineVNPayOrder(params, orderDetails);
            // console.log('💾 Saved offline VNPAY order:', offlineOrderId);
          } catch (storageError) {
            // console.log('Could not save offline order:', storageError.message);
          }
          
          await clearAllCart();
          
          Alert.alert(
            'Thanh toán thành công!',
            'Thanh toán VNPAY đã hoàn tất. Đơn hàng được lưu tạm thời và sẽ được xử lý khi kết nối ổn định. Kiểm tra lại sau vài phút.',
            [
              {
                text: 'Kiểm tra đơn hàng',
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
        data={cart}
        keyExtractor={item => item.id}
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
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')} VND x {item.quantity}</Text>
            </View>
            <Text style={styles.itemTotal}>{(item.price * item.quantity).toLocaleString('vi-VN')} VND</Text>
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
              style={[styles.orderBtn, (loading || userProfileLoading) && styles.orderBtnDisabled]} 
              onPress={handleOrder}
              disabled={loading || userProfileLoading}
            >
              {loading ? (
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