import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, dimensions, typography } from '../../constants';

export default function Button({
  title,
  onPress,
  variant = 'primary', 
  size = 'medium', 
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
  
  primaryButton: {
    backgroundColor: colors.buttonPrimary, 
  },
  secondaryButton: {
    backgroundColor: colors.backgroundSecondary, 
  },
  outlineButton: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.buttonPrimary, 
  },
  ghostButton: {
    backgroundColor: colors.transparent,
  },
  
  
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
  
  
  disabledButton: {
    opacity: 0.5,
  },
  
  
  text: {
    fontWeight: typography.fontWeightBold,
    textAlign: 'center',
  },
  
  primaryText: {
    color: colors.white, 
  },
  secondaryText: {
    color: colors.textPrimary, 
  },
  outlineText: {
    color: colors.buttonPrimary, 
  },
  ghostText: {
    color: colors.buttonPrimary, 
  },
  
  
  smallText: {
    fontSize: typography.fontSizeMedium,
  },
  mediumText: {
    fontSize: typography.fontSizeLarge,
  },
  largeText: {
    fontSize: typography.fontSizeXLarge,
  },
  
  
  disabledText: {
    opacity: 0.6,
  },
}); 