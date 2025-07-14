import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, dimensions } from '../../constants';

const services = [
  {
    id: 1,
    icon: 'car-outline',
    title: 'Free shipping',
    description: 'For all orders'
  },
  {
    id: 2,
    icon: 'headset-outline',
    title: 'Hotline support',
    description: 'Customer service'
  },
  {
    id: 3,
    icon: 'shield-checkmark-outline',
    title: 'Instant warranty',
    description: 'If products have problems'
  },
  {
    id: 4,
    icon: 'card-outline',
    title: 'Payment method',
    description: '100% secure payment'
  }
];

export default function ServiceFeatures() {
  return (
    <View style={styles.container}>
      {services.map((service) => (
        <View key={service.id} style={styles.serviceItem}>
          <Ionicons 
            name={service.icon} 
            size={28} 
            color={colors.accent} 
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{service.title}</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: dimensions.spacing.large,
    paddingHorizontal: dimensions.spacing.medium,
    justifyContent: 'space-between',
  },
  serviceItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.small,
  },
  icon: {
    marginBottom: dimensions.spacing.small,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  description: {
    fontSize: typography.sizes.extraSmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
}); 