/* eslint-disable react-native/sort-styles */
import { StyleSheet } from 'react-native';

import { colors, spacing } from '@styles/globalStyles';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    elevation: 4,
    marginVertical: 5,
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
    width: '100%',
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
    justifyContent: 'center',
    marginBottom: 5,
    marginLeft: 10,
    marginTop: 5,
    overflow: 'hidden',
    width: '60%',
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
    padding: 10,
    alignItems: 'center',
    height: 140,
    justifyContent: 'center',
    width: 120,
  },
  iconTextContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
    width: '100%',
  },
  locationText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 14,
    marginBottom: 3,
    marginTop: 3,
  },
  shareButton: {
    alignSelf: 'flex-end',
    paddingRight: 20,
  },
  tagText: {
    color: colors.primaryDark,
    fontSize: 12,
    maxWidth: '100%',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    width: '100%',
  },
  timeRange: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 4,
  },
});
