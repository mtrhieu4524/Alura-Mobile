import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { colors, dimensions } from '../../constants';

export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = dimensions.iconMedium,
  color = colors.star,
  emptyColor = colors.textTertiary,
  style,
}) {
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= maxStars; i++) {
      const isFilled = i <= Math.round(rating);
      
      stars.push(
        <FontAwesome
          key={i}
          name={isFilled ? 'star' : 'star-o'}
          size={size}
          color={isFilled ? color : emptyColor}
          style={styles.star}
        />
      );
    }
    
    return stars;
  };

  return (
    <View style={[styles.container, style]}>
      {renderStars()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
}); 