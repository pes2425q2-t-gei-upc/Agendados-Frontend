import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import WebSocketService from '@services/WebSocketService';
import { colors, spacing, typography } from '@styles/globalStyles';

import ProtectedRoute from './components/ProtectedRoute';

export default function RoomsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [LoadingJoinRoom, setLoadingJoinRoom] = useState(false);

  const navigateToRoomByCode = async () => {
    setLoadingJoinRoom(true);
    if (!roomCode.trim()) {
      Alert.alert('Error', 'Please enter a room code');
      setLoadingJoinRoom(false);
      return;
    }

    try {
      if (!WebSocketService.getState().isConnected) {
        await WebSocketService.connect(roomCode, false, 'Unknown');
      }

      // Create a reference for storing the unsubscribe function
      let unsubscribeFunction: (() => void) | null = null;

      // Subscribe to WebSocket state changes to know when the room is ready
      unsubscribeFunction = WebSocketService.subscribe((state) => {
        if (
          state.roomDetails &&
          state.roomDetails.id === roomCode &&
          state.isConnected
        ) {
          if (unsubscribeFunction) {
            unsubscribeFunction();
          } // Clean up only if defined
          router.push({
            pathname: '/roomDetail',
            params: {
              id: state.roomDetails!.id,
              name: state.roomDetails!.name,
              isAdmin: state.roomDetails!.isHost ? '1' : '0',
            },
          });
          setLoadingJoinRoom(false);
        } else if (state.error) {
          Alert.alert('Error', `Failed to join room & connect: ${state.error}`);
          if (unsubscribeFunction) {
            unsubscribeFunction();
          } // Clean up only if defined
          setLoadingJoinRoom(false);
        }
      });
    } catch (error) {
      console.error('Error joining room:', error);
      Alert.alert('Error', 'Failed to join room. Please try again.');
      setLoadingJoinRoom(false);
    }
  };

  const createNewRoom = () => {
    router.push('/createRoom');
  };

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name='arrow-back' size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Rooms</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Join a Room</Text>
              <Text style={styles.cardDescription}>
                Enter a room code to join an existing room
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.codeInput}
                  placeholder='Enter room code'
                  value={roomCode}
                  onChangeText={setRoomCode}
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize='characters'
                />
                <TouchableOpacity
                  style={[
                    styles.joinButton,
                    !roomCode.trim() && styles.joinButtonDisabled,
                  ]}
                  onPress={navigateToRoomByCode}
                  disabled={!roomCode.trim() || LoadingJoinRoom}
                >
                  <Text style={styles.joinButtonText}>Join Room</Text>
                  <Ionicons
                    name='arrow-forward'
                    size={18}
                    color={colors.lightText}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.createRoomButton}
              onPress={createNewRoom}
            >
              <Ionicons name='add-circle' size={24} color={colors.lightText} />
              <Text style={styles.createRoomText}>Create New Room</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: spacing.xs,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    elevation: 2,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  codeInput: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  createRoomButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.md,
  },
  createRoomText: {
    color: colors.lightText,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  dividerLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingHorizontal: spacing.md,
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
  inputContainer: {
    width: '100%',
  },
  joinButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.md,
  },
  joinButtonDisabled: {
    backgroundColor: colors.primaryLight,
    opacity: 0.7,
  },
  joinButtonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  keyboardView: {
    flex: 1,
  },
  placeholder: {
    padding: spacing.xs,
    width: 24,
  },
});
