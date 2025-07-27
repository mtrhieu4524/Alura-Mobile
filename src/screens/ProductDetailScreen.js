import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services';
import Toast from 'react-native-toast-message';
import { colors, typography, dimensions } from '../constants';





export default function ProductDetailScreen({ route, navigation }) {
  const { productId, product: routeProduct, fallbackProduct } = route.params;
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  
  const [product, setProduct] = useState(routeProduct);
  const [loading, setLoading] = useState(!routeProduct);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (productId) {
        try {
          setLoading(true);
          setError(null);
          
          console.log('Fetching product detail for ID:', productId);
          const response = await productService.getProductById(productId);
          
          if (response.success && response.product) {
            const transformedProduct = productService.transformProduct(response.product);
            console.log('Product detail fetched successfully:', transformedProduct.name);
            setProduct(transformedProduct);
          } else {
            const errorMessage = response.error || 'Cannot fetch product detail';
            console.log('Failed to fetch product:', errorMessage);
            
            if (fallbackProduct) {
              console.log('Using fallback product data from cart:', fallbackProduct.name);
              setProduct(fallbackProduct);
              setError(null); 
            } else {
              setError(errorMessage);
            }
          }
        } catch (error) {
          const errorMessage = error.message || 'Connection error. Please try again.';
          console.log('Error fetching product detail:', errorMessage);
          
          if (fallbackProduct) {
            console.log('Using fallback product data from cart (catch):', fallbackProduct.name);
            setProduct(fallbackProduct);
            setError(null); 
          } else {
            setError(errorMessage);
          }
        } finally {
          setLoading(false);
        }
      } else if (routeProduct) {
        console.log('Using route product data:', routeProduct.name);
        setProduct(routeProduct);
        setLoading(false);
      } else if (fallbackProduct) {
        console.log('Using fallback product data from cart:', fallbackProduct.name);
        setProduct(fallbackProduct);
        setLoading(false);
      } else {
        setError('Không tìm thấy thông tin sản phẩm');
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId, routeProduct]);

  const getImageSource = () => {
    if (imageError) {
      return require('../../assets/product1.png');
    }

    if (product?.image) {
      if (typeof product.image === 'string') {
        return { uri: product.image };
      }
      return product.image;
    }
    return require('../../assets/product1.png');
  };

  const handleImageError = () => {
    console.log('⚠️ Error loading product detail image:', product?.name, 'URL:', product?.image);
    setImageError(true);
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Login required',
        'You need to login to add product to cart',
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

    if (product) {
      try {
        await addToCart(product, 1);
      } catch (error) {
        if (error.message && error.message.includes('product not found')) {
          Toast.show({
            type: 'error',
            text1: 'Product not available',
            text2: 'This product is no longer available. Please choose a different product.',
          });
        } else if (error.message && error.message.includes('hidden')) {
          Toast.show({
            type: 'error',
            text1: 'Product not available',
            text2: 'This product is no longer available. Please choose a different product.',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error adding to cart',
            text2: 'Cannot add product to cart. Please try again.',
          });
        }
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <SafeAreaView style={{ backgroundColor: colors.background }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
              Product detail
            </Text>
            <View style={{ width: 26 }} />
          </View>
        </SafeAreaView>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <SafeAreaView style={{ backgroundColor: colors.background }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
              Product detail
            </Text>
            <View style={{ width: 26 }} />
          </View>
        </SafeAreaView>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const p = product || {
    name: 'Tên sản phẩm',
    brand: 'Thương hiệu',
    price: 0,
    rating: 4.5,
    image: require('../../assets/product1.png'),
    id: '0',
    description: 'Mô tả sản phẩm',
    keyIngredients: 'Thành phần chính',
    instructions: 'Hướng dẫn sử dụng',
    stock: 0
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {product?.name || 'Product detail'}
          </Text>
          <View style={{ width: 26 }} />
        </View>
      </SafeAreaView>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}> 
        <View style={styles.imageBox}>
          <Image 
            source={getImageSource()} 
            style={styles.productImage}
            defaultSource={require('../../assets/product1.png')}
            onError={handleImageError}
          />
          
          <View style={styles.badgeContainer}>
            {p.isBestseller && (
              <View style={[styles.badge, styles.bestsellerBadge]}>
                <Text style={styles.badgeText}>Best seller</Text>
              </View>
            )}
            {p.stock <= 0 && (
              <View style={[styles.badge, styles.outOfStockBadge]}>
                <Text style={styles.badgeText}>Sold out</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.brand}>{p.brand}</Text>
          <Text style={styles.productName}>{p.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {typeof p.price === 'number' ? p.price.toLocaleString('vi-VN') : p.price} VND
            </Text>
            {p.stock !== undefined && (
              <Text style={[
                styles.stockText,
                p.stock > 0 ? styles.inStock : styles.outOfStock
              ]}>
                {p.stock > 0 ? `${p.stock} Left` : 'Sold out'}
              </Text>
            )}
          </View>
          
          {(p.category || p.productType || p.sex) && (
            <View style={styles.tagsContainer}>
              {p.category && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{p.category}</Text>
                </View>
              )}
              {p.productType && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{p.productType}</Text>
                </View>
              )}
              {p.sex && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{p.sex}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionText}>
            {p.description || 'Sản phẩm chất lượng cao, an toàn cho da, phù hợp với mọi loại da.'}
          </Text>
        </View>

        {p.keyIngredients && (
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Key Ingredients</Text>
            <Text style={styles.sectionText}>{p.keyIngredients}</Text>
          </View>
        )}

        {p.instructions && (
          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.sectionText}>{p.instructions}</Text>
          </View>
        )}

        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Product details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Brand:</Text>
            <Text style={styles.detailValue}>{p.brand}</Text>
          </View>
          {p.volume && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Volume:</Text>
              <Text style={styles.detailValue}>{p.volume}</Text>
            </View>
          )}
          {p.skinType && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Skin type:</Text>
              <Text style={styles.detailValue}>{p.skinType}</Text>
            </View>
          )}
          {p.skinColor && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Skin color:</Text>
              <Text style={styles.detailValue}>{p.skinColor}</Text>
            </View>
          )}
        </View>


        <View style={styles.bottomSpacing} />
      </ScrollView>


      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.bottomPrice}>
            {typeof p.price === 'number' ? p.price.toLocaleString('vi-VN') : p.price} VND
          </Text>
          {p.stock <= 0 && (
            <Text style={styles.outOfStockText}>Sold out</Text>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.addCartBtn, p.stock <= 0 && styles.disabledBtn]} 
          onPress={handleAddToCart}
          disabled={p.stock <= 0}
        >
          <Ionicons name="cart-outline" size={22} color={colors.white} style={{ marginRight: 8 }} />
          <Text style={[styles.addCartText, {textAlign: 'center'}]}>
            {p.stock <= 0 ? 'Sold out' : 'Add to cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
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
  errorText: {
    fontSize: typography.sizes.medium,
    color: colors.error,
    textAlign: 'center',
    marginTop: dimensions.spacing.medium,
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
    flex: 1,
    textAlign: 'center',
  },
  imageBox: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.lightGray,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartBtn: {
    position: 'absolute',
    top: dimensions.spacing.medium,
    right: dimensions.spacing.medium,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
    padding: dimensions.spacing.small,
  },
  badgeContainer: {
    position: 'absolute',
    top: dimensions.spacing.medium,
    left: dimensions.spacing.medium,
    flexDirection: 'column',
  },
  badge: {
    paddingHorizontal: dimensions.spacing.small,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  newBadge: {
    backgroundColor: colors.success,
  },
  bestsellerBadge: {
    backgroundColor: colors.accent,
  },
  outOfStockBadge: {
    backgroundColor: colors.error,
  },
  badgeText: {
    color: colors.white,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.bold,
  },
  infoBox: {
    padding: dimensions.spacing.large,
    backgroundColor: colors.background,
  },
  brand: {
    color: colors.textSecondary,
    fontSize: typography.sizes.medium,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: typography.sizes.xLarge,
    fontWeight: typography.weights.bold,
    marginBottom: dimensions.spacing.small,
    color: colors.textPrimary,
    lineHeight: typography.sizes.xLarge * 1.2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.spacing.small,
  },
  ratingText: {
    color: colors.textSecondary,
    marginLeft: dimensions.spacing.small,
    fontSize: typography.sizes.medium,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.medium,
  },
  price: {
    color: colors.accent,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.xLarge,
  },
  stockText: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.medium,
  },
  inStock: {
    color: colors.success,
  },
  outOfStock: {
    color: colors.error,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: dimensions.spacing.small,
  },
  tag: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: dimensions.spacing.medium,
    paddingVertical: dimensions.spacing.small,
    borderRadius: 16,
    marginRight: dimensions.spacing.small,
    marginBottom: 4,
  },
  tagText: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  sectionBox: {
    padding: dimensions.spacing.large,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.large,
    marginBottom: dimensions.spacing.medium,
    color: colors.textPrimary,
  },
  sectionText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.medium,
    lineHeight: typography.sizes.medium * 1.4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: dimensions.spacing.medium,
  },
  detailLabel: {
    fontSize: typography.sizes.medium,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: typography.sizes.medium,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
    flex: 1,
    textAlign: 'right',
  },
  reviewSummaryBox: {
    backgroundColor: colors.background,
    margin: dimensions.spacing.large,
    borderRadius: dimensions.borderRadius.large,
    padding: dimensions.spacing.large,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.spacing.large,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginRight: dimensions.spacing.large,
  },
  ratingNumberDetail: {
    flex: 1,
  },
  ratingCount: {
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: typography.sizes.medium,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.spacing.small,
  },
  starNumber: {
    width: 14,
    fontSize: typography.sizes.medium,
    color: colors.textPrimary,
  },
  ratingBarBg: {
    height: 8,
    width: 100,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    marginHorizontal: dimensions.spacing.medium,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: 8,
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  ratingRowCount: {
    color: colors.textSecondary,
    fontSize: typography.sizes.medium,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: dimensions.spacing.large,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: dimensions.spacing.medium,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewName: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.medium,
    color: colors.textPrimary,
  },
  reviewTime: {
    color: colors.textSecondary,
    fontSize: typography.sizes.small,
    marginBottom: dimensions.spacing.small,
  },
  reviewText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.medium,
    lineHeight: typography.sizes.medium * 1.4,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: dimensions.spacing.large,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  priceContainer: {
    flex: 1,
  },
  bottomPrice: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.xLarge,
    color: colors.textPrimary,
  },
  outOfStockText: {
    fontSize: typography.sizes.medium,
    color: colors.error,
    fontWeight: typography.weights.medium,
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: dimensions.spacing.xLarge * 1.5,
    paddingVertical: dimensions.spacing.medium,
    borderRadius: dimensions.borderRadius.medium,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 140,
  },
  disabledBtn: {
    backgroundColor: colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  addCartText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.medium,
  },
  bottomSpacing: {
    height: dimensions.spacing.large,
  },
}); 