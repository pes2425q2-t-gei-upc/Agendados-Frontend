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
import { colors, spacing } from '@styles/globalStyles';

import ProtectedRoute from './components/ProtectedRoute';
import QRScanner from './components/QRScanner';

export default function RoomsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [LoadingJoinRoom, setLoadingJoinRoom] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const navigateToRoomByCode = async () => {
    setLoadingJoinRoom(true);
    if (!roomCode.trim()) {
      Alert.alert(t('common.error'), t('rooms.pleaseEnterRoomCode'));
      setLoadingJoinRoom(false);
      return;
    }

    await joinRoom(roomCode.trim());
  };

  const handleQRScan = async (data: string) => {
    setShowQRScanner(false);
    setRoomCode(data);
    await joinRoom(data);
  };

  const joinRoom = async (code: string) => {
    try {
      if (!WebSocketService.getState().isConnected) {
        await WebSocketService.connect(code, false, 'Unknown');
      }

      let unsubscribeFunction: (() => void) | null = null;
      let hasNavigated = false;

      unsubscribeFunction = WebSocketService.subscribe((state) => {
        if (hasNavigated) {
          if (unsubscribeFunction) {
            unsubscribeFunction();
            unsubscribeFunction = null;
          }
          return;
        }

        if (
          state.roomDetails &&
          state.roomDetails.id === code &&
          state.isConnected
        ) {
          hasNavigated = true;
          if (unsubscribeFunction) {
            unsubscribeFunction();
            unsubscribeFunction = null;
          }
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
          hasNavigated = true;
          Alert.alert(
            t('common.error'),
            `${t('rooms.failedToCreateRoomConnect')} ${state.error}`
          );
          if (unsubscribeFunction) {
            unsubscribeFunction();
            unsubscribeFunction = null;
          }
          setLoadingJoinRoom(false);
        }
      });

      setTimeout(() => {
        if (!hasNavigated) {
          if (unsubscribeFunction) {
            unsubscribeFunction();
            unsubscribeFunction = null;
          }
          if (LoadingJoinRoom) {
            setLoadingJoinRoom(false);
            Alert.alert(t('rooms.timeout'), t('rooms.couldNotJoinRoom'));
          }
        }
      }, 10000);
    } catch (error) {
      console.error('Error joining room:', error);
      Alert.alert(t('common.error'), t('rooms.failedToJoinRoomGeneric'));
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
              onPress={() => router.push('/(tabs)/chats')}
            >
              <Ionicons name='arrow-back' size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {t('rooms.title') || 'Rooms'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {t('rooms.joinRoom') || 'Join a Room'}
              </Text>
              <Text style={styles.cardDescription}>
                {t('rooms.enterRoomCodeDescription') ||
                  'Enter a room code to join an existing room'}
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.codeInput}
                  placeholder={t('rooms.enterRoomCode') || 'Enter room code'}
                  value={roomCode}
                  onChangeText={setRoomCode}
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize='characters'
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.joinButton,
                      !roomCode.trim() && styles.joinButtonDisabled,
                    ]}
                    onPress={navigateToRoomByCode}
                    disabled={!roomCode.trim() || LoadingJoinRoom}
                  >
                    <Text style={styles.joinButtonText}>
                      {t('rooms.joinRoom') || 'Join Room'}
                    </Text>
                    <Ionicons
                      name='arrow-forward'
                      size={18}
                      color={colors.lightText}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.qrButton}
                    onPress={() => setShowQRScanner(true)}
                    disabled={LoadingJoinRoom}
                  >
                    <Ionicons
                      name='qr-code-outline'
                      size={24}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('common.or') || 'OR'}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.createRoomButton}
              onPress={createNewRoom}
            >
              <Ionicons name='add-circle' size={24} color={colors.lightText} />
              <Text style={styles.createRoomText}>
                {t('rooms.createRoom') || 'Create New Room'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <QRScanner
          visible={showQRScanner}
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: spacing.xs,
  },
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
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
    flex: 1,
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
  qrButton: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 52,
    padding: spacing.md,
  },
});
