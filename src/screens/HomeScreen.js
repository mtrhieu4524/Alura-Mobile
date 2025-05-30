import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, FlatList, Dimensions, Modal, Pressable } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Mock user data
const user = {
  name: 'Nguyễn Văn A',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
};

// Mock products
const products = [
  {
    id: '1',
    name: 'Dior Addict Lipstick',
    brand: 'Dior',
    price: 45.0,
    rating: 4.8,
    image: require('../../assets/product1.png'),
  },
  {
    id: '2',
    name: "AGE 20's Essence Cover Pact",
    brand: 'Essence',
    price: 22.0,
    rating: 4.5,
    image: require('../../assets/product2.png'),
  },
];

// Mock categories
const categories = [
  { id: '1', name: 'Skincare', image: require('../../assets/cat1.png') },
  { id: '2', name: 'Makeup', image: require('../../assets/cat2.png') },
  { id: '3', name: 'Fragrance', image: require('../../assets/cat3.png') },
  { id: '4', name: 'Haircare', image: require('../../assets/cat4.png') },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    setShowMenu(false);
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
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Ionicons name="notifications-outline" size={24} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#bbb" style={{ marginLeft: 8 }} />
        <TextInput style={styles.searchInput} placeholder="Search for products..." placeholderTextColor="#bbb" />
      </View>
      {/* Popular Products */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Popular Products</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 220 }}>
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        style={{ marginBottom: 8, marginLeft: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          >
            <Image source={item.image} style={styles.productImage} />
            <Text style={styles.productBrand}>{item.brand}</Text>
            <Text style={styles.productName}>{item.name}</Text>
            <View style={styles.ratingRow}>
              <FontAwesome name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />
      </View>
      {/* Featured Categories */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Featured Categories</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.categoriesGrid}>
        {categories.map(cat => (
          <View key={cat.id} style={styles.categoryCard}>
            <Image source={cat.image} style={styles.categoryImage} />
            <View style={styles.categoryOverlay} />
            <Text style={styles.categoryName}>{cat.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const CARD_WIDTH = width * 0.42;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 36,
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginBottom: 8,
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuDropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 60,
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuText: {
    fontSize: 16,
    color: '#222',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#222',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  seeAll: {
    color: '#6C63FF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginRight: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 90,
    borderRadius: 10,
    marginBottom: 8,
  },
  productBrand: {
    color: '#888',
    fontSize: 13,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
    color: '#222',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    marginLeft: 4,
    color: '#888',
    fontSize: 13,
  },
  productPrice: {
    color: '#3466F6',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 2,
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
});