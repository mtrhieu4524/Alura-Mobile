import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../CartContext';

export default function CartScreen() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const shipping = 5.0;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shipping;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
      </View>
      {/* Cart List */}
      <FlatList
        data={cart}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={item.image} style={styles.itemImage} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.volume && <Text style={styles.itemVolume}>{item.volume}</Text>}
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.qtyBox}>
              <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>
                <Ionicons name="remove" size={18} color="#888" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
                <Ionicons name="add" size={18} color="#888" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteBtn}>
              <Ionicons name="trash" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>${shipping.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotal}>Total</Text>
              <Text style={styles.summaryTotalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        }
      />
      {/* Checkout Button */}
      <View style={styles.checkoutBar}>
        <Text style={styles.checkoutPrice}>${total.toFixed(2)}</Text>
        <TouchableOpacity style={styles.checkoutBtn}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  itemVolume: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
  },
  itemPrice: {
    color: '#6C63FF',
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
    color: '#6C63FF',
  },
  checkoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  checkoutPrice: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  checkoutBtn: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 