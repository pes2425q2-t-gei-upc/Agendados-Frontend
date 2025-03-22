import { StyleSheet, Dimensions } from 'react-native';

import { colors, spacing } from '@styles/globalStyles';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export const styles = StyleSheet.create({
  bottomSpacer: {
    height: 80,
    marginTop: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: spacing.md,
    position: 'absolute',
    right: 0,
  },
  buyButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 10,
    padding: spacing.md,
    width: '90%',
  },
  buyButtonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: 'bold',
  },

  carouselDotsContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
    borderRadius: 20,
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    position: 'absolute',
  },
  carouselIndicatorActiveDot: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    height: 10,
    marginHorizontal: 4,
    width: 10,
  },
  carouselIndicatorContainer: {},
  carouselIndicatorDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 4,
    height: 8,
    marginHorizontal: 4,
    width: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  categoryTag: {
    backgroundColor: colors.primaryLight,
    borderRadius: 15,
    marginBottom: 5,
    marginRight: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryText: {
    color: colors.darkBackground,
    fontSize: 13,
    fontWeight: '500',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    position: 'relative',
  },
  dateTimeText: {
    color: colors.text,
    fontSize: 15,
    marginBottom: 2,
  },
  description: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'justify',
  },
  dragHandle: {
    alignItems: 'center',
    backgroundColor: colors.background,
    height: 30,
    justifyContent: 'center',
    width: '100%',
  },
  dragHandleBar: {
    backgroundColor: colors.border,
    borderRadius: 3,
    height: 5,
    width: 40,
  },
  eventImage: {
    height: 250,
    width: screenWidth,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  imageCarousel: {
    height: 250,
    marginBottom: spacing.sm,
  },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    height: 200,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  linkButton: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    padding: 12,
  },
  linkText: {
    color: '#0066cc',
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  locationAddress: {
    color: '#666',
    fontSize: 14,
    marginBottom: 6,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  mapButton: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 5,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    width: 100,
  },
  mapButtonText: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: screenHeight * 0.9,
    overflow: 'hidden',
    width: screenWidth,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: screenHeight,
    minHeight: screenHeight * 0.1,
    position: 'absolute',
    width: screenWidth,
  },
  organizerText: {
    color: colors.text,
    fontSize: 15,
  },
  priceText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  sectionContent: {
    marginTop: spacing.xs,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },

  title: {
    color: colors.text,
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: spacing.md,
  },
});
