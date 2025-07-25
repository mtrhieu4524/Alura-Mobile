import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants';
import Toast from 'react-native-toast-message';

export default function CartScreen() {
  const navigation = useNavigation();
  const { cart, removeFromCart, updateQuantity, fetchCartFromAPI, loading } = useCart();
  const { isLoggedIn } = useAuth();

  // Fetch cart from API when screen mounts (if user is logged in)
  useEffect(() => {
    const loadCartFromAPI = async () => {
      if (isLoggedIn) {
        const result = await fetchCartFromAPI();
        if (!result.success && result.message !== 'No authentication token') {
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: result.message || 'Không thể tải giỏ hàng',
          });
        }
      }
    };

    loadCartFromAPI();
  }, [isLoggedIn]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Handle quantity update with loading
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      
      console.error('Error updating quantity:', error);
    }
  };

  // Handle remove item with loading
  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Handle both URL images (from API) and local assets
  const getImageSource = (product) => {
    console.log('getImageSource called with:', product.image);
    
    if (product.image) {
      // If it's a string (URL), use { uri: ... }
      if (typeof product.image === 'string') {
        console.log('Using image URL:', product.image);
        return { uri: product.image };
      }
      // If it's a local asset (require()), use directly
      return product.image;
    }
    
    // Fallback to a placeholder if no image
    console.log('No image found, using placeholder');
    return require('../../assets/product1.png'); // Default placeholder
  };

  // Handle checkout with authentication check
  const handleCheckout = () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để tiếp tục thanh toán',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Đăng nhập',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
      return;
    }
    navigation.navigate('Checkout');
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty cart state
  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Cart is empty</Text>
          <Text style={styles.emptySubtitle}>Please add products to your cart to continue shopping</Text>
          <TouchableOpacity 
            style={styles.continueShoppingBtn}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.continueShoppingText}>Continue shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
      </View>
      
      {/* Cart List */}
      <FlatList
        data={cart}
        keyExtractor={item => item.id}
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          // Debug log for each cart item
          console.log('Rendering cart item:', {
            id: item.id,
            name: item.name,
            price: item.price,
            volume: item.volume,
            image: item.image,
            brand: item.brand
          });
          
          return (
            <View style={styles.cartItem}>
              <Image 
                source={getImageSource(item)} 
                style={styles.itemImage} 
                defaultSource={require('../../assets/product1.png')}
                onError={(error) => {
                  console.log('Error loading cart image for:', item.name, 'Image URL:', item.image, 'Error:', error.nativeEvent.error);
                }}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemName}>{item.name || 'Sản phẩm không tên'}</Text>
                {item.brand && item.brand !== 'Unknown Brand' && (
                  <Text style={styles.itemBrand}>{item.brand}</Text>
                )}
                {item.productType && item.productType !== 'Unknown Type' && (
                  <Text style={styles.itemType}>Type: {item.productType}</Text>
                )}
                {item.volume && <Text style={styles.itemVolume}>Volume: {item.volume}</Text>}
                <Text style={styles.itemPrice}>{(item.price || 0).toLocaleString('vi-VN')} VND</Text>
              </View>
              <View style={styles.qtyBox}>
                <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>
                  <Ionicons name="remove" size={18} color="#888" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity || 1}</Text>
                <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
                  <Ionicons name="add" size={18} color="#888" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{subtotal.toLocaleString('vi-VN')} VND</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotal}>Total</Text>
              <Text style={styles.summaryTotalValue}>{subtotal.toLocaleString('vi-VN')} VND</Text>
            </View>
          </View>
        }
      />
      
      {/* Checkout Button - Fixed at bottom */}
      <View style={styles.checkoutBar}>
        <Text style={styles.checkoutPrice}>{subtotal.toLocaleString('vi-VN')} VND</Text>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20, // Extra space before checkout bar
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f2f2f2',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  itemBrand: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
  },
  itemType: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
  },
  itemVolume: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
  },
  itemPrice: {
    color: colors.accent,
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    fontWeight: 'bold',
    fontSize: 15,
    marginHorizontal: 8,
    color: '#222',
  },
  deleteBtn: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 8,
  },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  summaryTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#222',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  checkoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 100, // Space for floating tab bar
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  checkoutPrice: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  checkoutBtn: {
    backgroundColor: colors.buttonPrimary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 15,
    marginBottom: 20,
  },
  continueShoppingBtn: {
    backgroundColor: colors.buttonPrimary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 15,
    marginTop: 10,
  },
}); 