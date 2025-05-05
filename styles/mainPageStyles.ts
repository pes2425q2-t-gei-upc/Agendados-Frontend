import { StyleSheet } from 'react-native';

import { colors } from '@styles/globalStyles';

export const styles = StyleSheet.create({
  animatedCard: {
    alignItems: 'center',
    flex: 1,
    height: '70%',
    justifyContent: 'center',
    width: '95%',
  },

  card: {
    borderRadius: 10,
    elevation: 12,
    height: '99%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    width: '100%',
  },

  cardInner: {
    padding: 10,
    zIndex: 2,
  },

  dateTag: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: 'absolute',
    right: 10,
    top: 10,
  },

  dateText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },

  gradientContainer: {
    bottom: 0,
    height: '54%',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },

  image: {
    borderRadius: 10,
    height: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: '100%',
  },

  infoButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    borderRadius: 25,
    bottom: 10,
    height: 50,
    justifyContent: 'center',
    padding: 0,
    position: 'absolute',
    right: 10,
    width: 50,
  },

  like: {
    elevation: 1,
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
    zIndex: 1,
  },

  name: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },

  nextCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
  },

  pageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tag: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    flexDirection: 'row',
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
});
