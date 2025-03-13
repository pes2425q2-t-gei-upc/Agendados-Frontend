import { StyleSheet } from 'react-native';

import { colors, spacing } from '@styles/globalStyles';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    elevation: 2,
    marginVertical: spacing.xs,
    padding: 0, // Remove padding to allow image to touch edges
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    flexDirection: 'row',
    height: 120, // Two-column layout
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  categoryTag: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    marginRight: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  contentContainer: {
    flex: 1, // Take remaining space
    justifyContent: 'center',
    marginLeft: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  deleteActionContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 100,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#C70000',
    borderRadius: 8,
    height: '85%',
    justifyContent: 'center',
    marginVertical: spacing.xs,
    width: 60,
  },
  eventImage: {
    borderRadius: 8,
    height: '100%',
    width: '100%',
  },
  eventImageContainer: {
    alignItems: 'center',
    height: 120,
    justifyContent: 'center',
    padding: 8,
    width: 120,
  },
  locationText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 3,
    marginTop: 3,
  },
  tagText: {
    color: colors.darkBackground,
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  timeRange: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 1,
  },
});
