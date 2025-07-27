import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, SafeAreaView, Alert, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants';
import Toast from 'react-native-toast-message';
import productService from '../services/productService'; 

export default function CartScreen() {
  const navigation = useNavigation();
  const { cart, removeFromCart, updateQuantity, fetchCartFromAPI, loading } = useCart();
  const { isLoggedIn } = useAuth();
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    const loadCartFromAPI = async () => {
      if (isLoggedIn) {
        const result = await fetchCartFromAPI();
        if (!result.success && result.message !== 'No authentication token') {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: result.message || 'Cannot load cart',
          });
        }
      }
    };

    loadCartFromAPI();
  }, [isLoggedIn]);


  useFocusEffect(
    React.useCallback(() => {
      if (isLoggedIn) {
        console.log('📱 Cart screen focused - refreshing cart...');

        const refreshCart = async () => {
          const result = await fetchCartFromAPI();
          if (!result.success && result.message !== 'No authentication token') {
            console.log('Auto refresh failed:', result.message);
          }
        };
        refreshCart();
      }
    }, [isLoggedIn])
  );


  const onRefresh = async () => {
    setRefreshing(true);
    
    if (!isLoggedIn) {

      setTimeout(() => {
        setRefreshing(false);
        Toast.show({
          type: 'info',
          text1: 'Notification',
          text2: 'Please login to sync cart',
        });
      }, 1000); 
      return;
    }
    
    try {
      const result = await fetchCartFromAPI();
      if (!result.success && result.message !== 'No authentication token') {
        Toast.show({
          type: 'error', 
          text1: 'Error',
          text2: result.message || 'Cannot load cart',
        });
      } else if (result.success) {

        Toast.show({
          type: 'success',
          text1: 'Update successful',
          text2: 'Cart has been synced',
        });
      }
    } catch (error) {

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Cannot refresh cart',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);


  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      
      console.error('Error updating quantity:', error);
    }
  };


  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const getImageSource = (product) => {
    if (product.image) {
      if (typeof product.image === 'string') {
        return { uri: product.image };
      }
      return product.image;
    }
    
    return require('../../assets/product1.png'); 
  };

  const handleImageError = (item) => {
    console.log('Error loading cart image for:', item.name, 'URL:', item.image);
  };

  const handleProductPress = (item) => {
    console.log('Navigating to product detail for:', item.name);
    console.log('Cart item data:', {
      id: item.id,
      productId: item.productId,
      _id: item._id,
      name: item.name,
      image: item.image
    });
    
    let productId = null;
    
    if (typeof item.productId === 'string') {
      productId = item.productId;
    }
    else if (item.productId && typeof item.productId === 'object' && item.productId._id) {
      productId = item.productId._id;
    }
    else if (item._id) {
      productId = item._id;
    }
    else if (item.id) {
      productId = item.id;
    }
    
    console.log('Extracted productId:', productId);
    console.log('ProductId type:', typeof productId);
    
    if (!productId) {
      console.log('No valid productId found in cart item:', item);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Cannot open product detail page - missing product information',
      });
      return;
    }
    
    console.log('Using productId for navigation:', productId);
    
    try {
      navigation.navigate('ProductDetail', { 
        productId: productId,
        fallbackProduct: item 
      });
    } catch (navigationError) {
      console.log('Navigation error:', navigationError);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Cannot open product detail page',
      });
    }
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Login required',
        'You need to login to continue payment',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
      return;
    }

    try {
      console.log('Checking hidden products before checkout...');
      
      for (const item of cart) {
        let productId = null;
        if (typeof item.productId === 'string') {
          productId = item.productId;
        } else if (item.productId && typeof item.productId === 'object' && item.productId._id) {
          productId = item.productId._id;
        } else if (item._id) {
          productId = item._id;
        } else if (item.id) {
          productId = item.id;
        }

        if (!productId) {
          console.log('No productId found for item:', item.name);
          Toast.show({
            type: 'error',
            text1: 'Invalid product',
            text2: `Product "${item.name}" has invalid data. Please remove it from the cart.`,
          });
          return;
        }

        console.log(`Checking product: ${item.name} (ID: ${productId})`);
        
        const productResponse = await productService.getProductById(productId);
        
        if (!productResponse.success) {
          console.log(`Product ${item.name} is not available:`, productResponse.error);
          Toast.show({
            type: 'error',
            text1: 'Product not available',
            text2: `Product "${item.name}" is not available. Please remove it from the cart.`,
          });
          return;
        }

        const product = productResponse.product;
        if (product && product.hidden === true) {
          console.log(`Product ${item.name} has been hidden`);
          Toast.show({
            type: 'error',
            text1: 'Product not available',
            text2: `Product "${item.name}" has been hidden from the store. Please remove it from the cart.`,
          });
          return;
        }

        if (product && product.stock !== undefined && product.stock <= 0) {
          console.log(`Product ${item.name} is sold out (stock: ${product.stock})`);
          Toast.show({
            type: 'error',
            text1: 'Product sold out',
            text2: `Product "${item.name}" is sold out. Please remove it from the cart.`,
          });
          return;
        }

        console.log(`Product ${item.name} is available`);
      }

      console.log('All products in the cart are available, proceeding to checkout');
      navigation.navigate('Checkout');
      
    } catch (error) {
      console.log('Product validation error:', error);
      Toast.show({
        type: 'error',
        text1: 'Validation error',
        text2: 'Cannot check product status. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        
        <ScrollView
          contentContainerStyle={styles.emptyScrollContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[colors.accent]} 
              tintColor={colors.accent}
            />
          }
          showsVerticalScrollIndicator={false}
        >
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
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item, index) => item.id || item._id || `cart-item-${index}`}
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          
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
              
              <TouchableOpacity 
                onPress={() => handleProductPress(item)}
                style={styles.productInfoContainer}
                activeOpacity={0.7}
              >
                <Image 
                  source={getImageSource(item)} 
                  style={styles.itemImage} 
                  defaultSource={require('../../assets/product1.png')}
                  onError={(error) => {
                    handleImageError(item);
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
              </TouchableOpacity>
              
              
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
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.accent]} 
            tintColor={colors.accent}
          />
        }
      />
      
      
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
    paddingBottom: 20, 
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
  productInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    paddingBottom: 100, 
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  emptyScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, 
  },
}); 