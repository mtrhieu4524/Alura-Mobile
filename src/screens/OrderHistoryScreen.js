import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors, typography, dimensions } from '../constants';
import orderService from '../services/orderService';
import Toast from 'react-native-toast-message';

export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch orders from API
  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
        setError(null);
      }

      const response = await orderService.getOrderHistory({
        pageIndex: 1,
        pageSize: 50,
        sortBy: 'newest'
      });

      if (response.success) {
        setOrders(response.orders);
        console.log('Orders loaded:', response.orders.length);
      } else {
        setError(response.message);
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: response.message || 'Không thể tải lịch sử đơn hàng',
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Lỗi kết nối. Vui lòng thử lại.');
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Lỗi kết nối. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh orders
  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(false);
  };

  // Initial load
  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
    }
  }, [isLoggedIn]);

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
            <View style={{ width: 26 }} />
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
            <View style={{ width: 26 }} />
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
            <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
            <View style={{ width: 26 }} />
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
          <Text style={styles.viewButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
        
        {(item.status === 'Pending' || item.status === 'Processing') && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => handleCancelOrder(item)}
          >
            <Text style={styles.cancelButtonText}>Hủy đơn</Text>
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
          <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
          <View style={{ width: 26 }} />
        </View>
      </SafeAreaView>
      
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
          <Text style={styles.emptySubtitle}>Bạn chưa có đơn hàng nào</Text>
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