/* eslint-disable react-native/sort-styles */
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';

import WebSocketService, {
  WebSocketServiceState,
} from '@services/WebSocketService'; // Import WebSocketService

import { colors, spacing } from '../styles/globalStyles';

import ProtectedRoute from './components/ProtectedRoute';

export default function RoomDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id: roomIdParam, isAdmin: isAdminParam } = useLocalSearchParams<{
    id: string;
    name: string;
    isAdmin?: string;
  }>();

  const [roomState, setRoomState] = useState<WebSocketServiceState | null>(
    WebSocketService.getState()
  );
  const [loading, setLoading] = useState(true); // For initial load or joining process
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const handleStateUpdate = (newState: WebSocketServiceState) => {
      setRoomState(newState);
      if (newState.roomDetails && newState.roomDetails.id === roomIdParam) {
        setLoading(false);
      } else if (!newState.isConnected && !newState.roomDetails) {
        setLoading(false);
      }
      if (newState.currentEvent != null) {
        setIsStarting(true);
      } else {
        if (newState.error) {
          console.error('WebSocket Error', newState.error);
        }
      }
    };

    const unsubscribe = WebSocketService.subscribe(handleStateUpdate);

    if (!WebSocketService.getState().isConnected) {
      Alert.alert(t('rooms.connectionError'), t('rooms.notConnectedToRoom'));
    } else {
      setLoading(false); // Already connected and in the room
    }

    return () => {
      unsubscribe();
    };
  }, [roomIdParam, t]);

  useEffect(() => {
    if (isStarting) {
      router.push({
        pathname: '/roomMatching',
        params: {
          roomId: roomIdParam,
          roomName: roomState?.roomDetails?.name,
        },
      });
    }
  }, [isStarting]);

  const currentRoom = roomState?.roomDetails;
  const participants = currentRoom?.participants ?? [];
  const isHost = currentRoom?.isHost ?? isAdminParam === '1';

  const handleStartMatching = () => {
    if (!currentRoom || !currentRoom.id) {
      Alert.alert(t('common.error'), t('rooms.roomDetailsNotAvailable'));
      return;
    }
    if (participants.length < 2) {
      Alert.alert(t('rooms.cannotStart'), t('rooms.minTwoParticipants'));
      return;
    }

    setIsStarting(true);
    WebSocketService.startMatching();

    setTimeout(() => {
      setIsStarting(false);
      if (WebSocketService.getState().currentEvent) {
        router.push({
          pathname: '/roomMatching',
          params: { roomId: currentRoom.id, roomName: currentRoom.name },
        });
      }
    }, 1000);
  };

  const handleLeave = () => {
    Alert.alert(t('rooms.leaveRoom'), t('rooms.leaveRoomConfirmation'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('rooms.leave'),
        onPress: () => {
          if (currentRoom && currentRoom.id) {
            WebSocketService.leaveRoom();
          }
          router.replace('/rooms'); // Navigate to rooms list or main screen
        },
        style: 'destructive',
      },
    ]);
  };

  if (loading || !roomState) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={styles.loadingText}>{t('rooms.loadingRoomDetails')}</Text>
      </View>
    );
  }

  if (!currentRoom || currentRoom.id !== roomIdParam) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name='alert-circle-outline' size={60} color={colors.error} />
        <Text style={styles.errorText}>{t('rooms.roomNotFound')}</Text>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.replace('/rooms')}
        >
          <Text style={styles.backButtonText}>{t('rooms.goToRooms')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => handleLeave()} // Or handleLeave if appropriate
          >
            <Ionicons name='arrow-back' size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentRoom.name}</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>{t('rooms.roomInformation')}</Text>
            <View style={styles.infoItem}>
              <Ionicons
                name='cube-outline'
                size={20}
                color={colors.textSecondary}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                {t('rooms.roomId')}: {currentRoom.id}
              </Text>
            </View>
            {isHost && (
              <View style={styles.infoItem}>
                <Ionicons
                  name='star-outline'
                  size={20}
                  color={colors.primary}
                  style={styles.infoIcon}
                />
                <Text style={[styles.infoText, { color: colors.primary }]}>
                  {t('rooms.youAreHost')}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.participantsContainer}>
            <Text style={styles.sectionTitle}>
              {t('rooms.participants')} ({participants.length})
            </Text>
            {participants.length === 0 ? (
              <Text style={styles.noParticipantsText}>
                {t('rooms.noParticipants')}
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.participantsRow}
              >
                {participants.map((participant) => (
                  <View
                    key={participant.id}
                    style={styles.participantContainer}
                  >
                    <Image
                      source={
                        participant.avatar
                          ? { uri: participant.avatar }
                          : require('../assets/images/Icono.png')
                      }
                      style={styles.avatar}
                    />
                    {/* <View style={[styles.onlineIndicator, participant.online && styles.online]} /> */}
                    <Text style={styles.participantName} numberOfLines={1}>
                      {participant.username}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
            <Text style={styles.leaveButtonText}>{t('rooms.leaveRoom')}</Text>
          </TouchableOpacity>
          {isHost && (
            <TouchableOpacity
              style={[
                styles.startButton,
                (isStarting || participants.length < 1) &&
                  styles.startButtonDisabled, // Allow host to start alone for testing, but ideally >= 2
              ]}
              onPress={handleStartMatching}
              disabled={isStarting || participants.length < 1} // Or participants.length < 2 for real use
            >
              {isStarting ? (
                <ActivityIndicator color={colors.lightText} />
              ) : (
                <Text style={styles.startButtonText}>
                  {t('rooms.startMatching')}
                </Text>
              )}
            </TouchableOpacity>
          )}
          {!isHost && (
            <View style={styles.waitingForHostContainer}>
              <Text style={styles.waitingForHostText}>
                {t('rooms.waitingForHost')}
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.border,
    borderRadius: 30,
    height: 60,
    width: 60, // Placeholder background
  },
  avatarContainer: {
    marginBottom: spacing.xs,
    position: 'relative',
  },
  backButton: {
    padding: spacing.xs,
  },
  backButtonError: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    color: colors.lightText, // Changed for better visibility on primary button
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: 18,
    marginVertical: spacing.md,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: colors.backgroundAlt,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: spacing.md, // Added background for footer
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1, // Allow title to take space and center
    marginHorizontal: spacing.sm, // Add margin if back/options buttons are wide
  },
  infoContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  infoItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm, // Reduced margin
  },
  infoText: {
    color: colors.text,
    fontSize: 16,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  leaveButton: {
    alignItems: 'center',
    backgroundColor: colors.background ?? '#FFCDD2', // Softer error color
    borderColor: colors.error,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    marginRight: spacing.md,
    paddingVertical: spacing.md,
  },
  leaveButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  noParticipantsText: {
    color: colors.textSecondary,
    paddingVertical: spacing.md,
    textAlign: 'center',
  },
  optionsButton: {
    padding: spacing.xs,
    minWidth: 40, // Ensure tap area
    alignItems: 'flex-end',
  },
  participantContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 70, // Fixed width for consistency
  },
  participantName: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  participantsContainer: {
    marginBottom: spacing.lg,
  },
  participantsRow: {
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 2, // Take more space than leave button
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  startButtonDisabled: {
    backgroundColor: colors.primaryLight,
    opacity: 0.7,
  },
  startButtonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  waitingForHostContainer: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 2,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  waitingForHostText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontStyle: 'italic',
  },
});
