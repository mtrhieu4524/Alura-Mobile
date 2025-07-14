import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, dimensions, typography } from '../../constants';

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onSearch,
  onClear,
  showClearButton = true,
  style,
  ...props
}) {
  const handleClear = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Ionicons 
        name="search" 
        size={dimensions.icon.medium} 
        color={colors.textTertiary || colors.textSecondary} 
        style={styles.searchIcon} 
      />
      
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary || colors.textSecondary}
        returnKeyType="search"
        onSubmitEditing={onSearch}
        {...props}
      />
      
      {showClearButton && value ? (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons 
            name="close-circle" 
            size={dimensions.icon.medium} 
            color={colors.textTertiary || colors.textSecondary} 
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary || '#f9f9f9',
    borderRadius: dimensions.borderRadius.large,
    paddingHorizontal: dimensions.spacing.medium,
    height: dimensions.button.medium,
  },
  searchIcon: {
    marginRight: dimensions.spacing.small,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.large,
    color: colors.textPrimary || colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: dimensions.spacing.small / 2,
  },
}); 