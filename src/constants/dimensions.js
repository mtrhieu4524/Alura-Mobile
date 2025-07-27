import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const dimensions = {
  screenWidth: width,
  screenHeight: height,

  spacing: {
    extraSmall: 4,
    small: 8,
    medium: 12,
    large: 16,
    extraLarge: 24,
    xxLarge: 32,
  },

  borderRadius: {
    small: 6,
    medium: 8,
    large: 12,
    extraLarge: 16,
    round: 999,
  },

  icon: {
    small: 16,
    medium: 20,
    large: 24,
    extraLarge: 28,
  },

  
  button: {
    small: 36,
    medium: 44,
    large: 48,
  },

  headerHeight: 60,
  tabBarHeight: 60,

  productCardWidth: width * 0.42,
  productImageHeight: width * 0.35,

  avatar: {
    small: 32,
    medium: 48,
    large: 64,
  },

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