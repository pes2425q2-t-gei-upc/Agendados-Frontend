import { colors, spacing } from '@styles/globalStyles';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    elevation: 2,
    marginVertical: spacing.xs,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  categoryTag: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    marginBottom: 5,
    marginRight: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
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
  locationText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 14,
    textAlign: 'left',
  },
  priceTag: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    minWidth: 45,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  priceText: {
    color: colors.darkBackground,
    fontSize: 14,
    fontWeight: 'bold',
  },
  shareButton: {
    padding: spacing.xs,
  },
  tagText: {
    color: colors.darkBackground,
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  timeRange: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
});
