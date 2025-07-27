import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants';
import { BannerSlider, ServiceFeatures } from '../components/common';
import { ProductCard } from '../components/product';
import { productService } from '../services';

const { width } = Dimensions.get('window');


const categories = [
  { id: 'lipstick', name: 'Lipstick', image: require('../../assets/cate1.png'), category: 'cosmetics' },
  { id: 'toner', name: 'Toner', image: require('../../assets/cate2.webp'), category: 'treatments' },
  { id: 'cleanser', name: 'Cleanser', image: require('../../assets/cate3.png'), category: 'treatments' },
  { id: 'serum', name: 'Serum', image: require('../../assets/cate4.png'), category: 'treatments' },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        setLoading(true);

        const response = await productService.getAllProducts({
          pageIndex: 1,
          pageSize: 20
        });

        if (response.success) {
          const transformedProducts = response.products.map(apiProduct => 
            productService.transformProduct(apiProduct)
          );

          const bestSellersList = transformedProducts
            .filter(product => product.rating >= 4.5)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6);

          const newArrivalsList = transformedProducts
            .filter(product => product.isNew)
            .sort((a, b) => new Date(b._original?.createdAt || 0) - new Date(a._original?.createdAt || 0))
            .slice(0, 6);

          const featuredList = transformedProducts
            .filter(product => product.isBestseller || product.isNew)
            .sort((a, b) => {
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

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { 
      product,
      productId: product.id 
    });
  };

  const handleCategoryPress = (category) => {
    console.log('🎯 Category pressed:', category);

    if (category.category === 'cosmetics') {
      const params = {
        category: 'cosmetics',
        state: { type: category.name } 
      };
      console.log('🚀 Navigating to cosmetics with params:', params);
      navigation.navigate('MainTabs', {
        screen: 'Shop',
        params: params
      });
    } else {
      const params = {
        category: 'treatments',
        state: { type: category.name } 
      };
      console.log('🚀 Navigating to treatments with params:', params);
      navigation.navigate('MainTabs', {
        screen: 'Shop',
        params: params
      });
    }
  };

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

  const renderProductItem = ({ item }) => (
    <View style={styles.productItemWrapper}>
      <ProductCard 
        product={item}
        onPress={() => handleProductPress(item)}
        style={styles.homeProductCard}
      />
    </View>
  );

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

  const renderProductSection = (title, products, seeAllType) => {
    if (!products || products.length === 0) {
      return null;
    }

    return (
      <View style={styles.productSection}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => handleSeeAllPress(seeAllType)}>
            <Text style={styles.seeAll}>see all</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => item.id || item._id || `product-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsHorizontalList}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <View style={{ flex: 1 }} />
        <View style={styles.headerCenter}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.headerRight}>

        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <BannerSlider />

        <ServiceFeatures />

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>featured category</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
            <Text style={styles.seeAll}>see all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categoriesGrid}>
          {categories.map(renderCategoryItem)}
        </View>

        {loading && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>loading products...</Text>
          </View>
        )}

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
    paddingBottom: 120, 
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
    justifyContent: 'center', 
    alignItems: 'center', 
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
    textAlign: 'center', 
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