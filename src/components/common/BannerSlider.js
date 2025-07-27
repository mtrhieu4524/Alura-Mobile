import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, dimensions } from '../../constants';

const { width } = Dimensions.get('window');

const bannerData = [
  {
    id: 1,
    title: 'COSMETICS',
    subtitle: 'C L A S S I C   C O S M E T I C',
    buttonText: 'SHOP THIS CATEGORY',
    image: require('../../../assets/facialcosmetics.png'),
    category: 'cosmetics'
  },
  {
    id: 2,
    title: 'MEDICAL &\nTREATMENT',
    subtitle: 'C L A S S I C   C O S M E T I C',
    buttonText: 'SHOP THIS CATEGORY',
    image: require('../../../assets/skincare.png'),
    category: 'treatments'
  },
];

export default function BannerSlider() {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % bannerData.length;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const navigateToCategory = (category) => {
    navigation.navigate('MainTabs', { 
      screen: 'Shop',
      params: { category }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {bannerData.map((item) => (
          <View key={item.id} style={styles.slide}>
            <View style={styles.backgroundGradient} />
            <Image source={item.image} style={styles.backgroundImage} />
            
            <View style={styles.content}>
              <View style={styles.leftContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
                
                <TouchableOpacity 
                  style={styles.shopButton}
                  onPress={() => navigateToCategory(item.category)}
                >
                  <Text style={styles.shopButtonText}>{item.buttonText}</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.rightContent}>
                <Image source={item.image} style={styles.productImage} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {bannerData.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentIndex ? colors.white : 'rgba(255,255,255,0.5)' }
            ]}
            onPress={() => {
              setCurrentIndex(index);
              scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    position: 'relative',
  },
  slide: {
    width,
    height: 280,
    position: 'relative',
    justifyContent: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: dimensions.spacing.large,
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
    zIndex: 2,
  },
  rightContent: {
    flex: 1,
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginBottom: dimensions.spacing.small,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
    marginBottom: dimensions.spacing.large,
    letterSpacing: 2,
  },
  shopButton: {
    backgroundColor: colors.text,
    paddingHorizontal: dimensions.spacing.large,
    paddingVertical: dimensions.spacing.medium,
    borderRadius: 0,
    alignSelf: 'flex-start',
  },
  shopButtonText: {
    color: colors.white,
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: dimensions.borderRadius.medium,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
}); 