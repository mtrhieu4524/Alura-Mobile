import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const dimensions = {
  // Screen dimensions
  screenWidth: width,
  screenHeight: height,

  // Spacing
  spacing: {
    extraSmall: 4,
    small: 8,
    medium: 12,
    large: 16,
    extraLarge: 24,
    xxLarge: 32,
  },

  // Border radius
  borderRadius: {
    small: 6,
    medium: 8,
    large: 12,
    extraLarge: 16,
    round: 999,
  },

  // Icon sizes
  icon: {
    small: 16,
    medium: 20,
    large: 24,
    extraLarge: 28,
  },

  // Button heights
  button: {
    small: 36,
    medium: 44,
    large: 48,
  },

  // Header heights
  headerHeight: 60,
  tabBarHeight: 60,

  // Product card dimensions
  productCardWidth: width * 0.42,
  productImageHeight: width * 0.35,

  // Avatar sizes
  avatar: {
    small: 32,
    medium: 48,
    large: 64,
  },

  // Legacy support (backward compatibility)
  paddingSmall: 8,
  paddingMedium: 12,
  paddingLarge: 16,
  paddingXLarge: 24,
  marginSmall: 8,
  marginMedium: 12,
  marginLarge: 16,
  marginXLarge: 24,
  borderRadiusSmall: 6,
  borderRadiusMedium: 8,
  borderRadiusLarge: 12,
  borderRadiusXLarge: 16,
  borderRadiusRound: 999,
  iconSmall: 16,
  iconMedium: 20,
  iconLarge: 24,
  iconXLarge: 28,
  buttonSmall: 36,
  buttonMedium: 44,
  buttonLarge: 48,
  avatarSmall: 32,
  avatarMedium: 48,
  avatarLarge: 64,
}; 