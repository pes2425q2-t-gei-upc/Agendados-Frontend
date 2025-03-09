import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#2E86AB', // Blue - primary brand color
  primaryDark: '#1A6F92', // Darker blue for hover/active states
  primaryLight: '#7BBFD9', // Lighter blue for backgrounds/accents

  secondary: '#FFA552', // Orange - secondary brand color
  secondaryDark: '#E88A37', // Darker orange for hover/active states
  secondaryLight: '#FFCFA3', // Lighter orange for backgrounds/accents

  accent: '#D11149', // Red - accent for attention/CTAs

  background: '#F8F1FF', // Light lavender for main backgrounds
  backgroundAlt: '#EDE5F2', // Alternative background for cards/sections
  darkBackground: '#001514', // Very dark teal for dark mode

  text: '#001514', // Very dark teal for main text
  textSecondary: '#4A4A4A', // Secondary text color
  lightText: '#F8F1FF', // Light text for dark backgrounds

  border: '#D1D1D1', // Subtle border color
  borderActive: '#B3B3B3', // Darker border for active elements

  error: '#D11149', // Red for errors
  success: '#4CAF50', // Green for success
  warning: '#FFA552', // Orange for warnings
  info: '#2E86AB', // Blue for info

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
