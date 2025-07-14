import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, dimensions, typography } from '../../constants';

export default function Header({ 
  title, 
  leftIcon, 
  rightIcon, 
  onLeftPress, 
  onRightPress, 
  showBackButton = false,
  navigation 
}) {
  const handleBackPress = () => {
    if (navigation) {
      navigation.goBack();
    }
    if (onLeftPress) {
      onLeftPress();
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={dimensions.iconLarge} color={colors.textPrimary} />
            </TouchableOpacity>
          ) : leftIcon ? (
            <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
              {leftIcon}
            </TouchableOpacity>
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>

        <View style={styles.centerSection}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.rightSection}>
          {rightIcon ? (
            <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
              {rightIcon}
            </TouchableOpacity>
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: dimensions.paddingLarge,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: dimensions.paddingMedium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    height: dimensions.headerHeight,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: dimensions.iconXLarge,
    height: dimensions.iconXLarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSizeXXLarge,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
  },
}); 