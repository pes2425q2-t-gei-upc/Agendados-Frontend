/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-native/no-unused-styles */
/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  Share,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import RoomService from '@services/RoomService';
import WebSocketService from '@services/WebSocketService';
import { colors, spacing } from '@styles/globalStyles';

import ProtectedRoute from './components/ProtectedRoute';

export default function CreateRoomScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [roomName, setRoomName] = useState('');
  const [loadingCreateRoom, setLoadingCreateRoom] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = async () => {
    setLoadingCreateRoom(true);
    if (!roomName.trim()) {
      Alert.alert(t('common.error'), t('rooms.enterRoomName'));
      setLoadingCreateRoom(false);
      return;
    }

    try {
      const response = await RoomService.createRoom(roomName, []);
      setRoomCode(response.code);
      setRoomCreated(true);

      // Auto-connect to WebSocket after creating room (like original code)
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
          // Don't auto-navigate, just show QR and let user choose when to join
          if (unsubscribeFunction) {
            unsubscribeFunction();
          }
          setLoadingCreateRoom(false);
        } else if (state.error) {
          Alert.alert(
            t('common.error'),
            `${t('rooms.failedToCreateRoomConnect')} ${state.error}`
          );
          if (unsubscribeFunction) {
            unsubscribeFunction();
          }
          setLoadingCreateRoom(false);
        }
      });

      // Timeout for WebSocket response
      setTimeout(() => {
        if (loadingCreateRoom) {
          Alert.alert(t('common.error'), t('rooms.roomCreationTimedOut'));
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
        t('common.error'),
        t('rooms.roomCreateError') +
          `: ${error.message ?? t('rooms.unknownError')}`
      );
      setLoadingCreateRoom(false);
    }
  };

  const handleJoinRoom = async () => {
    // Check if already connected (should be from handleCreateRoom)
    const currentState = WebSocketService.getState();
    if (currentState.isConnected && currentState.roomDetails?.id === roomCode) {
      // Navigate directly since we're already connected
      router.push({
        pathname: '/roomDetail',
        params: {
          id: currentState.roomDetails.id,
          name: currentState.roomDetails.name,
          isAdmin: currentState.roomDetails.isHost ? '1' : '0',
        },
      });
    } else {
      // Fallback: connect if not already connected
      if (!currentState.isConnected) {
        await WebSocketService.connect(roomCode, true, roomName);
      }

      let unsubscribeFunction: (() => void) | null = null;

      unsubscribeFunction = WebSocketService.subscribe((state) => {
        if (
          state.roomDetails &&
          state.roomDetails.id === roomCode &&
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
          }
        } else if (state.error) {
          Alert.alert(
            t('common.error'),
            `${t('rooms.failedToJoinRoom')} ${state.error}`
          );
          if (unsubscribeFunction) {
            unsubscribeFunction();
          }
        }
      });

      // Timeout for WebSocket response
      setTimeout(() => {
        Alert.alert(t('common.error'), t('rooms.roomJoinTimedOut'));
        if (unsubscribeFunction) {
          unsubscribeFunction();
        }
        WebSocketService.disconnect();
      }, 10000);
    }
  };

  const handleShareRoom = async () => {
    try {
      await Share.share({
        message: `${t('rooms.scanToJoin')}: ${roomCode}`,
        title: t('rooms.shareRoom'),
      });
    } catch (error) {
      console.error('Error sharing room:', error);
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
          <Text style={styles.headerTitle}>{t('rooms.createRoom')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps='handled'>
          {!roomCreated ? (
            // Room creation form
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('rooms.roomName')}</Text>
                <TextInput
                  style={styles.input}
                  value={roomName}
                  onChangeText={setRoomName}
                  placeholder={t('rooms.enterRoomName')}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </>
          ) : (
            // QR Code display
            <View style={styles.qrContainer}>
              <View style={styles.successContainer}>
                <Ionicons
                  name='checkmark-circle'
                  size={48}
                  color={colors.primary}
                  style={styles.successIcon}
                />
                <Text style={styles.successTitle}>
                  {t('rooms.roomCreated')}
                </Text>
                <Text style={styles.successSubtitle}>
                  {t('rooms.roomCode')}: {roomCode}
                </Text>
              </View>

              <View style={styles.qrCodeContainer}>
                <Text style={styles.qrCodeTitle}>{t('rooms.qrCode')}</Text>
                <Text style={styles.qrCodeSubtitle}>
                  {t('rooms.scanToJoin')}
                </Text>

                <View style={styles.qrCodeWrapper}>
                  <QRCode
                    value={roomCode}
                    size={200}
                    color={colors.text}
                    backgroundColor={colors.background}
                  />
                </View>

                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleShareRoom}
                >
                  <Ionicons name='share' size={20} color={colors.lightText} />
                  <Text style={styles.shareButtonText}>
                    {t('rooms.shareQRCode')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {!roomCreated ? (
            <TouchableOpacity
              style={[
                styles.createButton,
                (!roomName.trim() || loadingCreateRoom) &&
                  styles.disabledButton,
              ]}
              onPress={handleCreateRoom}
              disabled={!roomName.trim() || loadingCreateRoom}
            >
              {loadingCreateRoom ? (
                <ActivityIndicator color={colors.lightText} />
              ) : (
                <Text style={styles.createButtonText}>
                  {t('rooms.createRoom')}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleJoinRoom}
            >
              <Text style={styles.createButtonText}>{t('rooms.joinRoom')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: spacing.xs,
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
  header: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 80 : 0,
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
  qrCodeContainer: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: spacing.xl,
    width: '100%',
  },
  qrCodeSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  qrCodeTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  qrCodeWrapper: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  qrContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  shareButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  shareButtonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  successSubtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  successTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
