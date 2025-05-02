import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ImageBackground,
} from 'react-native';

import { useAuth } from '@context/authContext';
import { colors, spacing } from '@styles/globalStyles';

interface Message {
  username?: string;
  message: string;
  timestamp: string;
  type: 'user' | 'system';
  isCurrentUser?: boolean;
  message_id?: string | number;
  user_id?: number;
}

interface MessageHistory {
  username: string;
  message: string;
  timestamp: string;
  message_id: string | number;
  user_id: number;
}

// Username color generation function
const generateUserColor = (username: string) => {
  const colors = [
    '#FF6B6B', // coral red
    '#4ECDC4', // turquoise
    '#45B7D1', // sky blue
    '#96CEB4', // sage green
    '#FFEEAD', // pale yellow
    '#D4A5A5', // dusty rose
    '#9B59B6', // purple
    '#3498DB', // blue
    '#E67E22', // orange
    '#1ABC9C', // emerald
  ];

  // Generate a consistent index based on username
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use the hash to select a color from the array
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function ChatScreen() {
  const [showRules, setShowRules] = useState(true);
  const { eventId, eventTitle } = useLocalSearchParams();
  const router = useRouter();
  const auth = useAuth(); // Assuming you have an auth context to get the token
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = (animated = true) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated });
    }
  };

  const initializeWebSocket = useCallback(
    (token: string, _currentUsername: string) => {
      ws.current = new WebSocket(
        `wss://agendados-backend-842309366027.europe-southwest1.run.app/ws/chat/event/${eventId}/?token=${token}`
      );

      ws.current.onopen = () => {
        setIsConnected(true);
        setMessages((messages) => [
          ...messages,
          {
            message: 'Conexión establecida con el servidor.',
            timestamp: new Date().toISOString(),
            type: 'system',
          },
        ]);
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const currentUserId = auth.userInfo?.id;

        if (data.message_history) {
          setMessages((_prev) => [
            {
              message: 'Historial de mensajes',
              timestamp: new Date().toISOString(),
              type: 'system',
            },
            ...data.message_history.map((msg: MessageHistory) => ({
              username: msg.username,
              message: msg.message,
              timestamp: msg.timestamp,
              type: 'user' as const,
              isCurrentUser: msg.user_id === currentUserId,
              message_id: msg.message_id,
              user_id: msg.user_id,
            })),
            {
              message: 'Nuevos mensajes',
              timestamp: new Date().toISOString(),
              type: 'system',
            },
          ]);
          requestAnimationFrame(() => scrollToBottom(true));
        } else if (data.message) {
          setMessages((messages) => [
            ...messages,
            {
              username: data.username,
              message: data.message,
              timestamp: data.timestamp,
              type: 'user' as const,
              isCurrentUser: data.user_id === currentUserId,
              message_id: data.message_id,
              user_id: data.user_id,
            },
          ]);
          requestAnimationFrame(() => scrollToBottom(true));
        } else if (data.deleted_message_id) {
          setMessages((prevMessages) =>
            prevMessages.filter(
              (msg) => msg.message_id !== data.deleted_message_id
            )
          );
        } else if (data.error) {
          Alert.alert('Error', data.error);
        }
      };

      ws.current.onerror = (_error) => {
        setMessages((messages) => [
          ...messages,
          {
            message: 'Error al intentar conectar con el servidor.',
            timestamp: new Date().toISOString(),
            type: 'system',
          },
        ]);
      };

      ws.current.onclose = () => {
        setIsConnected(false);
      };
    },
    [eventId, auth]
  );

  const attemptReconnect = async () => {
    const token = auth.getToken();
    const currentUsername = auth.getUsername();

    if (!token || !currentUsername) {
      Alert.alert('Error', 'No se ha encontrado el token de autenticación.');
      return false;
    }

    // Initialize new WebSocket connection
    initializeWebSocket(token, currentUsername);

    // Wait for connection to be established
    return new Promise((resolve) => {
      const checkConnection = () => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          resolve(true);
        } else if (ws.current?.readyState === WebSocket.CLOSED) {
          resolve(false);
        } else {
          setTimeout(checkConnection, 100);
        }
      };
      checkConnection();
    });
  };

  useEffect(() => {
    const token = auth.getToken();
    const currentUsername = auth.getUsername();

    if (!token || !currentUsername) {
      Alert.alert('Error', 'No se ha encontrado el token de autenticación.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    // Initialize WebSocket connection
    initializeWebSocket(token, currentUsername);

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [eventId, router, auth, initializeWebSocket]);

  const handleAcceptRules = () => {
    setShowRules(false);
  };

  const handleSend = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Por favor, ingresa un mensaje.');
      return;
    }

    const sendMessage = () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ message: inputText.trim() }));
        setInputText('');
        requestAnimationFrame(() => scrollToBottom(true));
        return true;
      }
      return false;
    };

    // First attempt to send
    if (!sendMessage()) {
      // If failed, attempt to reconnect
      setMessages((prev) => [
        ...prev,
        {
          message: 'Intentando reconectar...',
          timestamp: new Date().toISOString(),
          type: 'system',
        },
      ]);

      const reconnected = await attemptReconnect();

      if (reconnected) {
        // Try sending again after successful reconnection
        if (sendMessage()) {
          return;
        }
      }

      // If we still couldn't send after reconnecting
      Alert.alert(
        'Error',
        'No se pudo enviar el mensaje. Por favor, inténtalo de nuevo.'
      );
    }
  };

  const handleDelete = (messageId: string | number) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          action: 'delete_message',
          message_id: messageId,
        })
      );
    } else {
      Alert.alert(
        'Error',
        'No se pudo eliminar el mensaje. La conexión está cerrada.'
      );
    }
  };

  const showDeleteConfirmation = (messageId: string | number) => {
    Alert.alert(
      'Eliminar mensaje',
      '¿Estás seguro de que quieres eliminar este mensaje?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => handleDelete(messageId),
          style: 'destructive',
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity
      onLongPress={() => {
        if (item.type === 'user' && item.isCurrentUser && item.message_id) {
          showDeleteConfirmation(item.message_id);
        }
      }}
      activeOpacity={item.type === 'user' && item.isCurrentUser ? 0.7 : 1}
    >
      <View
        style={[
          styles.messageContainer,
          item.type === 'system'
            ? styles.systemMessage
            : item.isCurrentUser
              ? styles.currentUserMessage
              : styles.otherUserMessage,
        ]}
      >
        {item.type === 'user' && item.username && !item.isCurrentUser && (
          <Text
            style={[
              styles.username,
              { color: generateUserColor(item.username) },
            ]}
          >
            {item.username}
          </Text>
        )}
        <Text
          style={[
            styles.messageText,
            item.type === 'system' && styles.systemMessageText,
            item.isCurrentUser && styles.currentUserMessageText,
          ]}
        >
          {item.message}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('@assets/images/FondoXat1.jpg')} // Ruta de tu imagen
      style={styles.container} // Aseguramos que la imagen cubra el contenedor
    >
      <SafeAreaView style={styles.container}>
        <Modal
          animationType='fade'
          transparent={true}
          visible={showRules}
          onRequestClose={handleAcceptRules}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.rulesContainer}>
              <Text style={styles.rulesTitle}>Normas del Chat</Text>

              <View style={styles.rulesList}>
                <Text style={styles.ruleItem}>
                  • Respeta a todos los participantes
                </Text>
                <Text style={styles.ruleItem}>
                  • No insultes ni uses lenguaje ofensivo
                </Text>
                <Text style={styles.ruleItem}>
                  • No hagas spam ni publicidad
                </Text>
                <Text style={styles.ruleItem}>
                  • No compartas información personal
                </Text>
                <Text style={styles.ruleItem}>
                  • Mantén las conversaciones relacionadas con el evento
                </Text>
              </View>

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleAcceptRules}
              >
                <Text style={styles.acceptButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <MaterialIcons name='arrow-back' size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>
              Chat de{' '}
              {eventTitle
                ? `${eventTitle.slice(0, 24)}${eventTitle.length > 24 ? '...' : ''}`
                : 'Evento'}
            </Text>

            {!isConnected && <ActivityIndicator style={styles.loading} />}
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(_, index) => index.toString()}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            onContentSizeChange={() => scrollToBottom(false)}
            onLayout={() => scrollToBottom(false)}
            scrollEventThrottle={16}
          />

          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={() => {}} // TODO: Implement file attachment
            >
              <MaterialIcons
                name='attach-file'
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder='Escribe un mensaje...'
              placeholderTextColor={colors.textSecondary}
              onSubmitEditing={handleSend}
              returnKeyType='send'
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <MaterialIcons
                name='send'
                size={24}
                color={inputText.trim() ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  acceptButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  acceptButtonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  attachButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  container: {
    backgroundColor: 'transparent',
    backgroundImage: 'url("@assets/images/FondoXat1.jpg")',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    flex: 1,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    marginLeft: '20%',
    marginRight: spacing.sm,
  },
  currentUserMessageText: {
    color: colors.lightText,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderBottomColor: colors.border,
    elevation: 4,
    flexDirection: 'row',
    padding: spacing.md,
    paddingTop: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    color: colors.text,
    flex: 1,
    fontSize: 16,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    padding: spacing.sm,
    position: 'absolute',
    right: 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loading: {
    marginLeft: spacing.sm,
  },
  messageContainer: {
    borderRadius: 12,
    marginVertical: spacing.xs,
    padding: spacing.sm,
  },
  messageList: {
    flex: 1,
    width: '100%',
  },
  messageListContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  messageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundAlt,
    marginLeft: spacing.sm,
    marginRight: '20%',
  },
  ruleItem: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  rulesContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    elevation: 5,
    maxWidth: 400,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '90%',
  },
  rulesList: {
    marginBottom: spacing.lg,
  },
  rulesTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  sendButtonDisabled: {
    backgroundColor: colors.backgroundAlt,
    opacity: 0.5,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    marginVertical: spacing.sm,
  },
  systemMessageText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  timestamp: {
    alignSelf: 'flex-end',
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 0,
  },
  title: {
    color: colors.lightText,
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
});
