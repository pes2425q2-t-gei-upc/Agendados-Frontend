import { StyleSheet } from 'react-native';

import { colors, spacing } from '@styles/globalStyles';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    elevation: 4,
    marginVertical: 5,
    padding: 10, // Remove padding to allow image to touch edges
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    flexDirection: 'row',
    height: 140,
    width: '100%',
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  categoryTag: {
    backgroundColor: 'rgba(255, 169, 169, 0.37)',
    borderRadius: 12,
    marginRight: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  contentContainer: {
    flex: 1, // Take remaining space
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 5,
    marginLeft: 10,
    marginTop: 5,
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
    height: 120,
    justifyContent: 'center',
    width: 120,
  },
  iconTextContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 3,
    marginTop: 3,
  },
  tagText: {
    color: colors.primaryDark,
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
