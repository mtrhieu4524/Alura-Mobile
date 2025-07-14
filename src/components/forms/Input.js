import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, dimensions, typography } from '../../constants';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  showPasswordToggle = false,
  leftIcon,
  rightIcon,
  error,
  style,
  inputStyle,
  ...props
}) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const togglePasswordVisibility = () => {
    setIsSecure(!isSecure);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputContainer, error && styles.errorBorder]}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={isSecure}
          {...props}
        />
        
        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
            <Ionicons 
              name={isSecure ? 'eye-outline' : 'eye-off-outline'} 
              size={dimensions.iconMedium} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !showPasswordToggle && (
          <View style={styles.iconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: dimensions.marginLarge,
  },
  label: {
    fontSize: typography.fontSizeMedium,
    fontWeight: typography.fontWeightMedium,
    color: colors.textPrimary,
    marginBottom: dimensions.marginSmall,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: dimensions.borderRadiusMedium,
    paddingHorizontal: dimensions.paddingMedium,
    height: dimensions.buttonMedium,
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  errorBorder: {
    borderColor: colors.error,
  },
  iconContainer: {
    marginRight: dimensions.marginSmall,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizeLarge,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: typography.fontSizeSmall,
    color: colors.error,
    marginTop: dimensions.marginSmall / 2,
  },
}); 