import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, dimensions, typography } from '../../constants';

export default function OrderSummary({ 
  subtotal, 
  shipping = 0, 
  discount = 0,
  total,
  style 
}) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Order Summary</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>{subtotal.toLocaleString('vi-VN')} VND</Text>
      </View>
      
      {discount > 0 && (
        <View style={styles.row}>
          <Text style={[styles.label, styles.discountLabel]}>Discount</Text>
          <Text style={[styles.value, styles.discountValue]}>
            -{discount.toLocaleString('vi-VN')} VND
          </Text>
        </View>
      )}
      
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')} VND</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: dimensions.borderRadiusLarge,
    padding: dimensions.paddingLarge,
    marginTop: dimensions.marginMedium,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  title: {
    fontSize: typography.fontSizeLarge,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
    marginBottom: dimensions.marginMedium,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: typography.fontSizeNormal,
    color: colors.textSecondary,
  },
  value: {
    fontSize: typography.fontSizeNormal,
    color: colors.textPrimary,
  },
  discountLabel: {
    color: colors.success,
  },
  discountValue: {
    color: colors.success,
  },
  totalRow: {
    marginTop: dimensions.marginMedium,
    paddingTop: dimensions.paddingMedium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: typography.fontSizeLarge,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: typography.fontSizeLarge,
    fontWeight: typography.fontWeightBold,
    color: colors.accent,
  },
}); 