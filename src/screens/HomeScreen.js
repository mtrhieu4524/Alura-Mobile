import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants';
import { BannerSlider, ServiceFeatures } from '../components/common';
import { ProductCard } from '../components/product';
import { productService } from '../services';

const { width } = Dimensions.get('window');

// Mock categories
const categories = [
  { id: 'skincare', name: 'Skincare', image: require('../../assets/skincare.png') },
  { id: 'makeup', name: 'Makeup', image: require('../../assets/facialcosmetics.png') },
  { id: 'fragrance', name: 'Fragrance', image: require('../../assets/purefragrance.png') },
  { id: 'haircare', name: 'Haircare', image: require('../../assets/cat4.png') },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  // State for products
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products for different sections
  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        setLoading(true);

        // Fetch all products and then filter/sort them locally
        const response = await productService.getAllProducts({
          pageIndex: 1,
          pageSize: 20
        });

        if (response.success) {
          // Transform products
          const transformedProducts = response.products.map(apiProduct => 
            productService.transformProduct(apiProduct)
          );

          // Best Sellers (high rating products)
          const bestSellersList = transformedProducts
            .filter(product => product.rating >= 4.5)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6);

          // New Arrivals (recently created products)
          const newArrivalsList = transformedProducts
            .filter(product => product.isNew)
            .sort((a, b) => new Date(b._original?.createdAt || 0) - new Date(a._original?.createdAt || 0))
            .slice(0, 6);

          // Featured Products (mix of bestsellers and new products)
          const featuredList = transformedProducts
            .filter(product => product.isBestseller || product.isNew)
            .sort((a, b) => {
              // Prioritize bestsellers and new products
              if (a.isBestseller && !b.isBestseller) return -1;
              if (!a.isBestseller && b.isBestseller) return 1;
              if (a.isNew && !b.isNew) return -1;
              if (!a.isNew && b.isNew) return 1;
              return b.rating - a.rating;
            })
            .slice(0, 8);

          setBestSellers(bestSellersList);
          setNewArrivals(newArrivalsList);
          setFeaturedProducts(featuredList);

          console.log('Home products loaded:', {
            bestSellers: bestSellersList.length,
            newArrivals: newArrivalsList.length,
            featured: featuredList.length
          });
        }
      } catch (error) {
        console.error('Error fetching home products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  // Handle product press
  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { 
      product,
      productId: product.id 
    });
  };

  // Handle category press
  const handleCategoryPress = (category) => {
    navigation.navigate('Shop', { 
      selectedCategory: category.id,
      categoryName: category.name 
    });
  };

  // Handle see all press
  const handleSeeAllPress = (type) => {
    let params = {};
    
    switch (type) {
      case 'bestsellers':
        params = { sortBy: 'rating' };
        break;
      case 'new':
        params = { sortBy: 'newest' };
        break;
      case 'featured':
        params = { sortBy: 'popular' };
        break;
      default:
        params = {};
    }
    
    navigation.navigate('Shop', params);
  };

  // Render product item for horizontal lists
  const renderProductItem = ({ item }) => (
    <View style={styles.productItemWrapper}>
      <ProductCard 
        product={item}
        onPress={() => handleProductPress(item)}
        style={styles.homeProductCard}
      />
    </View>
  );

  // Render category item
  const renderCategoryItem = (cat) => (
    <TouchableOpacity 
      key={cat.id} 
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(cat)}
    >
      <Image source={cat.image} style={styles.categoryImage} />
      <View style={styles.categoryOverlay} />
      <Text style={styles.categoryName}>{cat.name}</Text>
    </TouchableOpacity>
  );

  // Render product section
  const renderProductSection = (title, products, seeAllType) => {
    if (!products || products.length === 0) {
      return null;
    }

    return (
      <View style={styles.productSection}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => handleSeeAllPress(seeAllType)}>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsHorizontalList}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={{ flex: 1 }} />
        <View style={styles.headerCenter}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={{ marginRight: 16 }}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner Slider */}
        <BannerSlider />

        {/* Service Features */}
        <ServiceFeatures />

        {/* Featured Categories */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Danh mục nổi bật</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categoriesGrid}>
          {categories.map(renderCategoryItem)}
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
          </View>
        )}

        {/* Product Sections */}
        {!loading && (
          <>
            {renderProductSection('Best Sellers', bestSellers, 'bestsellers')}
            {renderProductSection('New Arrivals', newArrivals, 'new')}
            {renderProductSection('Featured', featuredProducts, 'featured')}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = width * 0.42;
const PRODUCT_CARD_WIDTH = width * 0.45;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 120, // Space for floating tab bar
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 90,
    height: 36,
    alignSelf: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAll: {
    color: colors.accent,
    fontWeight: 'bold',
    fontSize: 14,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
  },
  categoryCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  categoryImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  categoryName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    alignSelf: 'center',
    marginBottom: 16,
    zIndex: 2,
  },
  productSection: {
    marginBottom: 8,
  },
  productsHorizontalList: {
    paddingHorizontal: 16,
  },
  productItemWrapper: {
    marginRight: 12,
  },
  homeProductCard: {
    width: PRODUCT_CARD_WIDTH,
  },
  loadingSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
});