import AsyncStorage from '@react-native-async-storage/async-storage';
import orderService from '../services/orderService';

// Utility để xử lý retry VNPAY callbacks đã fail
export class VNPayRetryService {
  
  // Kiểm tra có pending callback không
  static async hasPendingCallback() {
    try {
      const pendingCallback = await AsyncStorage.getItem('pending_vnpay_callback');
      return pendingCallback !== null;
    } catch (error) {
      // console.log('Error checking pending callback:', error);
      return false;
    }
  }

  // Lấy pending callback
  static async getPendingCallback() {
    try {
      const pendingCallback = await AsyncStorage.getItem('pending_vnpay_callback');
      return pendingCallback ? JSON.parse(pendingCallback) : null;
    } catch (error) {
      // console.log('Error getting pending callback:', error);
      return null;
    }
  }

  // Retry pending callback
  static async retryPendingCallback() {
    try {
      const pendingCallback = await this.getPendingCallback();
      if (!pendingCallback) {
        return { success: false, message: 'No pending callback found' };
      }

      // console.log('🔄 Retrying pending VNPAY callback:', pendingCallback);

      // Chỉ dùng Android emulator backend
      const alternativeBackends = [
        'http://10.0.2.2:4000/api/', // Chỉ URL này hoạt động với React Native
      ];

      // Thử với orderService trước
      try {
        const result = await orderService.processVNPayCallback(pendingCallback);
        if (result.success) {
          await this.clearPendingCallback();
          return { success: true, message: 'Callback processed successfully' };
        }
      } catch (error) {
        // console.log('OrderService failed, trying alternatives...');
      }

      // Thử với alternative backends
      for (const baseUrl of alternativeBackends) {
        try {
          // console.log(`🧪 Trying alternative backend: ${baseUrl}`);
          
          const fullUrl = `${baseUrl}payment/vnpay/return`;
          const queryParams = new URLSearchParams(pendingCallback).toString();
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
            await this.clearPendingCallback();
            return { success: true, message: 'Callback processed via alternative backend' };
          }
        } catch (error) {
          // console.log(`❌ Alternative backend ${baseUrl} failed:`, error.message);
        }
      }

      return { success: false, message: 'All backends failed' };
    } catch (error) {
      // console.log('Error retrying pending callback:', error);
      return { success: false, message: error.message };
    }
  }

  // Xóa pending callback
  static async clearPendingCallback() {
    try {
      await AsyncStorage.removeItem('pending_vnpay_callback');
      // console.log('✅ Pending callback cleared');
    } catch (error) {
      // console.log('Error clearing pending callback:', error);
    }
  }

  // Lấy thông tin về pending callback để hiển thị
  static async getPendingCallbackInfo() {
    try {
      const callback = await this.getPendingCallback();
      if (!callback) return null;

      return {
        transactionRef: callback.vnp_TxnRef,
        amount: parseInt(callback.vnp_Amount) / 100, // Convert từ VND cent về VND
        payDate: callback.vnp_PayDate,
        responseCode: callback.vnp_ResponseCode,
        isSuccessful: callback.vnp_ResponseCode === '00'
      };
    } catch (error) {
      // console.log('Error getting pending callback info:', error);
      return null;
    }
  }
} 