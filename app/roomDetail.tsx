import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@styles/globalStyles';

import ProtectedRoute from './components/ProtectedRoute';

// Mock data - in a real implementation, this would come from an API
const mockFriends = [
  {
    id: 1,
    name: 'Alex',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    online: true,
  },
  {
    id: 2,
    name: 'Maria',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    online: true,
  },
  {
    id: 3,
    name: 'John',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    online: false,
  },
  {
    id: 4,
    name: 'Sara',
    avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
    online: true,
  },
  {
    id: 5,
    name: 'Mike',
    avatar: 'https://randomuser.me/api/portraits/men/86.jpg',
    online: true,
  },
];

// Mock rooms data
const mockRooms = [
  {
    id: 1,
    name: 'Weekend Plans',
    createdBy: 'Alex',
    participants: [1, 2, 4],
    lastActive: new Date(),
  },
  {
    id: 2,
    name: 'Concerts Group',
    createdBy: 'Maria',
    participants: [1, 2, 3, 5],
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    name: 'Thursday Night',
    createdBy: 'You',
    participants: [1, 3, 4, 5],
    lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

export default function RoomDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    // Mock API call to fetch room details
    const fetchRoom = () => {
      setTimeout(() => {
        const foundRoom = mockRooms.find((r) => r.id === Number(id));
        if (foundRoom) {
          setRoom(foundRoom);

          // Get participant details
          const participantDetails = foundRoom.participants
            .map((pId) => {
              return mockFriends.find((f) => f.id === pId);
            })
            .filter((p) => p);

          // Add yourself
          participantDetails.push({
            id: 0,
            name: 'You',
            avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
            online: true,
          });

          setParticipants(participantDetails);
        }
        setLoading(false);
      }, 500);
    };

    fetchRoom();
  }, [id]);

  const handleStartMatching = () => {
    setIsStarting(true);

    // Mock start matching process
    setTimeout(() => {
      setIsStarting(false);

      // Navigate to matching screen
      router.push({
        pathname: '/roomMatching',
        params: { roomId: id, name: room.name },
      });
    }, 1500);
  };

  const handleInvite = () => {
    Alert.alert(
      'Invite Friends',
      'Do you want to invite friends to this room?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => Alert.alert('Invitation sent!') },
      ]
    );
  };

  const handleLeave = () => {
    Alert.alert('Leave Room', 'Are you sure you want to leave this room?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        onPress: () => {
          router.back();
        },
        style: 'destructive',
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={styles.loadingText}>Loading room details...</Text>
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name='alert-circle-outline' size={60} color={colors.error} />
        <Text style={styles.errorText}>Room not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name='arrow-back' size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{room.name}</Text>
            <TouchableOpacity
              style={styles.optionsButton}
              onPress={handleInvite}
            >
              <Ionicons name='person-add' size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.participantsContainer}>
              <Text style={styles.sectionTitle}>Waiting Room</Text>
              <Text style={styles.participantsCount}>
                {participants.length} / 7 participants
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.participantsRow}
              >
                {participants.map((participant) => (
                  <View
                    key={participant.id}
                    style={styles.participantContainer}
                  >
                    <View style={styles.avatarContainer}>
                      <Image
                        source={{ uri: participant.avatar }}
                        style={styles.avatar}
                      />
                      {participant.online && (
                        <View style={styles.onlineIndicator} />
                      )}
                    </View>
                    <Text style={styles.participantName} numberOfLines={1}>
                      {participant.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>How it works:</Text>
              <View style={styles.infoItem}>
                <Ionicons
                  name='people'
                  size={24}
                  color={colors.primary}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>Invite friends to this room</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons
                  name='play'
                  size={24}
                  color={colors.primary}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  Press start to begin matching events
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons
                  name='thumbs-up'
                  size={24}
                  color={colors.primary}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  Everyone swipes on the same events
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons
                  name='checkmark-circle'
                  size={24}
                  color={colors.primary}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  Find matches that everyone likes
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
              <Text style={styles.leaveButtonText}>Leave</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.startButton,
                isStarting && styles.startButtonDisabled,
              ]}
              onPress={handleStartMatching}
              disabled={isStarting}
            >
              {isStarting ? (
                <ActivityIndicator color={colors.lightText} />
              ) : (
                <Text style={styles.startButtonText}>Start</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 30,
    height: 60,
    width: 60,
  },
  avatarContainer: {
    marginBottom: spacing.xs,
    position: 'relative',
  },
  backButton: {
    padding: spacing.xs,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
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
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: spacing.md,
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  infoItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
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
    backgroundColor: 'transparent',
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
  onlineIndicator: {
    backgroundColor: '#4CAF50',
    borderColor: colors.background,
    borderRadius: 6,
    borderWidth: 2,
    bottom: 0,
    height: 12,
    position: 'absolute',
    right: 0,
    width: 12,
  },
  optionsButton: {
    padding: spacing.xs,
  },
  participantContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 70,
  },
  participantName: {
    color: colors.text,
    fontSize: 12,
    textAlign: 'center',
  },
  participantsContainer: {
    marginBottom: spacing.lg,
  },
  participantsCount: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  participantsRow: {
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 2,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  startButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  startButtonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
});
