import React, { useState } from 'react';
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
  const [imageError, setImageError] = useState(false);

  const getImageSource = () => {
    if (imageError) {
      return require('../../../assets/product1.png');
    }

    if (product.image) {
      if (typeof product.image === 'string') {
        return { uri: product.image };
      }
      return product.image;
    }
    
    return require('../../../assets/product1.png'); 
  };

  const handleImageError = () => {
    console.log('⚠️ Error loading image for product:', product.name, 'URL:', product.image);
    setImageError(true);
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image 
          source={getImageSource()} 
          style={styles.image}
          defaultSource={require('../../../assets/product1.png')}
          onError={handleImageError}
          resizeMode="cover"
        />
        
        {product.isBestseller && (
          <View style={[styles.badge, styles.bestsellerBadge]}>
            <Text style={styles.badgeText}>Hot</Text>
          </View>
        )}

        {product.stock !== undefined && product.stock <= 0 && (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutText}>Sold Out</Text>
          </View>
        )}

        {product.stock !== undefined && product.stock > 0 && (
          <View style={styles.stockLabel}>
            <Text style={styles.stockLabelText}>
              {product.stock} Left
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        {showBrand && product.brand && (
          <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
        )}
        
        <Text style={styles.name} numberOfLines={2}>
          {product.name || 'Sản phẩm không tên'}
        </Text>
        
        {showRating && (
          <View style={styles.ratingContainer}>
            <StarRating rating={product.rating || 0} size={12} />
            <Text style={styles.ratingText}>({product.rating || 0})</Text>
          </View>
        )}
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {(product.price || 0).toLocaleString('vi-VN')} VND
          </Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>
              {product.originalPrice.toLocaleString('vi-VN')} VND
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
    minHeight: 280, 
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
    height: 140, 
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
    justifyContent: 'space-between', 
    height: 120, 
  },
  brand: {
    fontSize: typography.fontSizeSmall,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacingWide,
    height: 16, 
  },
  name: {
    fontSize: typography.fontSizeNormal,
    fontWeight: typography.fontWeightMedium,
    color: colors.textPrimary,
    lineHeight: typography.lineHeightNormal * typography.fontSizeNormal,
    height: 40, 
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    height: 20, 
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
    minHeight: 24, 
  },
  price: {
    fontSize: typography.fontSizeLarge,
    fontWeight: typography.fontWeightBold,
    color: colors.accent,
    flex: 1,
  },
  originalPrice: {
    fontSize: typography.fontSizeSmall,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  soldOutBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: dimensions.borderRadiusMedium,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  soldOutText: {
    fontSize: typography.fontSizeLarge,
    fontWeight: typography.fontWeightBold,
    color: colors.white,
    textAlign: 'center',
  },
  stockLabel: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.success,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    zIndex: 2,
  },
  stockLabelText: {
    fontSize: typography.fontSizeSmall,
    fontWeight: typography.fontWeightBold,
    color: colors.white,
    textAlign: 'center',
  },
}); 