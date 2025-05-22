import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { use } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Friendship } from '@models/Friendship';
import { FriendshipService } from '@services/FriendshipService';
import RoomService from '@services/RoomService';
import { colors, spacing } from '@styles/globalStyles';

import ProtectedRoute from './components/ProtectedRoute';

export default function CreateRoomScreen() {
  const { t } = useTranslation();
  const router = useRouter();

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
      //await RoomService.createRoom(roomName, selectedFriends);
      Alert.alert('Success', 'Room created successfully!', [
        {
          text: 'OK',
          onPress: () =>
            router.push({
              pathname: '/roomDetail',
              params: { id: 1, name: roomName }, // Replace with actual room code
            }),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create room');
    } finally {
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
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={colors.primary} />
                <Text style={styles.loadingText}>Loading friends...</Text>
              </View>
            )}
            {error && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{error}</Text>
              </View>
            )}
            {!loading && !error && (
              <FlatList
                data={filteredFriends}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.friendItem,
                      selectedFriends.includes(item.id) &&
                        styles.selectedFriendItem,
                    ]}
                    onPress={() => toggleFriendSelection(item.id)}
                  >
                    <View style={styles.friendAvatarContainer}>
                      <Image
                        source={{ uri: item.user?.avatar }}
                        style={styles.friendAvatar}
                      />
                    </View>
                    <Text style={styles.friendName}>{item.user?.name}</Text>
                    <View style={styles.checkboxContainer}>
                      {selectedFriends.includes(item.id) && (
                        <Ionicons
                          name='checkmark-circle'
                          size={24}
                          color={colors.primary}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              !roomName.trim() && styles.disabledButton,
            ]}
            onPress={handleCreateRoom}
            disabled={loading || loadingCreateRoom}
          >
            <Text style={styles.createButtonText}>Create Room</Text>
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
