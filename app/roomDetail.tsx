import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
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

import { useAuth } from '@context/authContext'; // Assuming auth context to get user ID
import { getUserInfo } from '@services/AuthService';
import WebSocketService, {
  WebSocketServiceState,
} from '@services/WebSocketService'; // Import WebSocketService

import { colors, spacing } from '../styles/globalStyles';

import ProtectedRoute from './components/ProtectedRoute';

export default function RoomDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = getUserInfo(); // Get user info from auth service
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
        setLoading(false); // Room details are available
      } else if (!newState.isConnected && !newState.roomDetails) {
        // If disconnected or no room details for this room, might indicate an issue or need to rejoin
        setLoading(false); // Stop loading, UI will show appropriate message
      }
      if (newState.error) {
        Alert.alert('WebSocket Error', newState.error);
      }
    };

    const unsubscribe = WebSocketService.subscribe(handleStateUpdate);

    if (!WebSocketService.getState().isConnected) {
      Alert.alert('Connection Error', 'Not Connected to Room.');
    } else {
      setLoading(false); // Already connected and in the room
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const currentRoom = roomState?.roomDetails;
  const participants = currentRoom?.participants || [];
  const isHost = currentRoom?.isHost || isAdminParam === '1';

  const handleStartMatching = () => {
    if (!currentRoom || !currentRoom.id) {
      Alert.alert('Error', 'Room details not available.');
      return;
    }
    if (participants.length < 2) {
      Alert.alert(
        'Cannot Start',
        'At least two participants are needed to start matching.'
      );
      return;
    }

    setIsStarting(true);
    WebSocketService.startMatching(currentRoom.id);

    // Navigation to roomMatching will be handled by WebSocketService state update (e.g., MATCHING_STARTED)
    // For now, we can optimistically navigate or wait for a specific state change.
    // Let's assume MATCHING_STARTED will trigger a state that roomMatching screen listens to.
    // Or, we can navigate directly if the UX flow expects it.

    // Simulating a delay for the "start" action, then relying on WebSocket to push to matching screen
    // In a real scenario, the server would send a message that matching has started, and that would trigger navigation.
    // For now, let's navigate after a short delay to simulate this.
    setTimeout(() => {
      setIsStarting(false);
      if (WebSocketService.getState().currentEvent) {
        // Check if an event was pushed
        router.push({
          pathname: '/roomMatching',
          params: { roomId: currentRoom.id, roomName: currentRoom.name },
        });
      } else {
        // If no event yet, it might mean the server is still preparing.
        // The roomMatching screen should handle the "waiting for first event" state.
        router.push({
          pathname: '/roomMatching',
          params: { roomId: currentRoom.id, roomName: currentRoom.name },
        });
        // Alert.alert("Waiting", "Waiting for the matching process to begin...");
      }
    }, 1000); // Reduced delay, actual navigation should be event-driven
  };

  const handleInvite = () => {
    // This could be a share intent or a specific in-app invite mechanism
    Alert.alert(
      'Invite Friends',
      `Share this room ID: ${currentRoom?.id}\nOr implement a friend invite system.`,
      [{ text: 'OK' }]
    );
  };

  const handleLeave = () => {
    Alert.alert('Leave Room', 'Are you sure you want to leave this room?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        onPress: () => {
          if (currentRoom && currentRoom.id) {
            WebSocketService.leaveRoom(currentRoom.id);
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
        <Text style={styles.loadingText}>Loading room details...</Text>
      </View>
    );
  }

  if (!currentRoom || currentRoom.id !== roomIdParam) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name='alert-circle-outline' size={60} color={colors.error} />
        <Text style={styles.errorText}>Room not found or unable to join.</Text>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.replace('/rooms')}
        >
          <Text style={styles.backButtonText}>Go to Rooms</Text>
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
            onPress={() => router.back()} // Or handleLeave if appropriate
          >
            <Ionicons name='arrow-back' size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentRoom.name}</Text>
          <TouchableOpacity style={styles.optionsButton} onPress={handleInvite}>
            <Ionicons name='person-add-outline' size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Room Information</Text>
            <View style={styles.infoItem}>
              <Ionicons
                name='cube-outline'
                size={20}
                color={colors.textSecondary}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>Room ID: {currentRoom.id}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons
                name='person-circle-outline'
                size={20}
                color={colors.textSecondary}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>You are: {user?.username}</Text>
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
                  You are the host
                </Text>
              </View>
            )}
          </View>

          <View style={styles.participantsContainer}>
            <Text style={styles.sectionTitle}>
              Participants ({participants.length})
            </Text>
            {participants.length === 0 ? (
              <Text style={styles.noParticipantsText}>
                No other participants yet.
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
                      source={{
                        uri:
                          participant.avatar ||
                          'https://via.placeholder.com/60',
                      }} // Placeholder avatar
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
            <Text style={styles.leaveButtonText}>Leave Room</Text>
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
                <Text style={styles.startButtonText}>Start Matching</Text>
              )}
            </TouchableOpacity>
          )}
          {!isHost && (
            <View style={styles.waitingForHostContainer}>
              <Text style={styles.waitingForHostText}>
                Waiting for host to start...
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
    backgroundColor: colors.errorBackground || '#FFCDD2', // Softer error color
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
    marginTop: spacing.xxs,
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
