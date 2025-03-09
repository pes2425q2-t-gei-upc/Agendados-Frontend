import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#D11149', // Red/Pink - primary brand color
  primaryDark: '#A60D3A', // Darker red for hover/active states
  primaryLight: '#F4587D', // Lighter red for backgrounds/accents

  secondary: '#2E86AB', // Teal blue - secondary brand color
  secondaryDark: '#1A6F92', // Darker teal for hover/active states
  secondaryLight: '#7BBFD9', // Lighter teal for backgrounds/accents

  accent: '#FFA552', // Orange - accent for attention/CTAs

  background: '#F8F1FF', // Light lavender for main backgrounds
  backgroundAlt: '#EDE5F2', // Alternative background for cards/sections
  darkBackground: '#001514', // Very dark teal for dark mode

  text: '#001514', // Very dark teal for main text
  textSecondary: '#4A4A4A', // Secondary text color
  lightText: '#F8F1FF', // Light text for dark backgrounds

  border: '#D1D1D1', // Subtle border color
  borderActive: '#B3B3B3', // Darker border for active elements

  error: '#D11149', // Red for errors (same as primary)
  success: '#4CAF50', // Green for success
  warning: '#FFA552', // Orange for warnings (same as accent)
  info: '#2E86AB', // Blue for info (same as secondary)

  disabled: '#E0E0E0', // For disabled elements
  overlay: 'rgba(0,0,0,0.5)', // For overlays and modals
};

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
    color: '#888888',
  },
};

export const spacing = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
};

export const globalStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 8,
    elevation: 2,
    marginVertical: spacing.sm,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  centeredContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.lg,
  },
  input: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: spacing.sm,
    padding: spacing.sm,
  },
  separator: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.md,
    width: '100%',
  },
});
