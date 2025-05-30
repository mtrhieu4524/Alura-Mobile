import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Các vòng tròn trang trí */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />
      <View style={[styles.circle, styles.circle4]} />
      <View style={[styles.circle, styles.circle5]} />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/logoapp.png')} style={styles.logo} resizeMode="contain" />
      </View>
    </View>
  );
}

const CIRCLE_SIZE = width * 0.7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'absolute',
    top: height * 0.32,
    alignSelf: 'center',
    zIndex: 2,
  },
  logo: {
    width: width * 0.6,
    height: width * 0.25,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.18,
  },
  circle1: {
    width: CIRCLE_SIZE * 1.2,
    height: CIRCLE_SIZE * 1.2,
    left: -CIRCLE_SIZE * 0.2,
    top: height * 0.12,
    backgroundColor: '#F7A8A0', // hồng đậm
  },
  circle2: {
    width: CIRCLE_SIZE * 0.25,
    height: CIRCLE_SIZE * 0.25,
    left: width * 0.7,
    top: height * 0.13,
    backgroundColor: '#FFD166', // vàng đậm
  },
  circle3: {
    width: CIRCLE_SIZE * 0.18,
    height: CIRCLE_SIZE * 0.18,
    left: width * 0.15,
    top: height * 0.28,
    backgroundColor: '#8D7BE1', // tím đậm
  },
  circle4: {
    width: CIRCLE_SIZE * 0.18,
    height: CIRCLE_SIZE * 0.18,
    left: width * 0.7,
    top: height * 0.6,
    backgroundColor: '#8D7BE1', // tím đậm
  },
  circle5: {
    width: CIRCLE_SIZE * 0.18,
    height: CIRCLE_SIZE * 0.18,
    left: width * 0.1,
    top: height * 0.75,
    backgroundColor: '#F7A8A0', // hồng đậm
  },
}); 