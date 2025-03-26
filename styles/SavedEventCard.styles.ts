/* eslint-disable react-native/sort-styles */
import { StyleSheet } from 'react-native';

import { colors, spacing } from '@styles/globalStyles';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    elevation: 4,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    flexDirection: 'row',
    height: 155, // Reduced from 160px for a subtle height decrease
    width: '100%', // Restored to original 100%
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5, // Reduced from 6px
    width: '100%',
    lineHeight: 20,
  },
  categoryTag: {
    backgroundColor: 'rgba(255, 169, 169, 0.37)',
    borderRadius: 12,
    marginRight: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginLeft: 10, // Restored to original 10px
    marginTop: 2,
    paddingRight: 8,
    paddingVertical: 10, // Reduced from 3px for slightly tighter vertical spacing
  },
  deleteActionContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 80,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#C70000',
    borderRadius: 8,
    height: '85%',
    justifyContent: 'center',
    marginVertical: spacing.xs,
    width: 50,
  },
  eventImage: {
    borderRadius: 8,
    height: '100%',
    width: '100%',
  },
  eventImageContainer: {
    alignItems: 'center',
    height: 135, // Reduced from 140px to match new card height
    justifyContent: 'center',
    width: 110, // Restored to original 110px
    margin: 10,
  },
  iconTextContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6, // Reduced from 8px
    marginTop: 2,
    width: '100%',
  },
  locationText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 13,
    marginBottom: 5, // Increased bottom margin
    marginTop: 2,
    numberOfLines: 2,
    ellipsizeMode: 'tail',
  },
  shareButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  tagText: {
    color: colors.primaryDark,
    fontSize: 11, // Reduced from 12
    maxWidth: '100%',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6, // Increased spacing before tags
    marginBottom: 3, // Added bottom margin
    width: '100%',
  },
  timeRange: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
});
