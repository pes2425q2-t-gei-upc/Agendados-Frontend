import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import { colors, spacing, typography } from '@styles/globalStyles';

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

export default function RoomsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' or 'friends'

  const navigateToRoom = (roomId: number) => {
    router.push({
      pathname: '/roomDetail',
      params: { id: roomId },
    });
  };

  const createNewRoom = () => {
    router.push('/createRoom');
  };

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name='arrow-back' size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rooms</Text>
          <TouchableOpacity style={styles.addButton} onPress={createNewRoom}>
            <Ionicons name='add' size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rooms' && styles.activeTab]}
            onPress={() => setActiveTab('rooms')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'rooms' && styles.activeTabText,
              ]}
            >
              Rooms
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'friends' && styles.activeTabText,
              ]}
            >
              Friends
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'rooms' ? (
          <FlatList
            data={mockRooms}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.roomItem}
                onPress={() => navigateToRoom(item.id)}
              >
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{item.name}</Text>
                  <Text style={styles.roomCreator}>
                    Created by: {item.createdBy}
                  </Text>
                  <Text style={styles.roomDate}>
                    {item.lastActive.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.participantsPreview}>
                  {item.participants.slice(0, 3).map((participantId) => {
                    const friend = mockFriends.find(
                      (f) => f.id === participantId
                    );
                    return friend ? (
                      <Image
                        key={friend.id}
                        source={{ uri: friend.avatar }}
                        style={styles.participantAvatar}
                      />
                    ) : null;
                  })}
                  {item.participants.length > 3 && (
                    <View style={styles.moreParticipants}>
                      <Text style={styles.moreParticipantsText}>
                        +{item.participants.length - 3}
                      </Text>
                    </View>
                  )}
                </View>
                <Ionicons
                  name='chevron-forward'
                  size={24}
                  color={colors.border}
                />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name='people-outline'
                  size={60}
                  color={colors.border}
                />
                <Text style={styles.emptyText}>No rooms found</Text>
                <TouchableOpacity
                  style={styles.createRoomButton}
                  onPress={createNewRoom}
                >
                  <Text style={styles.createRoomButtonText}>Create a Room</Text>
                </TouchableOpacity>
              </View>
            }
          />
        ) : (
          <FlatList
            data={mockFriends}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.friendItem}>
                <View style={styles.friendAvatarContainer}>
                  <Image
                    source={{ uri: item.avatar }}
                    style={styles.friendAvatar}
                  />
                  {item.online && <View style={styles.onlineIndicator} />}
                </View>
                <Text style={styles.friendName}>{item.name}</Text>
                <TouchableOpacity style={styles.inviteButton}>
                  <Text style={styles.inviteButtonText}>Invite</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name='people-outline'
                  size={60}
                  color={colors.border}
                />
                <Text style={styles.emptyText}>No friends found</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 2,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  addButton: {
    padding: spacing.xs,
  },
  backButton: {
    padding: spacing.xs,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  createRoomButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  createRoomButtonText: {
    color: colors.lightText,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.md,
  },
  friendAvatar: {
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  friendAvatarContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  friendItem: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  friendName: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
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
  inviteButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  inviteButtonText: {
    color: colors.lightText,
    fontWeight: '500',
  },
  listContent: {
    padding: spacing.md,
  },
  moreParticipants: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderColor: colors.background,
    borderRadius: 15,
    borderWidth: 2,
    height: 30,
    justifyContent: 'center',
    marginLeft: -10,
    width: 30,
  },
  moreParticipantsText: {
    color: colors.lightText,
    fontSize: 12,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    backgroundColor: '#4CAF50',
    borderColor: colors.backgroundAlt,
    borderRadius: 6,
    borderWidth: 2,
    bottom: 0,
    height: 12,
    position: 'absolute',
    right: 0,
    width: 12,
  },
  participantAvatar: {
    borderColor: colors.background,
    borderRadius: 15,
    borderWidth: 2,
    height: 30,
    marginLeft: -10,
    width: 30,
  },
  participantsPreview: {
    flexDirection: 'row',
    marginRight: spacing.md,
  },
  roomCreator: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 2,
  },
  roomDate: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomItem: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  roomName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing.sm,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
