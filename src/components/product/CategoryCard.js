import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, dimensions, typography } from '../../constants';

export default function CategoryCard({ 
  category, 
  onPress, 
  style,
  showOverlay = true 
}) {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <Image source={category.image} style={styles.image} />
      
      {showOverlay && (
        <View style={styles.overlay} />
      )}
      
      <View style={styles.content}>
        <Text style={styles.name}>{category.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: (dimensions.screenWidth - dimensions.paddingLarge * 2 - dimensions.marginMedium) / 2,
    height: 120,
    borderRadius: dimensions.borderRadiusLarge,
    overflow: 'hidden',
    marginBottom: dimensions.marginMedium,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.black,
    opacity: 0.3,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: dimensions.paddingMedium,
    justifyContent: 'flex-end',
  },
  name: {
    fontSize: typography.fontSizeLarge,
    fontWeight: typography.fontWeightBold,
    color: colors.white,
    textAlign: 'center',
  },
}); 