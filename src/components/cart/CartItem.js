import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, dimensions, typography } from '../../constants';

export default function CartItem({ 
  item, 
  onUpdateQuantity, 
  onRemove,
  style 
}) {
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  return (
    <View style={[styles.container, style]}>
      <Image source={item.image} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        
        {item.volume && (
          <Text style={styles.volume}>{item.volume}</Text>
        )}
        
        <Text style={styles.price}>
          {item.price.toLocaleString('vi-VN')} VND
        </Text>
      </View>
      
      <View style={styles.quantityContainer}>
        <TouchableOpacity 
          onPress={handleDecrease} 
          style={styles.quantityButton}
        >
          <Ionicons name="remove" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <Text style={styles.quantity}>{item.quantity}</Text>
        
        <TouchableOpacity 
          onPress={handleIncrease} 
          style={styles.quantityButton}
        >
          <Ionicons name="add" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        onPress={() => onRemove(item.id)} 
        style={styles.removeButton}
      >
        <Ionicons name="trash" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: dimensions.borderRadiusLarge,
    padding: dimensions.paddingMedium,
    marginBottom: dimensions.marginMedium,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.borderTertiary,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: dimensions.borderRadiusMedium,
  },
  content: {
    flex: 1,
    marginLeft: dimensions.marginMedium,
  },
  name: {
    fontSize: typography.fontSizeLarge,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  volume: {
    fontSize: typography.fontSizeSmall,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  price: {
    fontSize: typography.fontSizeNormal,
    fontWeight: typography.fontWeightBold,
    color: colors.accent,
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: dimensions.borderRadiusMedium,
    paddingHorizontal: dimensions.paddingSmall,
    paddingVertical: 4,
    marginRight: dimensions.marginSmall,
  },
  quantityButton: {
    padding: 4,
  },
  quantity: {
    fontSize: typography.fontSizeNormal,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
    marginHorizontal: dimensions.marginSmall,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: colors.error,
    borderRadius: dimensions.borderRadiusMedium,
    padding: dimensions.paddingSmall,
  },
}); 