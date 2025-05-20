import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';

import { colors, spacing } from '@styles/globalStyles';

import ProtectedRoute from './components/ProtectedRoute';

// Mock data for friends
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

export default function CreateRoomScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [roomName, setRoomName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filteredFriends = searchText
    ? mockFriends.filter((friend) =>
        friend.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : mockFriends;

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  const handleCreateRoom = () => {
    if (!roomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert(
        'Error',
        'Please select at least one friend to create a room'
      );
      return;
    }

    // In a real app, this would create the room via an API call
    // For now, we'll just navigate back to the rooms list
    Alert.alert('Success', 'Room created successfully!', [
      {
        text: 'OK',
        onPress: () =>
          router.push({
            pathname: '/roomDetail',
            params: { code: 1 },
          }),
      },
    ]);
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

          <View style={styles.toggleContainer}>
            <Text style={styles.label}>Private Room</Text>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isPrivate ? colors.primary : '#f4f3f4'}
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
                      source={{ uri: item.avatar }}
                      style={styles.friendAvatar}
                    />
                    {item.online && <View style={styles.onlineIndicator} />}
                  </View>
                  <Text style={styles.friendName}>{item.name}</Text>
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
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!roomName.trim() || selectedFriends.length === 0) &&
                styles.disabledButton,
            ]}
            onPress={handleCreateRoom}
            disabled={!roomName.trim() || selectedFriends.length === 0}
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
  onlineIndicator: {
    backgroundColor: '#4CAF50',
    borderColor: colors.backgroundAlt,
    borderRadius: 5,
    borderWidth: 1.5,
    bottom: 0,
    height: 10,
    position: 'absolute',
    right: 0,
    width: 10,
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
  toggleContainer: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
});
