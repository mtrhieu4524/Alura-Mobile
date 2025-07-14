import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { StarRating } from '../common';
import { colors, dimensions, typography } from '../../constants';

export default function ProductCard({ 
  product, 
  onPress, 
  style,
  showRating = true,
  showBrand = true 
}) {
  // Handle both URL images (from API) and local assets
  const getImageSource = () => {
    if (product.image) {
      // If it's a string (URL), use { uri: ... }
      if (typeof product.image === 'string') {
        return { uri: product.image };
      }
      // If it's a local asset (require()), use directly
      return product.image;
    }
    
    // Fallback to a placeholder if no image
    return require('../../../assets/product1.png'); // Default placeholder
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image 
          source={getImageSource()} 
          style={styles.image}
          defaultSource={require('../../../assets/product1.png')}
          onError={() => console.log('Error loading image:', product.image)}
        />
        
        {/* New/Bestseller badges */}
        {product.isNew && (
          <View style={[styles.badge, styles.newBadge]}>
            <Text style={styles.badgeText}>Mới</Text>
          </View>
        )}
        {product.isBestseller && !product.isNew && (
          <View style={[styles.badge, styles.bestsellerBadge]}>
            <Text style={styles.badgeText}>Hot</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        {showBrand && product.brand && (
          <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
        )}
        
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        
        {showRating && product.rating && (
          <View style={styles.ratingContainer}>
            <StarRating rating={product.rating} size={14} />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        )}
        
        <View style={styles.priceContainer}>
          <Text style={styles.price} numberOfLines={1}>
            {typeof product.price === 'number' 
              ? product.price.toLocaleString('vi-VN') + ' VND'
              : product.price
            }
          </Text>
          
          {/* Stock indicator */}
          {product.stock !== undefined && (
            <Text style={[
              styles.stockText, 
              product.stock > 0 ? styles.inStock : styles.outOfStock
            ]} numberOfLines={1}>
              {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: dimensions.borderRadiusLarge,
    padding: dimensions.paddingMedium,
    marginRight: dimensions.marginMedium,
    width: dimensions.productCardWidth,
    minHeight: 280, // Fixed minimum height for consistency
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderTertiary,
  },
  imageContainer: {
    width: '100%',
    height: 140, // Fixed height for image container
    borderRadius: dimensions.borderRadiusMedium,
    overflow: 'hidden',
    marginBottom: dimensions.marginMedium,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  newBadge: {
    backgroundColor: colors.success,
  },
  bestsellerBadge: {
    backgroundColor: colors.accent,
  },
  badgeText: {
    fontSize: typography.fontSizeSmall,
    fontWeight: typography.fontWeightBold,
    color: colors.white,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between', // Distribute content evenly
    height: 120, // Fixed height for content area
  },
  brand: {
    fontSize: typography.fontSizeSmall,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacingWide,
    height: 16, // Fixed height for brand
  },
  name: {
    fontSize: typography.fontSizeNormal,
    fontWeight: typography.fontWeightMedium,
    color: colors.textPrimary,
    lineHeight: typography.lineHeightNormal * typography.fontSizeNormal,
    height: 40, // Fixed height for 2 lines of text
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    height: 20, // Fixed height for rating
  },
  ratingText: {
    fontSize: typography.fontSizeSmall,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    minHeight: 24, // Minimum height for price container
  },
  price: {
    fontSize: typography.fontSizeLarge,
    fontWeight: typography.fontWeightBold,
    color: colors.accent,
    flex: 1,
  },
  stockText: {
    fontSize: typography.fontSizeSmall,
    fontWeight: typography.fontWeightMedium,
    marginLeft: 4,
  },
  inStock: {
    color: colors.success,
  },
  outOfStock: {
    color: colors.error,
  },
}); 