import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@context/authContext';
import { Friendship } from '@models/Friendship';
import { FriendshipService } from '@services/FriendshipService';
import RoomService from '@services/RoomService';
import WebSocketService from '@services/WebSocketService';
import { colors, spacing } from '@styles/globalStyles';

import ProtectedRoute from './components/ProtectedRoute';

export default function CreateRoomScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();

  const [roomName, setRoomName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [Friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingCreateRoom, setLoadingCreateRoom] = useState(false);

  //Fetching friends from the API
  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await FriendshipService.getFriends();
      setFriends(response);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setError('Error fetching friends');
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = searchText
    ? Friends.filter((friend) =>
        friend.user?.username.toLowerCase().includes(searchText.toLowerCase())
      )
    : Friends;

  const toggleFriendSelection = (friendId: number) => {
    setSelectedFriends((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  const handleCreateRoom = async () => {
    setLoadingCreateRoom(true);
    if (!roomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      setLoadingCreateRoom(false);
      return;
    }

    try {
      const response = await RoomService.createRoom(roomName, selectedFriends);
      if (!WebSocketService.getState().isConnected) {
        await WebSocketService.connect(response.code, true, roomName);
      }

      // Subscribe to WebSocket state changes to know when the room is ready
      const unsubscribe = WebSocketService.subscribe((state) => {
        if (
          state.roomDetails &&
          state.roomDetails.id === response.code &&
          state.isConnected
        ) {
          // Assuming the server sends back roomDetails upon successful creation/joining
          Alert.alert('Success', 'Room created successfully!', [
            {
              text: 'OK',
              onPress: () =>
                router.push({
                  pathname: '/roomDetail',
                  // Pass the room ID from WebSocketService state
                  params: {
                    id: state.roomDetails!.id,
                    name: state.roomDetails!.name,
                    isAdmin: state.roomDetails!.isHost ? '1' : '0',
                  },
                }),
            },
          ]);
          unsubscribe(); // Clean up the subscription
          setLoadingCreateRoom(false);
        } else if (state.error) {
          Alert.alert(
            'Error',
            `Failed to create room & connect: ${state.error}`
          );
          unsubscribe(); // Clean up
          setLoadingCreateRoom(false);
        }
      });

      // Timeout for WebSocket response
      setTimeout(() => {
        if (loadingCreateRoom) {
          // Check if still loading (i.e., room not created)
          Alert.alert('Error', 'Room creation timed out.');
          unsubscribe();
          setLoadingCreateRoom(false);
          // Consider disconnecting if the primary action failed
          WebSocketService.disconnect();
        }
      }, 10000); // 10 seconds timeout
    } catch (error: any) {
      console.error('Error in handleCreateRoom:', error);
      Alert.alert(
        'Error',
        `Failed to create room: ${error.message || 'Unknown error'}`
      );
      setLoadingCreateRoom(false);
    }
    // setLoadingCreateRoom(false); // Moved inside subscribe or catch
  };
  return (
    <ProtectedRoute>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name='arrow-back' size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Room</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps='handled'>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Room Name</Text>
            <TextInput
              style={styles.input}
              value={roomName}
              onChangeText={setRoomName}
              placeholder='Enter room name'
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.friendsSection}>
            <Text style={styles.label}>
              Invite Friends ({selectedFriends.length} selected)
            </Text>

            <View style={styles.searchContainer}>
              <Ionicons
                name='search'
                size={20}
                color={colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholder='Search friends'
                placeholderTextColor={colors.textSecondary}
                clearButtonMode='always'
              />
            </View>
            {loading && (
              <ActivityIndicator
                size='small'
                color={colors.primary}
                style={{ marginTop: spacing.md }}
              />
            )}
            {error && (
              <Text
                style={{
                  color: colors.error,
                  textAlign: 'center',
                  marginTop: spacing.md,
                }}
              >
                {error}
              </Text>
            )}
            {!loading &&
              !error &&
              filteredFriends.length === 0 &&
              searchText && (
                <Text
                  style={{
                    textAlign: 'center',
                    color: colors.textSecondary,
                    marginTop: spacing.md,
                  }}
                >
                  No friends found matching "{searchText}".
                </Text>
              )}
            {!loading && !error && Friends.length === 0 && !searchText && (
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.textSecondary,
                  marginTop: spacing.md,
                }}
              >
                You have no friends to invite yet.
              </Text>
            )}
            <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 200 }}>
              {filteredFriends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={[
                    styles.friendItem,
                    selectedFriends.includes(friend.id!) &&
                      styles.selectedFriendItem,
                  ]}
                  onPress={() => toggleFriendSelection(friend.id!)}
                >
                  {/* You might want to add an avatar here */}
                  <Text style={styles.friendName}>{friend.user?.username}</Text>
                  <View style={styles.checkboxContainer}>
                    {selectedFriends.includes(friend.id!) ? (
                      <Ionicons
                        name='checkmark-circle'
                        size={24}
                        color={colors.primary}
                      />
                    ) : (
                      <Ionicons
                        name='ellipse-outline'
                        size={24}
                        color={colors.textSecondary}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!roomName.trim() || loadingCreateRoom) && styles.disabledButton,
            ]}
            onPress={handleCreateRoom}
            disabled={!roomName.trim() || loadingCreateRoom}
          >
            {loadingCreateRoom ? (
              <ActivityIndicator color={colors.lightText} />
            ) : (
              <Text style={styles.createButtonText}>Create Room</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: spacing.xs,
  },
  checkboxContainer: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  createButtonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: colors.primaryLight,
    opacity: 0.7,
  },
  footer: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    padding: spacing.md,
  },
  friendAvatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  friendAvatarContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  friendItem: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  friendName: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
  },
  friendsSection: {
    marginBottom: spacing.lg,
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
  input: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    padding: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
    marginTop: spacing.md,
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    padding: spacing.sm,
  },
  selectedFriendItem: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary, // Adding transparency
  },
});
