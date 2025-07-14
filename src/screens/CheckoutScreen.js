import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants';
import orderService from '../services/orderService';
import Toast from 'react-native-toast-message';

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
  const { cart, fetchCartFromAPI } = useCart();
  const { isLoggedIn } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [payment, setPayment] = useState('vnpay');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedShipping = shippingMethods.find(method => method.key === shippingMethod);
  const shipping = selectedShipping ? selectedShipping.fee : 30000;
  const total = subtotal + shipping;

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

      // Prepare order data
      const orderData = {
        customerInfo: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        paymentMethod: payment,
        shippingMethod: shippingMethod.toUpperCase(), // STANDARD or EXPRESS
        note: note.trim(),
        shippingFee: shipping,
        totalAmount: total,
      };

      console.log('Creating order with data:', orderData);

      // Create order via API
      const response = await orderService.createOrder(orderData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Đặt hàng thành công!',
          text2: 'Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ bạn sớm nhất.',
        });

        // Clear cart from API after successful order
        await fetchCartFromAPI();

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
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      } else {
        Alert.alert('Đặt hàng thất bại', response.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Lỗi', 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
    } finally {
      setLoading(false);
    }
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
              editable={!loading}
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
                  editable={!loading}
                />
              </View>
            </View>
            <Text style={styles.sectionTitle}>Address *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Address" 
              value={address} 
              onChangeText={setAddress}
              editable={!loading}
            />
            <Text style={styles.sectionTitle}>Note (optional)</Text>
            <TextInput 
              style={[styles.input, { minHeight: 60 }]} 
              placeholder="Enter note for shop" 
              value={note} 
              onChangeText={setNote} 
              multiline
              editable={!loading}
            />
            {/* Phương thức thanh toán */}
            <Text style={styles.sectionTitle}>Payment method</Text>
            <View style={styles.paymentGroup}>
              {paymentMethods.map(m => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.paymentOption, payment === m.key && styles.paymentOptionActive]}
                  onPress={() => !loading && setPayment(m.key)}
                  disabled={loading}
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
                  onPress={() => !loading && setShippingMethod(m.key)}
                  disabled={loading}
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
                console.log('Error loading checkout image for:', item.name);
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
              style={[styles.orderBtn, loading && styles.orderBtnDisabled]} 
              onPress={handleOrder}
              disabled={loading}
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