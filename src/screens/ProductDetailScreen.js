import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { products } from '../data/mockData';
import { useCart } from '../CartContext';
import Toast from 'react-native-toast-message';

// Dữ liệu review mẫu
const reviews = [
  {
    id: 1,
    name: 'Sarah L.',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    rating: 5,
    time: '2 weeks ago',
    content: 'Absolutely love this serum! My skin feels so hydrated and looks much brighter. Definitely a staple in my routine now.'
  },
  {
    id: 2,
    name: 'John P.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4,
    time: '3 days ago',
    content: 'Good serum, absorbs quickly. See some improvement in skin texture. Wish the bottle was bigger though.'
  },
  {
    id: 3,
    name: 'Emily R.',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    rating: 5,
    time: '1 month ago',
    content: 'Holy Grail product! My dry patches are gone, and my skin has a noticeable glow. Worth every penny.'
  }
];

// Dữ liệu đánh giá tổng hợp mẫu
const ratingStats = [
  { star: 5, count: 98 },
  { star: 4, count: 20 },
  { star: 3, count: 7 },
  { star: 2, count: 2 },
  { star: 1, count: 1 },
];

function StarRow({ rating }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <FontAwesome key={i} name={i <= Math.round(rating) ? 'star' : 'star-o'} size={18} color="#FFD600" style={{ marginRight: 2 }} />
      ))}
    </View>
  );
}

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params || {};
  const fallbackProduct = {
    name: 'Product Name',
    brand: 'Brand',
    price: 0,
    rating: 4.5,
    image: require('../../assets/product1.png'),
    id: '0',
  };
  const p = product || fallbackProduct;
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(p, 1);
    Toast.show({
      type: 'success',
      text1: 'Đã thêm vào giỏ hàng!',
      position: 'top',
      visibilityTime: 1500,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView style={{ backgroundColor: '#fff' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <TouchableOpacity>
            <Ionicons name="share-social-outline" size={22} color="#222" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Ảnh sản phẩm */}
        <View style={styles.imageBox}>
          <Image source={p.image} style={styles.productImage} />
          <TouchableOpacity style={styles.heartBtn}>
            <Ionicons name="heart-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Thông tin sản phẩm */}
        <View style={styles.infoBox}>
          <Text style={styles.brand}>{p.brand}</Text>
          <Text style={styles.productName}>{p.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <StarRow rating={p.rating} />
            <Text style={{ color: '#888', marginLeft: 6, fontSize: 15 }}>{p.rating} (128 reviews)</Text>
          </View>
          <Text style={styles.price}>${p.price.toFixed(2)}</Text>
        </View>
        {/* Description */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionText}>A lightweight, deeply hydrating serum infused with hyaluronic acid and Vitamin C. Leaves skin feeling plump, radiant, and visibly smoother. Suitable for all skin types.</Text>
        </View>
        {/* Ingredients & Benefits */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Ingredients & Benefits</Text>
          <Text style={styles.sectionText}>
            Key Ingredients:{'\n'}- Hyaluronic Acid: Deep hydration.\n- Vitamin C: Brightens and protects.\nBenefits:{'\n'}- Boosts radiance.\n- Reduces fine lines.
          </Text>
        </View>
        {/* Customer Reviews tổng hợp */}
        <View style={styles.reviewSummaryBox}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.ratingNumber}>{p.rating}</Text>
            <StarRow rating={p.rating} />
            <Text style={{ color: '#888', marginLeft: 8 }}>128 reviews</Text>
          </View>
          {/* Biểu đồ rating */}
          {ratingStats.map(r => (
            <View key={r.star} style={styles.ratingRow}>
              <FontAwesome name="star" size={15} color="#FFD600" style={{ marginRight: 4 }} />
              <Text style={{ width: 14 }}>{r.star}</Text>
              <View style={styles.ratingBarBg}>
                <View style={[styles.ratingBarFill, { width: `${r.count/98*100}%` }]} />
              </View>
              <Text style={{ color: '#888', marginLeft: 6 }}>{r.count}</Text>
            </View>
          ))}
        </View>
        {/* Reviews */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviews.map(r => (
            <View key={r.id} style={styles.reviewItem}>
              <Image source={{ uri: r.avatar }} style={styles.reviewAvatar} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.reviewName}>{r.name}</Text>
                  <StarRow rating={r.rating} />
                </View>
                <Text style={styles.reviewTime}>{r.time}</Text>
                <Text style={styles.reviewContent}>{r.content}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      {/* Add to cart bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomPrice}>${p.price.toFixed(2)}</Text>
        <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart}>
          <Ionicons name="cart-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.addCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  imageBox: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#eee',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  heartBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 24,
    padding: 6,
  },
  infoBox: {
    padding: 18,
    backgroundColor: '#fff',
  },
  brand: {
    color: '#888',
    fontSize: 15,
    marginBottom: 2,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
  price: {
    color: '#6C63FF',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 2,
  },
  sectionBox: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#222',
  },
  sectionText: {
    color: '#444',
    fontSize: 15,
    lineHeight: 21,
  },
  reviewSummaryBox: {
    backgroundColor: '#fff',
    margin: 18,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingBarBg: {
    height: 8,
    width: 100,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: 8,
    backgroundColor: '#6C63FF',
    borderRadius: 4,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  reviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
  },
  reviewName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  reviewTime: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
  },
  reviewContent: {
    color: '#444',
    fontSize: 15,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  bottomPrice: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#222',
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addCartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 