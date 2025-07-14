import { StyleSheet, Dimensions } from 'react-native';
import { colors, dimensions, typography } from '../constants';

const { width, height } = Dimensions.get('window');

export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: dimensions.paddingLarge,
  },
  
  screenPadding: {
    paddingHorizontal: dimensions.paddingLarge,
  },
  
  // Flexbox utilities
  flex1: {
    flex: 1,
  },
  
  flexRow: {
    flexDirection: 'row',
  },
  
  flexColumn: {
    flexDirection: 'column',
  },
  
  alignCenter: {
    alignItems: 'center',
  },
  
  justifyCenter: {
    justifyContent: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  spaceAround: {
    justifyContent: 'space-around',
  },
  
  // Text styles
  textCenter: {
    textAlign: 'center',
  },
  
  textLeft: {
    textAlign: 'left',
  },
  
  textRight: {
    textAlign: 'right',
  },
  
  // Typography variants
  heading1: {
    fontSize: typography.fontSizeHuge,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
  },
  
  heading2: {
    fontSize: typography.fontSizeLargeTitle,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
  },
  
  heading3: {
    fontSize: typography.fontSizeHeader,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
  },
  
  bodyLarge: {
    fontSize: typography.fontSizeLarge,
    color: colors.textPrimary,
  },
  
  bodyMedium: {
    fontSize: typography.fontSizeNormal,
    color: colors.textPrimary,
  },
  
  bodySmall: {
    fontSize: typography.fontSizeMedium,
    color: colors.textSecondary,
  },
  
  caption: {
    fontSize: typography.fontSizeSmall,
    color: colors.textSecondary,
  },
  
  // Shadow styles
  shadowSmall: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  shadowMedium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 10,
  },
  
  shadowLarge: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12.0,
    elevation: 16,
  },
  
  // Border styles
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  
  borderAll: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Spacing utilities
  marginSmall: {
    margin: dimensions.marginSmall,
  },
  
  marginMedium: {
    margin: dimensions.marginMedium,
  },
  
  marginLarge: {
    margin: dimensions.marginLarge,
  },
  
  paddingSmall: {
    padding: dimensions.paddingSmall,
  },
  
  paddingMedium: {
    padding: dimensions.paddingMedium,
  },
  
  paddingLarge: {
    padding: dimensions.paddingLarge,
  },
  
  // Section styles
  sectionContainer: {
    paddingHorizontal: dimensions.paddingLarge,
    marginBottom: dimensions.marginLarge,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.marginMedium,
  },
  
  sectionTitle: {
    fontSize: typography.fontSizeXLarge,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
  },
  
  seeAllText: {
    fontSize: typography.fontSizeMedium,
    color: colors.accent,
    fontWeight: typography.fontWeightMedium,
  },
  
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  tabScreenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 100, // Space for floating tab bar
  },
  
  screenTitle: {
    fontSize: typography.sizes.xxLarge,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: dimensions.spacing.large,
  },
  
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  card: {
    backgroundColor: colors.white,
    borderRadius: dimensions.borderRadius.medium,
    padding: dimensions.spacing.medium,
    marginBottom: dimensions.spacing.medium,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.borderRadius.medium,
    padding: dimensions.spacing.medium,
    fontSize: typography.sizes.medium,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  
  inputFocused: {
    borderColor: colors.buttonPrimary,
  },
  
  inputError: {
    borderColor: colors.error,
  },
  
  button: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: dimensions.borderRadius.medium,
    padding: dimensions.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.semiBold,
  },
  
  buttonSecondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
  },
  
  buttonSecondaryText: {
    color: colors.buttonPrimary,
  },
  
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  badgeText: {
    color: colors.white,
    fontSize: typography.sizes.xSmall,
    fontWeight: typography.weights.semiBold,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: dimensions.spacing.medium,
  },
}); 