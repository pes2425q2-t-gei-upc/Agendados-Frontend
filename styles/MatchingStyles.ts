import { Platform, StyleSheet } from 'react-native';

import { colors, spacing } from '@styles/globalStyles';

export const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 18,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  animatedCard: {
    alignItems: 'center',
    flex: 1,
    height: '60%',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 130 : 100, // Add margin to push card below countdown
    width: '95%',
    marginBottom: 20,
  },
  liveVotesContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: spacing.xs,
    padding: spacing.sm,
    position: 'absolute',
    right: Platform.OS === 'ios' ? 30 : 20,
    top: Platform.OS === 'ios' ? 50 : 20,
  },
  liveVotesText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  nextCardText: {
    color: colors.primary,
    fontSize: 16,
    fontStyle: 'italic',
  },
  noMatchText: {
    color: colors.textSecondary,
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  voteCountText: {
    color: colors.text,
    fontSize: 18,
  },
  voteCountsContainer: {
    alignContent: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    width: '80%',
  },
  votedText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  card: {
    borderRadius: 10,
    elevation: 12,
    height: '60%',
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

  // Added styles for group voting
  countdownContainer: {
    left: 0,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 100 : 70, // More padding for iOS to account for status bar
    position: 'absolute',
    right: 0,
    top: 0, // Start from very top
    zIndex: 10,
  },

  progressBarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    height: 10,
    overflow: 'hidden',
  },

  progressBar: {
    backgroundColor: colors.primary,
    height: '100%',
  },

  timeText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },

  leaveButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    left: 20,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20, // Position below status bar
    width: 40,
    zIndex: 11, // Higher than countdown
  },

  resultsModal: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flex: 1,
    justifyContent: 'center',
  },

  resultsContainer: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },

  resultsTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    justifyContent: 'center',
    marginBottom: 15,
  },

  resultsText: {
    color: colors.text,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },

  countdownCircle: {
    alignItems: 'center',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    marginTop: 10,
    width: 50,
  },

  countdownNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  matchText: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
