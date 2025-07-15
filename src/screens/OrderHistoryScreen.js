import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors, typography, dimensions } from '../constants';
import orderService from '../services/orderService';
import Toast from 'react-native-toast-message';
import { VNPayRetryService } from '../utils/vnpayRetry';
import { OfflineOrderManager } from '../utils/offlineOrderManager';

export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pendingVNPayCallback, setPendingVNPayCallback] = useState(null);
  const [retryingVNPay, setRetryingVNPay] = useState(false);
  const [offlineOrderStats, setOfflineOrderStats] = useState(null);
  const [processingOfflineOrders, setProcessingOfflineOrders] = useState(false);

  // Fetch orders from API
  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
        setError(null);
      }

      console.log('=== FETCHING ORDERS FROM ORDERHISTORYSCREEN ===');
      const response = await orderService.getOrderHistory({
        pageIndex: 1,
        pageSize: 50,
        sortBy: 'newest'
      });

      console.log('=== ORDER HISTORY SCREEN RESPONSE ===');
      console.log('Response success:', response.success);
      console.log('Response message:', response.message);
      console.log('Orders count:', response.orders?.length || 0);

      if (response.success) {
        setOrders(response.orders);
        console.log('✅ Orders loaded successfully:', response.orders.length);
        
        // Debug: Log order details if any
        if (response.orders.length > 0) {
          console.log('Sample order:', JSON.stringify(response.orders[0], null, 2));
        } else {
          console.log('❌ No orders found - user may not have placed any orders yet');
          console.log('After VNPAY payment, orders should appear here automatically');
        }
      } else {
        setError(response.message);
        console.log('❌ Failed to fetch orders:', response.message);
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: response.message || 'Không thể tải lịch sử đơn hàng',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setError('Lỗi kết nối. Vui lòng thử lại.');
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Lỗi kết nối. Vui lòng thử lại.',
      });
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  // Refresh orders
  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(false);
  };

  // Check for pending VNPAY callback
  const checkPendingVNPayCallback = async () => {
    try {
      const hasPending = await VNPayRetryService.hasPendingCallback();
      if (hasPending) {
        const callbackInfo = await VNPayRetryService.getPendingCallbackInfo();
        setPendingVNPayCallback(callbackInfo);
        console.log('📱 Found pending VNPAY callback:', callbackInfo);
      } else {
        setPendingVNPayCallback(null);
      }
    } catch (error) {
      console.log('Error checking pending VNPAY callback:', error);
    }
  };

  // Retry pending VNPAY callback
  const retryVNPayCallback = async () => {
    if (!pendingVNPayCallback) return;
    
    setRetryingVNPay(true);
    try {
      Toast.show({
        type: 'info',
        text1: 'Đang thử lại...',
        text2: 'Đang xử lý thanh toán VNPAY',
      });

      console.log('🔄 Retrying VNPAY callback from Order History...');
      const result = await VNPayRetryService.retryPendingCallback();
      
      if (result.success) {
        console.log('✅ VNPAY callback retry successful!');
        setPendingVNPayCallback(null);
        
        Toast.show({
          type: 'success',
          text1: 'Thành công!',
          text2: 'Đơn hàng đã được xử lý',
        });

        // Refresh orders để hiển thị đơn hàng mới
        await fetchOrders();
      } else {
        console.log('❌ VNPAY callback retry failed:', result.message);
        Toast.show({
          type: 'error',
          text1: 'Thất bại',
          text2: 'Không thể kết nối đến server',
        });
      }
    } catch (error) {
      console.log('Error retrying VNPAY callback:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Có lỗi xảy ra khi thử lại',
      });
    } finally {
      setRetryingVNPay(false);
    }
  };

  // Clear pending VNPAY callback
  const clearPendingCallback = async () => {
    Alert.alert(
      'Xóa thanh toán đang chờ',
      'Bạn có chắc muốn xóa thông tin thanh toán đang chờ xử lý không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await VNPayRetryService.clearPendingCallback();
            setPendingVNPayCallback(null);
            Toast.show({
              type: 'success',
              text1: 'Đã xóa',
              text2: 'Thông tin thanh toán đã được xóa',
            });
          }
        }
      ]
    );
  };

  // Check offline order stats
  const checkOfflineOrderStats = async () => {
    try {
      const stats = await OfflineOrderManager.getOfflineOrderStats();
      setOfflineOrderStats(stats);
      console.log('📊 Offline order stats:', stats);
    } catch (error) {
      console.log('Error checking offline order stats:', error);
    }
  };

  // Process offline orders
  const processOfflineOrders = async () => {
    if (processingOfflineOrders) return;
    
    setProcessingOfflineOrders(true);
    try {
      Toast.show({
        type: 'info',
        text1: 'Đang xử lý...',
        text2: 'Đang thử tạo các đơn hàng đang chờ',
      });

      console.log('🔄 Processing offline orders from Order History...');
      const result = await OfflineOrderManager.processOfflineOrders();
      
      if (result.processed > 0) {
        console.log(`✅ ${result.processed} offline orders processed successfully!`);
        
        Toast.show({
          type: 'success',
          text1: 'Thành công!',
          text2: `Đã xử lý ${result.processed} đơn hàng`,
        });

        // Refresh orders và stats
        await fetchOrders();
        await checkOfflineOrderStats();
      } else if (result.total === 0) {
        Toast.show({
          type: 'info',
          text1: 'Không có đơn hàng',
          text2: 'Không có đơn hàng nào cần xử lý',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Thất bại',
          text2: 'Không thể kết nối đến server',
        });
      }
    } catch (error) {
      console.log('Error processing offline orders:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Có lỗi xảy ra khi xử lý đơn hàng',
      });
    } finally {
      setProcessingOfflineOrders(false);
    }
  };

  // Clear all offline orders
  const clearOfflineOrders = async () => {
    Alert.alert(
      'Xóa đơn hàng offline',
      'Bạn có chắc muốn xóa tất cả đơn hàng đang chờ xử lý không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await OfflineOrderManager.clearAllOfflineOrders();
            setOfflineOrderStats(null);
            Toast.show({
              type: 'success',
              text1: 'Đã xóa',
              text2: 'Đã xóa tất cả đơn hàng offline',
            });
          }
        }
      ]
    );
  };

  // Fetch orders when component mounts
  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
      checkPendingVNPayCallback(); // Check for pending VNPAY callbacks
      checkOfflineOrderStats(); // Check for offline orders
    } else {
      setLoading(false);
      setOrders([]);
    }
  }, [isLoggedIn]);

  // Auto refresh orders when screen comes into focus (after VNPAY success)
  useFocusEffect(
    React.useCallback(() => {
      if (isLoggedIn) {
        console.log('📱 OrderHistory screen focused - refreshing orders...');
        console.log('This should show VNPAY orders created by backend callback');
        fetchOrders(false); // Refresh without loading indicator
        checkPendingVNPayCallback(); // Check for pending VNPAY callbacks
        checkOfflineOrderStats(); // Check for offline orders
      }
    }, [isLoggedIn])
  );

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ backgroundColor: colors.background }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
            <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
              <Ionicons 
                name="refresh" 
                size={26} 
                color={refreshing ? colors.textSecondary : colors.textPrimary} 
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={styles.notLoggedInContainer}>
          <Ionicons name="person-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.notLoggedInTitle}>Bạn chưa đăng nhập</Text>
          <Text style={styles.notLoggedInSubtitle}>Vui lòng đăng nhập để xem lịch sử đơn hàng</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ backgroundColor: colors.background }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
            <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
              <Ionicons 
                name="refresh" 
                size={26} 
                color={refreshing ? colors.textSecondary : colors.textPrimary} 
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Đang tải lịch sử đơn hàng...</Text>
        </View>
      </View>
    );
  }

  // Error state  
  if (error) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ backgroundColor: colors.background }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order History</Text>
            <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
              <Ionicons 
                name="refresh" 
                size={26} 
                color={refreshing ? colors.textSecondary : colors.textPrimary} 
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>Không thể tải dữ liệu</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchOrders()}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const formatPrice = (price) => price.toLocaleString('vi-VN') + ' VND';
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#FF9800';
      case 'Processing': return colors.accent;
      case 'Shipped': return '#2196F3';
      case 'Delivered': return '#4CAF50';
      case 'Success': return '#4CAF50';
      case 'Cancelled': return '#f44336';
      default: return colors.textSecondary;
    }
  };

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetail', { order });
  };

  // Handle cancel order
  const handleCancelOrder = (order) => {
    if (order.status === 'Cancelled' || order.status === 'Success' || order.status === 'Delivered' || order.status === 'Shipped') {
      return;
    }

    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      [
        {
          text: 'Không',
          style: 'cancel',
        },
        {
          text: 'Hủy đơn hàng',
          style: 'destructive',
          onPress: async () => {
            const response = await orderService.cancelOrder(order.orderId);
            if (response.success) {
              Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đơn hàng đã được hủy',
              });
              fetchOrders(false); // Refresh orders
            } else {
              Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: response.message || 'Không thể hủy đơn hàng',
              });
            }
          },
        },
      ]
    );
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => handleOrderPress(item)}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.orderNumber || item.orderId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
      <Text style={styles.itemCount}>{item.items.length} items</Text>
      <Text style={styles.totalPrice}>{formatPrice(item.totalPrice)}</Text>
      
      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.viewButton} 
          onPress={() => handleOrderPress(item)}
        >
          <Text style={styles.viewButtonText}>View details</Text>
        </TouchableOpacity>
        
        {(item.status === 'Pending' || item.status === 'Processing') && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => handleCancelOrder(item)}
          >
            <Text style={styles.cancelButtonText}>Cancel order</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History</Text>
          <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
            <Ionicons 
              name="refresh" 
              size={26} 
              color={refreshing ? colors.textSecondary : colors.textPrimary} 
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      
      {/* Offline Orders Status */}
      {offlineOrderStats && offlineOrderStats.pending > 0 && (
        <View style={styles.offlineOrdersContainer}>
          <View style={styles.offlineOrdersHeader}>
            <Ionicons name="cloud-offline-outline" size={20} color={colors.warning} />
            <Text style={styles.offlineOrdersTitle}>
              Đơn hàng đang chờ xử lý: {offlineOrderStats.pending}
            </Text>
          </View>
          <Text style={styles.offlineOrdersSubtitle}>
            Một số đơn hàng VNPAY chưa được tạo do mất kết nối
          </Text>
          <View style={styles.offlineOrdersActions}>
            <TouchableOpacity 
              style={[styles.processButton, processingOfflineOrders && styles.disabledButton]}
              onPress={processOfflineOrders}
              disabled={processingOfflineOrders}
            >
              <Ionicons 
                name={processingOfflineOrders ? "refresh" : "cloud-upload-outline"} 
                size={16} 
                color={colors.white} 
              />
              <Text style={styles.processButtonText}>
                {processingOfflineOrders ? 'Đang xử lý...' : 'Thử lại'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearOfflineOrders}
            >
              <Text style={styles.clearButtonText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.orderId}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
          <Text style={styles.emptySubtitle}>
            Bạn chưa có đơn hàng nào.{'\n'}
            Đơn hàng VNPAY sẽ xuất hiện tự động sau khi thanh toán thành công.
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={20} color={colors.white} />
            <Text style={styles.refreshButtonText}>Làm mới</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: dimensions.spacing.large,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: dimensions.spacing.small,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    justifyContent: 'center',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.large,
  },
  notLoggedInTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: dimensions.spacing.medium,
    marginBottom: dimensions.spacing.small,
  },
  notLoggedInSubtitle: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: dimensions.spacing.large,
  },
  loginButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: dimensions.spacing.large,
    paddingVertical: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.large,
  },
  loadingText: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    marginTop: dimensions.spacing.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.large,
  },
  errorTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: dimensions.spacing.medium,
    marginBottom: dimensions.spacing.small,
  },
  errorSubtitle: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: dimensions.spacing.large,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: dimensions.spacing.large,
    paddingVertical: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
  },
  listContainer: {
    padding: dimensions.spacing.medium,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: dimensions.borderRadius.large,
    padding: dimensions.spacing.medium,
    marginBottom: dimensions.spacing.medium,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.small,
  },
  orderId: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: dimensions.spacing.small,
    paddingVertical: 4,
    borderRadius: dimensions.borderRadius.medium,
  },
  statusText: {
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
  },
  orderDate: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  itemCount: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.accent,
    marginBottom: dimensions.spacing.small,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: dimensions.spacing.small,
  },
  viewButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: dimensions.borderRadius.small,
    marginRight: dimensions.spacing.small,
  },
  viewButtonText: {
    color: colors.white,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: dimensions.borderRadius.small,
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.large,
  },
  emptyTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: dimensions.spacing.medium,
    marginBottom: dimensions.spacing.small,
  },
  emptySubtitle: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: dimensions.spacing.large,
    lineHeight: 22,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: dimensions.spacing.large,
    paddingVertical: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.spacing.medium,
  },
  refreshButtonText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.medium,
    marginLeft: dimensions.spacing.small,
  },
  shopButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: dimensions.spacing.large,
    paddingVertical: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
  },
  shopButtonText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
  },
}); 