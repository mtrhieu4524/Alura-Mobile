import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProductCard } from '../product';
import { colors, typography, dimensions } from '../../constants';

const mockProducts = {
  popular: [
    {
      id: '1',
      name: 'Dior Addict Lipstick',
      brand: 'Dior',
      price: 1100000,
      rating: 4.8,
      image: require('../../../assets/product1.png'),
    },
    {
      id: '2',
      name: "AGE 20's Essence Cover Pact",
      brand: 'Essence',
      price: 540000,
      rating: 4.5,
      image: require('../../../assets/product2.png'),
    },
  ],
  trending: [
    {
      id: '3',
      name: 'Premium Face Serum',
      brand: 'Alura',
      price: 750000,
      rating: 4.7,
      image: require('../../../assets/product1.png'),
    },
    {
      id: '4',
      name: 'Hydrating Moisturizer',
      brand: 'Alura',
      price: 420000,
      rating: 4.6,
      image: require('../../../assets/product2.png'),
    },
  ],
  newArrivals: [
    {
      id: '5',
      name: 'Vitamin C Cleanser',
      brand: 'Alura',
      price: 320000,
      rating: 4.4,
      image: require('../../../assets/product1.png'),
    },
    {
      id: '6',
      name: 'Anti-Aging Cream',
      brand: 'Alura',
      price: 890000,
      rating: 4.9,
      image: require('../../../assets/product2.png'),
    },
  ]
};

const tabs = [
  { id: 'popular', title: 'Popular' },
  { id: 'trending', title: 'Trending' },
  { id: 'newArrivals', title: 'New Arrivals' }
];

export default function ProductTabs() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('popular');

  const getCurrentProducts = () => {
    return mockProducts[activeTab] || [];
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleSeeAll = () => {
    navigation.navigate('Shop', { filter: activeTab });
  };

  const renderProduct = ({ item }) => (
    <ProductCard 
      product={item}
      onPress={() => handleProductPress(item)}
      style={styles.productCard}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity onPress={handleSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getCurrentProducts()}
        renderItem={renderProduct}
        keyExtractor={(item, index) => item.id || item._id || `product-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: dimensions.spacing.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.medium,
    marginBottom: dimensions.spacing.medium,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: dimensions.borderRadius.large,
    padding: 4,
  },
  tab: {
    paddingHorizontal: dimensions.spacing.medium,
    paddingVertical: dimensions.spacing.small,
    borderRadius: dimensions.borderRadius.medium,
  },
  activeTab: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  activeTabText: {
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  seeAllText: {
    fontSize: typography.sizes.small,
    color: colors.accent,
    fontWeight: typography.weights.bold,
  },
  productsList: {
    paddingLeft: dimensions.spacing.medium,
  },
  productCard: {
    marginRight: dimensions.spacing.medium,
  },
}); 