/* eslint-disable react-native/sort-styles */
import { StyleSheet } from 'react-native';

import { spacing } from '@styles/globalStyles';

export const styles = StyleSheet.create({
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
});
