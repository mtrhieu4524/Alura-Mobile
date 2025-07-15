import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';

const VNPayWebView = ({ 
  paymentUrl, 
  onSuccess, 
  onError, 
  onClose,
  returnUrl 
}) => {
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [callbackProcessed, setCallbackProcessed] = useState(false);
  const [processingVNPayReturn, setProcessingVNPayReturn] = useState(false);
  const webViewRef = useRef(null);
  const timeoutRef = useRef(null);

  // Log component mount and props
  // useEffect(() => {
  //   console.log('=== VNPAY WEBVIEW MOUNTED ===');
  //   console.log('Payment URL:', paymentUrl);
  //   console.log('Return URL:', returnUrl);
  //   console.log('URL is valid:', paymentUrl && paymentUrl.startsWith('http'));
  // }, [paymentUrl, returnUrl]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Kiểm tra có nên load URL không (để block localhost)
  const handleShouldStartLoad = (request) => {
    // Kiểm tra request có tồn tại và có url property không
    if (!request || !request.url) {
      console.warn('Request object is missing or has no url property:', request);
      return true; // Cho phép load nếu không có thông tin
    }
    
    const { url } = request;
    // console.log('=== SHOULD START LOAD ===');
    // console.log('Request URL:', url);
    
    // Kiểm tra nếu là VNPAY return URL với callback parameters
    if ((url.includes('localhost') || url.includes('127.0.0.1') || url.includes('10.0.2.2')) && 
        url.includes('payment/vnpay/return') && 
        url.includes('vnp_ResponseCode=')) {
      
      // console.log('🎯 Detected VNPAY return URL with callback params');
      
      // Prevent duplicate processing
      if (callbackProcessed) {
        // console.log('⚠️ Callback already processed, ignoring duplicate');
        return false;
      }
      
      // console.log('📡 Allowing this request to reach backend vnpayReturn() first...');
      
      // Ẩn bất kỳ error page nào có thể xuất hiện
      setProcessingVNPayReturn(true);
      
      try {
        // Parse URL để lấy parameters
        const urlParams = parseUrlParams(url);
        // console.log('VNPAY callback params:', urlParams);
        
        // Mark as processed to prevent duplicates
        setCallbackProcessed(true);
        
        // Delay để cho backend xử lý trước, sau đó handle UI
        timeoutRef.current = setTimeout(() => {
          // console.log('⏰ Now handling mobile UI after backend processed');
          try {
            if (urlParams.vnp_ResponseCode === '00') {
              // console.log('✅ VNPAY payment successful - backend should have created order');
              onSuccess && onSuccess(urlParams);
            } else {
              // console.log('❌ VNPAY payment failed');
              onError && onError(urlParams);
            }
          } catch (callbackError) {
            // console.error('❌ Error in VNPAY callback handler:', callbackError);  
            onError && onError(urlParams);
          }
        }, 2000); // Delay 2 giây để backend xử lý
        
      } catch (parseError) {
        // console.error('❌ Error parsing VNPAY URL params:', parseError);  
        setCallbackProcessed(true);
        onError && onError({ vnp_ResponseCode: '99', error: 'Parse error' });
        return false;
      }
      
      return true; // Cho phép navigation đến backend
    }
    
    // Block các localhost URLs khác (không phải VNPAY return)
    if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('10.0.2.2')) {
      // console.log('🚫 Blocking non-VNPAY localhost navigation:', url);
      Alert.alert('Hoàn tất', 'Đang xử lý kết quả thanh toán...');
      return false;
    }
    
    return true; // Allow các navigation khác
  };

  // Xử lý khi URL thay đổi
  const handleNavigationStateChange = (navState) => {
    // Kiểm tra navState có tồn tại và có url property không
    if (!navState || !navState.url) {
      console.warn('Navigation state is missing or has no url property:', navState);
      return;
    }
    
    const { url, loading } = navState;
    // console.log('=== VNPAY WEBVIEW NAVIGATION ===');
    // console.log('Current URL:', url);
    // console.log('Loading:', loading);
    // console.log('Can go back:', navState.canGoBack);
    
    setCanGoBack(navState.canGoBack || false);

    // Skip xử lý nếu đây là VNPAY return URL - đã được xử lý trong handleShouldStartLoad
    if ((url.includes('localhost') || url.includes('127.0.0.1') || url.includes('10.0.2.2')) && 
        url.includes('payment/vnpay/return') && 
        url.includes('vnp_ResponseCode=')) {
      // console.log('🔄 VNPAY return URL - already handled in handleShouldStartLoad, skipping duplicate processing');
      return;
    }

    // Kiểm tra return URL scheme (backup cho deep links)
    if (url.includes(returnUrl) || url.includes('vnpay-return')) {
      // console.log('Detected VNPAY return URL scheme (deep link)');
      
      // Prevent duplicate processing
      if (callbackProcessed) {
        // console.log('⚠️ Deep link callback already processed, ignoring duplicate');
        return;
      }
      
      // Ẩn bất kỳ error page nào có thể xuất hiện
      setProcessingVNPayReturn(true);
      
      try {
        const urlParams = parseUrlParams(url);
        //
        
        if (urlParams.vnp_ResponseCode) {
          setCallbackProcessed(true);
          // console.log('VNPAY response code:', urlParams.vnp_ResponseCode);
          
          if (urlParams.vnp_ResponseCode === '00') {
            // console.log('VNPAY payment successful via deep link');
            onSuccess && onSuccess(urlParams);
          } else {
            // console.log('VNPAY payment failed via deep link');
            onError && onError(urlParams);
          }
        }
      } catch (error) {
        // console.error('Error handling deep link callback:', error);  
        setCallbackProcessed(true);
        onError && onError({ vnp_ResponseCode: '99', error: 'Deep link parse error' });
      }
    }
  };

  // Parse URL parameters
  const parseUrlParams = (url) => {
    const params = {};
    
    try {
      const queryString = url.split('?')[1];
      
      if (queryString) {
        queryString.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key && value) {
            try {
              params[decodeURIComponent(key)] = decodeURIComponent(value);
            } catch (decodeError) {
              console.warn('Failed to decode URL param:', key, value);
              params[key] = value; // Fallback to raw value
            }
          }
        });
      }
    } catch (error) {
      // console.error('Error parsing URL params:', error);  
    }
    
    return params;
  };

  // Xử lý khi load trang xong
  const handleLoadEnd = () => {
    setLoading(false);
  };

  // Xử lý khi có lỗi
  const handleError = (syntheticEvent) => {
    // Kiểm tra syntheticEvent có tồn tại và có nativeEvent property không
    if (!syntheticEvent || !syntheticEvent.nativeEvent) {
      console.warn('Synthetic event is missing or has no nativeEvent property:', syntheticEvent);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải trang thanh toán.');
      return;
    }
    
    const { nativeEvent } = syntheticEvent;
    // console.error('=== VNPAY WEBVIEW ERROR ===');
    // console.error('Error details:', nativeEvent);
    // console.error('Payment URL:', paymentUrl);
    // console.error('Error code:', nativeEvent.code);
    // console.error('Error domain:', nativeEvent.domain); 
    // console.error('Error description:', nativeEvent.description);
    // console.error('Error URL:', nativeEvent.url);
    
    // Special handling for localhost connection refused (VNPAY return URL)
    if (nativeEvent.code === -6 && 
        nativeEvent.description === 'net::ERR_CONNECTION_REFUSED' &&
        nativeEvent.url &&
        (nativeEvent.url.includes('localhost') || nativeEvent.url.includes('127.0.0.1')) &&
        nativeEvent.url.includes('vnp_ResponseCode=')) {
      
      // console.log('🎯 VNPAY return URL connection refused - extracting callback params');
      // console.log('This is expected behavior - mobile cannot access localhost backend');
      
      // Ẩn error page và hiển thị loading
      setProcessingVNPayReturn(true);
      
      try {
        const urlParams = parseUrlParams(nativeEvent.url);
        // console.log('Extracted VNPAY params from failed URL:', urlParams);
        
        if (urlParams.vnp_ResponseCode) {
          // Mark as processed to prevent duplicates
          setCallbackProcessed(true);
          
          // Delay một chút để user không thấy error page
          setTimeout(() => {
            if (urlParams.vnp_ResponseCode === '00') {
              //  console.log('✅ VNPAY payment successful (extracted from failed connection)');
              onSuccess && onSuccess(urlParams);
            } else {
              // console.log('❌ VNPAY payment failed (extracted from failed connection)');
              onError && onError(urlParams);
            }
          }, 1000);
          return;
        }
      } catch (parseError) {
        // console.error('Failed to parse VNPAY params from error URL:', parseError);  
      }
    }
    
    let errorMessage = 'Không thể tải trang thanh toán.';
    
    // Handle specific error codes
    if (nativeEvent.code === -1009) {
      errorMessage = 'Không có kết nối Internet. Vui lòng kiểm tra kết nối mạng.';
    } else if (nativeEvent.code === -1001) {
      errorMessage = 'Kết nối quá chậm. Vui lòng thử lại.';
    } else if (nativeEvent.description) {
      errorMessage += `\nChi tiết: ${nativeEvent.description}`;
    }
    
    if (paymentUrl && !paymentUrl.startsWith('http')) {
      errorMessage += '\nURL thanh toán không hợp lệ.';
    }
    
    Alert.alert(
      'Lỗi tải trang thanh toán',
      errorMessage,
      [
        { text: 'Thử lại', onPress: () => webViewRef.current?.reload() },
        { text: 'Đóng', onPress: onClose }
      ]
    );
  };

  // Xử lý nút back
  const handleGoBack = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    } else {
      Alert.alert(
        'Xác nhận',
        'Bạn có muốn hủy giao dịch không?',
        [
          { text: 'Tiếp tục', style: 'cancel' },
          { text: 'Hủy giao dịch', onPress: onClose }
        ]
      );
    }
  };

  // Validate payment URL
  if (!paymentUrl || !paymentUrl.startsWith('http')) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lỗi thanh toán</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>URL thanh toán không hợp lệ</Text>
          <Text style={styles.errorSubtitle}>Vui lòng thử lại hoặc liên hệ hỗ trợ</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onClose}>
            <Text style={styles.retryButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán VNPAY</Text>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          scalesPageToFit={true}
          bounces={false}
          scrollEnabled={true}
        />
        
        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
          </View>
        )}
        
        {/* VNPAY Processing Overlay */}
        {processingVNPayReturn && (
          <View style={styles.vnpayProcessingOverlay}>
            <View style={styles.vnpayProcessingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.vnpayProcessingText}>Đang xử lý kết quả thanh toán...</Text>
              <Text style={styles.vnpayProcessingSubText}>Vui lòng đợi trong giây lát</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  vnpayProcessingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  vnpayProcessingContainer: {
    backgroundColor: colors.white,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: 280,
  },
  vnpayProcessingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  vnpayProcessingSubText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default VNPayWebView; 