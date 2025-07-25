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
  const [paymentStartTime, setPaymentStartTime] = useState(Date.now());
  const webViewRef = useRef(null);
  const timeoutRef = useRef(null);
  const paymentTimeoutRef = useRef(null);

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
      if (paymentTimeoutRef.current) {
        clearTimeout(paymentTimeoutRef.current);
        paymentTimeoutRef.current = null;
      }
    };
  }, []);

  // Set payment timeout (5 minutes)
  useEffect(() => {
    // Start polling after 2 minutes to check payment status
    const pollTimeoutId = setTimeout(() => {
      if (!callbackProcessed) {
        console.log('📊 Starting payment status polling...');
        // You could implement a polling mechanism here to check payment status
        // For now, we'll just show a helpful message
      }
    }, 120000); // 2 minutes

    paymentTimeoutRef.current = setTimeout(() => {
      if (!callbackProcessed) {
        console.log('⏰ Payment timeout reached - showing options to user');
        Alert.alert(
          'Thời gian thanh toán quá lâu',
          'Bạn có đang gặp khó khăn với thanh toán không? Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.',
          [
            { 
              text: 'Tiếp tục chờ', 
              style: 'cancel'
            },
            { 
              text: 'Hủy thanh toán', 
              onPress: () => {
                console.log('User manually cancelled payment due to timeout');
                onError && onError({ vnp_ResponseCode: '24', reason: 'User cancelled due to timeout' });
              }
            },
          ]
        );
      }
    }, 300000); // 5 minutes

    return () => {
      if (paymentTimeoutRef.current) {
        clearTimeout(paymentTimeoutRef.current);
      }
      if (pollTimeoutId) {
        clearTimeout(pollTimeoutId);
      }
    };
  }, [callbackProcessed, onError]);

  // Kiểm tra có nên load URL không (để block localhost)
  const handleShouldStartLoad = (request) => {
    // Kiểm tra request có tồn tại và có url property không
    if (!request || !request.url) {
      console.warn('Request object is missing or has no url property:', request);
      return true; // Cho phép load nếu không có thông tin
    }
    
    const { url } = request;
    console.log('=== SHOULD START LOAD ===');
    console.log('Request URL:', url);
    
    // Special handling for VNPAY sandbox URLs
    if (url.includes('vnpayment.vn')) {
      // Always allow VNPAY domain
      return true;
    }
    
    // Kiểm tra nếu là VNPAY return URL với callback parameters
    if ((url.includes('localhost') || url.includes('127.0.0.1') || url.includes('10.0.2.2')) && 
        url.includes('vnp_ResponseCode=')) {
      
      console.log('🎯 Detected VNPAY return URL with callback params');
      
      // Prevent duplicate processing
      if (callbackProcessed) {
        console.log('⚠️ Callback already processed, ignoring duplicate');
        return false;
      }
      
      // Extract params from localhost URL
      try {
        const urlParams = parseUrlParams(url);
        console.log('VNPAY callback params from localhost URL:', urlParams);
        
        if (urlParams.vnp_ResponseCode) {
          setCallbackProcessed(true);
          setProcessingVNPayReturn(true);
          
          // Immediate callback
          if (urlParams.vnp_ResponseCode === '00') {
            console.log('✅ VNPAY payment successful - triggering success');
            onSuccess && onSuccess(urlParams);
          } else {
            console.log('❌ VNPAY payment failed');
            onError && onError(urlParams);
          }
          
          // Block navigation to localhost
          return false;
        }
      } catch (parseError) {
        console.error('❌ Error parsing VNPAY URL params:', parseError);
      }
      
      // Block localhost navigation
      return false;
    }
    
    // Block các localhost URLs khác (không phải VNPAY return)
    if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('10.0.2.2')) {
      console.log('🚫 Blocking non-VNPAY localhost navigation:', url);
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
    console.log('=== VNPAY WEBVIEW NAVIGATION ===');
    console.log('Current URL:', url);
    console.log('Loading:', loading);
    console.log('Can go back:', navState.canGoBack);
    
    setCanGoBack(navState.canGoBack || false);

    // IMPORTANT: Don't auto-detect success to allow user to complete payment with PIN
    // Only check for clear success/failure indicators
    
    // Check for explicit VNPAY error
    if (url.includes('vnp_ResponseCode=') && !url.includes('vnp_ResponseCode=00')) {
      console.log('❌ Detected failed payment in URL');
      const urlParams = parseUrlParams(url);
      if (urlParams.vnp_ResponseCode && urlParams.vnp_ResponseCode !== '00') {
        setCallbackProcessed(true);
        onError && onError(urlParams);
        return;
      }
    }

    // Don't auto-trigger on Confirm page - let user complete payment first
    if (url.includes('vnpayment.vn') && url.includes('Confirm.html')) {
      console.log('🎯 User reached VNPAY Confirm page - waiting for user to complete payment');
      // Don't auto-trigger success - user needs to enter PIN first
    }

    // Skip xử lý nếu đây là VNPAY return URL - đã được xử lý trong handleShouldStartLoad
    if ((url.includes('localhost') || url.includes('127.0.0.1') || url.includes('10.0.2.2')) && 
        url.includes('payment/vnpay/return') && 
        url.includes('vnp_ResponseCode=')) {
      console.log('🔄 VNPAY return URL - already handled in handleShouldStartLoad, skipping duplicate processing');
      return;
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

  // Handle close button with confirmation
  const handleClose = () => {
    Alert.alert(
      'Hủy thanh toán',
      'Bạn có chắc muốn hủy thanh toán không? Giao dịch sẽ không được hoàn thành.',
      [
        { text: 'Tiếp tục thanh toán', style: 'cancel' },
        { 
          text: 'Kiểm tra trạng thái', 
          onPress: () => {
            // Simulate checking payment status
            Alert.alert(
              'Kiểm tra trạng thái',
              'Nếu bạn đã hoàn thành thanh toán nhưng chưa thấy kết quả, vui lòng chờ thêm vài giây hoặc liên hệ hỗ trợ.',
              [
                { text: 'Chờ thêm', style: 'cancel' },
                { text: 'Hủy giao dịch', onPress: onClose }
              ]
            );
          }
        },
        { text: 'Hủy giao dịch', style: 'destructive', onPress: onClose }
      ]
    );
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
          onPress={handleClose}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Help Button - Always visible */}
      <TouchableOpacity 
        style={styles.helpButton}
        onPress={() => {
          Alert.alert(
            'Hướng dẫn thanh toán VNPAY',
            '1. Chọn ngân hàng\n2. Nhập thông tin thẻ\n3. Nhập mã OTP/PIN\n4. Xác nhận thanh toán\n\nNếu đã hoàn thành thanh toán nhưng không tự động chuyển, vui lòng bấm "Kiểm tra kết quả".',
            [
              { text: 'Đóng', style: 'cancel' },
              { 
                text: 'Kiểm tra kết quả', 
                onPress: () => {
                  setProcessingVNPayReturn(true);
                }
              }
            ]
          );
        }}
      >
        <Ionicons name="help-circle-outline" size={24} color={colors.text} />
        <Text style={styles.helpButtonText}>Hướng dẫn</Text>
      </TouchableOpacity>

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
              <Text style={styles.vnpayProcessingSubText}>
                {callbackProcessed ? 'Đang hoàn tất...' : 'Nếu bạn đã thanh toán xong, vui lòng xác nhận bên dưới'}
              </Text>
              
              {/* Manual verification option - show immediately */}
              {!callbackProcessed && (
                <TouchableOpacity 
                  style={styles.manualVerifyButton}
                  onPress={() => {
                    Alert.alert(
                      'Xác nhận thanh toán',
                      'Bạn đã hoàn thành thanh toán trên VNPAY thành công?',
                      [
                        { text: 'Chưa hoàn thành', style: 'cancel' },
                        { 
                          text: 'Đã thanh toán thành công', 
                          onPress: () => {
                            console.log('User manually confirmed successful payment');
                            setCallbackProcessed(true);
                            onSuccess && onSuccess({ 
                              vnp_ResponseCode: '00', 
                              source: 'manual_verification',
                              timestamp: Date.now()
                            });
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.manualVerifyText}>Đã thanh toán thành công?</Text>
                </TouchableOpacity>
              )}
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
    width: '90%',
    maxWidth: 320,
  },
  vnpayProcessingText: {
    fontSize: 18,
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
  manualVerifyButton: {
    marginTop: 24,
    backgroundColor: colors.black,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  manualVerifyText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  helpButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpButtonText: {
    color: colors.text,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default VNPayWebView; 