import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
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

import { useFriendship } from '@context/FriendshipContext';
import RoomService from '@services/RoomService';
import WebSocketService from '@services/WebSocketService';
import { colors, spacing } from '@styles/globalStyles';

import ProtectedRoute from './components/ProtectedRoute';

export default function CreateRoomScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [roomName, setRoomName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const { friends } = useFriendship();
  const [loadingCreateRoom, setLoadingCreateRoom] = useState(false);

  const filteredFriends = searchText
    ? friends.filter((friend) =>
        friend.user?.username.toLowerCase().includes(searchText.toLowerCase())
      )
    : friends;

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

      // Create a reference for storing the unsubscribe function
      let unsubscribeFunction: (() => void) | null = null;

      // Subscribe to WebSocket state changes to know when the room is ready
      unsubscribeFunction = WebSocketService.subscribe((state) => {
        if (
          state.roomDetails &&
          state.roomDetails.id === response.code &&
          state.isConnected
        ) {
          router.push({
            pathname: '/roomDetail',
            params: {
              id: state.roomDetails!.id,
              name: state.roomDetails!.name,
              isAdmin: state.roomDetails!.isHost ? '1' : '0',
            },
          });
          if (unsubscribeFunction) {
            unsubscribeFunction();
          } // Clean up only if defined
          setLoadingCreateRoom(false);
        } else if (state.error) {
          Alert.alert(
            'Error',
            `Failed to create room & connect: ${state.error}`
          );
          if (unsubscribeFunction) {
            unsubscribeFunction();
          } // Clean up only if defined
          setLoadingCreateRoom(false);
        }
      });

      // Timeout for WebSocket response
      setTimeout(() => {
        if (loadingCreateRoom) {
          Alert.alert('Error', 'Room creation timed out.');
          if (unsubscribeFunction) {
            unsubscribeFunction();
          }
          setLoadingCreateRoom(false);
          WebSocketService.disconnect();
        }
      }, 10000);
    } catch (error: any) {
      console.error('Error in handleCreateRoom:', error);
      Alert.alert(
        'Error',
        `Failed to create room: ${error.message || 'Unknown error'}`
      );
      setLoadingCreateRoom(false);
    }
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
              Invite friends ({selectedFriends.length} selected)
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
            {!filteredFriends.length && searchText && (
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.textSecondary,
                  marginTop: spacing.md,
                }}
              >
                No friends found matching &quot;{searchText}&quot;.
              </Text>
            )}
            {friends.length === 0 && !searchText && (
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
              {filteredFriends.map(({ friend }) => (
                <TouchableOpacity
                  key={friend!.id}
                  style={[
                    styles.friendItem,
                    selectedFriends.includes(friend!.id!) &&
                      styles.selectedFriendItem,
                  ]}
                  onPress={() => toggleFriendSelection(friend!.id!)}
                >
                  {/* You might want to add an avatar here */}
                  <Ionicons
                    name='person-circle-outline'
                    size={50}
                    color={colors.textSecondary}
                    style={{ marginRight: spacing.sm }}
                  />
                  <Text style={styles.friendName}>
                    {friend?.name ?? friend?.username}
                  </Text>
                  <View style={styles.checkboxContainer}>
                    {selectedFriends.includes(friend!.id!) ? (
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
  avatar: {
    backgroundColor: colors.border,
    borderRadius: 30,
    height: 50,
    marginHorizontal: spacing.sm,
    width: 50,
  },
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
    color: 'black',
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
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
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
