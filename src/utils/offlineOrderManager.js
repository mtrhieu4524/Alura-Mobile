import AsyncStorage from '@react-native-async-storage/async-storage';
import orderService from '../services/orderService';

export class OfflineOrderManager {
  
  // Lưu đơn hàng VNPAY thành công nhưng backend không kết nối được
  static async saveOfflineVNPayOrder(vnpayParams, orderDetails) {
    try {
      const offlineOrder = {
        id: `offline_${Date.now()}`,
        type: 'vnpay_success',
        timestamp: Date.now(),
        vnpayParams: vnpayParams,
        orderDetails: orderDetails,
        status: 'pending_backend',
        attempts: 0,
        lastAttempt: null
      };

      // Lấy danh sách đơn hàng offline hiện tại
      const existingOrders = await this.getOfflineOrders();
      existingOrders.push(offlineOrder);

      await AsyncStorage.setItem('offline_orders', JSON.stringify(existingOrders));
      console.log('💾 Saved offline VNPAY order:', offlineOrder.id);
      
      return offlineOrder.id;
    } catch (error) {
      console.log('Error saving offline order:', error);
      return null;
    }
  }

  // Lấy danh sách đơn hàng offline
  static async getOfflineOrders() {
    try {
      const ordersJson = await AsyncStorage.getItem('offline_orders');
      return ordersJson ? JSON.parse(ordersJson) : [];
    } catch (error) {
      console.log('Error getting offline orders:', error);
      return [];
    }
  }

  // Thử tạo các đơn hàng offline
  static async processOfflineOrders() {
    try {
      const offlineOrders = await this.getOfflineOrders();
      const pendingOrders = offlineOrders.filter(order => order.status === 'pending_backend');
      
      if (pendingOrders.length === 0) {
        // console.log('📱 No offline orders to process');
        return { processed: 0, failed: 0 };
      }

      // console.log(`🔄 Processing ${pendingOrders.length} offline orders...`);
      
      let processed = 0;
      let failed = 0;

      for (const order of pendingOrders) {
        try {
          // console.log(`📤 Processing offline order: ${order.id}`);
          
          // Cập nhật attempt count
          order.attempts = (order.attempts || 0) + 1;
          order.lastAttempt = Date.now();
          
          if (order.type === 'vnpay_success') {
            // Thử gọi backend để process VNPAY callback
            const result = await orderService.processVNPayCallback(order.vnpayParams);
            
            if (result.success) {
              // console.log(`✅ Offline order ${order.id} processed successfully`);
              order.status = 'completed';
              order.completedAt = Date.now();
              processed++;
            } else {
              // console.log(`❌ Offline order ${order.id} failed:`, result.message);
              
              // Nếu thử quá 5 lần hoặc quá 24h thì đánh dấu expired
              if (order.attempts >= 5 || (Date.now() - order.timestamp) > 24 * 60 * 60 * 1000) {
                order.status = 'expired';
                order.expiredAt = Date.now();
                // console.log(`⏰ Offline order ${order.id} marked as expired`);
              }
              failed++;
            }
          }
        } catch (error) {
          // console.log(`❌ Error processing offline order ${order.id}:`, error.message);
          order.attempts = (order.attempts || 0) + 1;
          order.lastAttempt = Date.now();
          order.lastError = error.message;
          
          // Đánh dấu expired nếu thử quá nhiều lần
          if (order.attempts >= 5) {
            order.status = 'expired';
            order.expiredAt = Date.now();
          }
          failed++;
        }
      }

      // Lưu lại trạng thái cập nhật
      await AsyncStorage.setItem('offline_orders', JSON.stringify(offlineOrders));
      
      // console.log(`📊 Offline orders processing result: ${processed} processed, ${failed} failed`);
      
      return { processed, failed, total: pendingOrders.length };
    } catch (error) {
      // console.log('Error processing offline orders:', error);
      return { processed: 0, failed: 0, total: 0, error: error.message };
    }
  }

  // Lấy thống kê đơn hàng offline
  static async getOfflineOrderStats() {
    try {
      const orders = await this.getOfflineOrders();
      
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending_backend').length,
        completed: orders.filter(o => o.status === 'completed').length,
        expired: orders.filter(o => o.status === 'expired').length,
        lastProcessed: null
      };

      const completedOrders = orders.filter(o => o.status === 'completed');
      if (completedOrders.length > 0) {
        stats.lastProcessed = Math.max(...completedOrders.map(o => o.completedAt));
      }

      return stats;
    } catch (error) {
      // console.log('Error getting offline order stats:', error);
      return { total: 0, pending: 0, completed: 0, expired: 0 };
    }
  }

  // Xóa các đơn hàng cũ (hoàn thành hoặc hết hạn quá 7 ngày)
  static async cleanupOldOrders() {
    try {
      const orders = await this.getOfflineOrders();
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      const activeOrders = orders.filter(order => {
        if (order.status === 'pending_backend') return true; // Giữ pending orders
        
        const checkTime = order.completedAt || order.expiredAt || order.timestamp;
        return checkTime > sevenDaysAgo; // Giữ orders trong vòng 7 ngày
      });

      if (activeOrders.length !== orders.length) {
        await AsyncStorage.setItem('offline_orders', JSON.stringify(activeOrders));
              //
      }

      return orders.length - activeOrders.length;
    } catch (error) {
      // console.log('Error cleaning up old orders:', error);
      return 0;
    }
  }

  // Xóa tất cả đơn hàng offline (debug purpose)
  static async clearAllOfflineOrders() {
    try {
      await AsyncStorage.removeItem('offline_orders');
      //  console.log('🗑️ All offline orders cleared');
    } catch (error) {
      // console.log('Error clearing offline orders:', error);
    }
  }
} 