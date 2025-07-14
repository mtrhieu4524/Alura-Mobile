import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, dimensions } from '../constants';
import orderService from '../services/orderService';
import Toast from 'react-native-toast-message';

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return '#FF9800';
    case 'Processing': return colors.accent;
    case 'Shipped': return '#2196F3';
    case 'Delivered': return '#4CAF50';
    case 'Success': return '#4CAF50';
    case 'Paid': return '#4CAF50';
    case 'Cancelled': return '#f44336';
    default: return colors.textSecondary;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Pending': return 'hourglass';
    case 'Processing': return 'time';
    case 'Shipped': return 'car';
    case 'Delivered': return 'checkmark-circle';
    case 'Success': return 'checkmark-done-circle';
    case 'Paid': return 'checkmark-done-circle';
    case 'Cancelled': return 'close-circle';
    default: return 'help-circle';
  }
};

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { order: initialOrder } = route.params;
  
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch order detail from API
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.getOrderDetail(initialOrder.orderId);

      if (response.success) {
        setOrder(response.order);
        console.log('Order detail loaded:', response.order);
      } else {
        setError(response.message);
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: response.message || 'Không thể tải chi tiết đơn hàng',
        });
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Load order detail on mount
  useEffect(() => {
    if (initialOrder.orderId) {
      fetchOrderDetail();
    }
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + ' VND';
  };

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

  // Handle cancel order
  const handleCancelOrder = () => {
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
              // Update order status locally
              setOrder(prev => ({ ...prev, status: 'Cancelled' }));
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

  const StatusTracker = () => {
    console.log('=== ORDER STATUS DEBUG ===');
    console.log('initialOrder from history:', initialOrder.status);
    console.log('order from API:', order.status);
    
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Success'];
    let currentIndex = -1;
    
    // Use status from order history (initialOrder), not from API response
    const statusFromHistory = initialOrder.status;
    console.log('Using status from order history:', statusFromHistory);
    
    // Map API status to our flow position
    switch (statusFromHistory) {
      case 'Pending':
        currentIndex = 0;
        break;
      case 'Processing':
        currentIndex = 1;
        break;
      case 'Shipped':
        currentIndex = 2;
        break;
      case 'Delivered':
        currentIndex = 3;
        break;
      case 'Success':
        currentIndex = 4;
        break;
      case 'Paid':
        currentIndex = 4; // Treat as completed
        break;
      default:
        console.log('Unknown status:', statusFromHistory, 'defaulting to Pending');
        currentIndex = 0;
    }
    
    console.log('Final mapped index:', currentIndex, 'which is status:', statuses[currentIndex]);
    console.log('=== END DEBUG ===');
    
    if (statusFromHistory === 'Cancelled') {
      return (
        <View style={styles.statusTracker}>
          <View style={styles.statusItem}>
            <View style={[styles.statusIcon, { backgroundColor: '#f44336' }]}>
              <Ionicons name="close" size={20} color="white" />
            </View>
            <Text style={[styles.statusText, { color: '#f44336' }]}>Cancelled</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.statusTracker}>
        {statuses.map((status, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const statusColor = getStatusColor(status);
          
          return (
            <View key={status} style={styles.statusItem}>
              <View style={[
                styles.statusIcon,
                {
                  backgroundColor: isActive ? statusColor : '#E0E0E0',
                  borderWidth: isCurrent ? 2 : 0,
                  borderColor: isCurrent ? statusColor : 'transparent',
                }
              ]}>
                <Ionicons 
                  name={getStatusIcon(status)} 
                  size={20} 
                  color={isActive ? 'white' : '#9E9E9E'} 
                />
              </View>
              <Text style={[
                styles.statusText,
                { 
                  color: isActive ? statusColor : '#9E9E9E',
                  fontWeight: isCurrent ? 'bold' : 'normal'
                }
              ]}>
                {status}
              </Text>
              {index < statuses.length - 1 && (
                <View style={[
                  styles.statusLine,
                  { backgroundColor: index < currentIndex ? statusColor : '#E0E0E0' }
                ]} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ backgroundColor: colors.background }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
            <View style={{ width: 26 }} />
          </View>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
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
            <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
            <View style={{ width: 26 }} />
          </View>
        </SafeAreaView>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>Không thể tải dữ liệu</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchOrderDetail}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <View style={{ width: 26 }} />
        </View>
      </SafeAreaView>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <StatusTracker />
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order ID</Text>
              <Text style={styles.infoValue}>{order.orderNumber || order.orderId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(order.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                <Ionicons 
                  name={getStatusIcon(order.status)} 
                  size={16} 
                  color={getStatusColor(order.status)} 
                />
                <Text style={[styles.statusBadgeText, { color: getStatusColor(order.status) }]}>
                  {order.status}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total</Text>
              <Text style={[styles.infoValue, styles.totalAmount]}>{formatPrice(order.totalPrice)}</Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <Image 
                source={getImageSource(item)} 
                style={styles.itemImage} 
                defaultSource={require('../../assets/product1.png')}
              />
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name} x {item.quantity}</Text>
                  <TouchableOpacity style={styles.viewLink}>
                    <Text style={styles.viewLinkText}>VIEW</Text>
                  </TouchableOpacity>
                </View>
                
                {item.type && (
                  <Text style={styles.itemAttribute}>Type: {item.type}</Text>
                )}
                {item.skinType && (
                  <Text style={styles.itemAttribute}>Skin Type: {item.skinType}</Text>
                )}
                {item.volume && (
                  <Text style={styles.itemAttribute}>Volume: {item.volume}</Text>
                )}
                {item.brand && (
                  <Text style={styles.itemAttribute}>Brand: {item.brand}</Text>
                )}
              </View>
              <View style={styles.itemPricing}>
                <Text style={styles.itemTotal}>{(item.lineTotal || item.price * item.quantity).toLocaleString('vi-VN')} VND</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.infoCard}>
            {/* Customer Name */}
            <View style={styles.infoRow}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.infoLabel}>Customer Name:</Text>
              </View>
              <Text style={styles.infoValue}>{order.customerInfo?.name || 'N/A'}</Text>
            </View>
            
            {/* Phone Number */}
            <View style={styles.infoRow}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.infoLabel}>Phone Number:</Text>
              </View>
              <Text style={styles.infoValue}>{order.customerInfo?.phone || 'N/A'}</Text>
            </View>
            
            {/* Payment Method */}
            <View style={styles.infoRow}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="card-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.infoLabel}>Payment Method:</Text>
              </View>
              <Text style={styles.infoValue}>
                {order.paymentMethod === 'VNPAY' || order.paymentMethod === 'vnpay' || order.paymentMethod === 'VNPay' ? 'VNPAY' : 'Cash on Delivery'}
              </Text>
            </View>
            
            {/* Shipping */}
            <View style={styles.infoRow}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="car-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.infoLabel}>Shipping ({order.shippingMethod || 'STANDARD'}):</Text>
              </View>
              <Text style={styles.infoValue}>{(order.shippingFee || 0).toLocaleString('vi-VN')} VND</Text>
            </View>

            {/* Address */}
            <View style={styles.infoRow}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.infoLabel}>Address:</Text>
              </View>
              <Text style={[styles.infoValue, styles.addressText]}>{order.customerInfo?.address || 'N/A'}</Text>
            </View>

            {/* Note */}
            {order.note && (
              <View style={styles.infoRow}>
                <View style={styles.infoLabelRow}>
                  <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.infoLabel}>Note:</Text>
                </View>
                <Text style={[styles.infoValue, styles.noteText]}>{order.note}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Footer */}
        <View style={styles.section}>
          <View style={styles.orderFooter}>
            <Text style={styles.orderDate}>
              Order date: {formatDate(order.date)}
            </Text>
            <Text style={styles.orderTotalPrice}>
              Total price: {formatPrice(order.totalPrice)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {order.status !== 'Cancelled' && order.status !== 'Success' && order.status !== 'Delivered' && order.status !== 'Shipped' && (
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.cancelOrderButton} onPress={handleCancelOrder}>
              <Text style={styles.cancelOrderButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        )}

        {order.status === 'Success' && (
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.reorderButton} onPress={() => navigation.navigate('Shop')}>
              <Text style={styles.reorderButtonText}>Shop Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Contact Support */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.accent} />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
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
  section: {
    marginBottom: dimensions.spacing.large,
    paddingHorizontal: dimensions.spacing.medium,
  },
  sectionTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: dimensions.spacing.medium,
  },
  statusTracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: dimensions.spacing.medium,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: dimensions.spacing.small,
  },
  statusText: {
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  statusLine: {
    position: 'absolute',
    top: 20,
    right: -50,
    width: 50,
    height: 2,
    zIndex: -1,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: dimensions.borderRadius.large,
    padding: dimensions.spacing.medium,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.small,
  },
  infoLabel: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: typography.sizes.medium,
    color: colors.text,
    fontWeight: typography.weights.medium,
    flex: 2,
    textAlign: 'right',
  },
  totalAmount: {
    color: colors.accent,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.large,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.small,
    paddingVertical: 4,
    borderRadius: dimensions.borderRadius.medium,
  },
  statusBadgeText: {
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
    marginLeft: 4,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: dimensions.borderRadius.large,
    padding: dimensions.spacing.medium,
    marginBottom: dimensions.spacing.small,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: dimensions.borderRadius.medium,
    marginRight: dimensions.spacing.medium,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    color: colors.text,
    flex: 1,
  },
  viewLink: {
    paddingHorizontal: dimensions.spacing.small,
    paddingVertical: 4,
    backgroundColor: colors.accent,
    borderRadius: dimensions.borderRadius.small,
  },
  viewLinkText: {
    color: colors.white,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
  },
  itemAttribute: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    color: colors.accent,
  },
  infoRow: {
    flexDirection: 'column',
    marginBottom: dimensions.spacing.medium,
    paddingHorizontal: dimensions.spacing.small,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.spacing.small,
  },
  infoLabel: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    marginLeft: dimensions.spacing.small,
    fontWeight: typography.weights.medium,
  },
  infoValue: {
    fontSize: typography.sizes.medium,
    color: colors.text,
    fontWeight: typography.weights.medium,
    marginLeft: 24, // Align with label text (icon size + margin)
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: dimensions.spacing.medium,
    paddingHorizontal: dimensions.spacing.medium,
    backgroundColor: colors.white,
    borderRadius: dimensions.borderRadius.medium,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  orderDate: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
  },
  orderTotalPrice: {
    fontSize: typography.sizes.medium,
    color: colors.accent,
    fontWeight: typography.weights.bold,
  },
  actionSection: {
    paddingHorizontal: dimensions.spacing.medium,
    paddingBottom: dimensions.spacing.medium,
  },
  cancelOrderButton: {
    backgroundColor: 'black',
    paddingVertical: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
    marginBottom: dimensions.spacing.medium,
  },
  cancelOrderButtonText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  reorderButton: {
    backgroundColor: colors.accent,
    paddingVertical: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
    marginBottom: dimensions.spacing.medium,
  },
  reorderButtonText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  contactButtonText: {
    color: colors.accent,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.medium,
    marginLeft: dimensions.spacing.small,
  },
  addressText: {
    flex: 1,
  },
  noteText: {
    flex: 1,
  },
}); 