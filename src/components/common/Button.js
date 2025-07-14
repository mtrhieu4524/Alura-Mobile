import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, dimensions, typography } from '../../constants';

export default function Button({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  ...props
}) {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`${variant}Button`], styles[`${size}Button`]];
    
    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${variant}Text`], styles[`${size}Text`]];
    
    if (disabled) {
      baseStyle.push(styles.disabledText);
    }
    
    if (textStyle) {
      baseStyle.push(textStyle);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? colors.white : colors.buttonPrimary} 
          size="small" 
        />
      ) : (
        <>
          {icon && icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dimensions.borderRadiusMedium,
    paddingHorizontal: dimensions.paddingLarge,
  },
  
  // Variants - Cập nhật màu theo website
  primaryButton: {
    backgroundColor: colors.buttonPrimary, // Đen như website
  },
  secondaryButton: {
    backgroundColor: colors.backgroundSecondary, // Cream
  },
  outlineButton: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.buttonPrimary, // Đen
  },
  ghostButton: {
    backgroundColor: colors.transparent,
  },
  
  // Sizes
  smallButton: {
    height: dimensions.buttonSmall,
    paddingHorizontal: dimensions.paddingMedium,
  },
  mediumButton: {
    height: dimensions.buttonMedium,
  },
  largeButton: {
    height: dimensions.buttonLarge,
    paddingHorizontal: dimensions.paddingXLarge,
  },
  
  // Disabled
  disabledButton: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontWeight: typography.fontWeightBold,
    textAlign: 'center',
  },
  
  // Text variants - Cập nhật màu text
  primaryText: {
    color: colors.white, // Trắng trên nền đen
  },
  secondaryText: {
    color: colors.textPrimary, // Đen trên nền cream
  },
  outlineText: {
    color: colors.buttonPrimary, // Đen
  },
  ghostText: {
    color: colors.buttonPrimary, // Đen
  },
  
  // Text sizes
  smallText: {
    fontSize: typography.fontSizeMedium,
  },
  mediumText: {
    fontSize: typography.fontSizeLarge,
  },
  largeText: {
    fontSize: typography.fontSizeXLarge,
  },
  
  // Disabled text
  disabledText: {
    opacity: 0.6,
  },
}); 