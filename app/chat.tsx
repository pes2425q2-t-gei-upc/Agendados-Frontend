import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
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

import { colors, spacing } from '@styles/globalStyles';

interface Message {
  username?: string;
  message: string;
  timestamp: string;
  type: 'user' | 'system';
}

export default function ChatScreen() {
  const [showRules, setShowRules] = useState(true);
  const { eventId, eventTitle } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const token = 'f5944b2c543a7115af8c4c2558c405568f67c1b3'; // Replace with actual token from auth context
    if (!token) {
      Alert.alert('Error', 'No se ha encontrado el token de autenticación.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    // Initialize WebSocket connection
    ws.current = new WebSocket(
      `wss://agendados-backend-842309366027.europe-southwest1.run.app/ws/chat/event/${eventId}/?token=${token}`
    );

    ws.current.onopen = () => {
      console.log('Conexión WebSocket establecida.');
      setIsConnected(true);
      setMessages((prev) => [
        ...prev,
        {
          message: 'Conexión establecida con el servidor.',
          timestamp: new Date().toISOString(),
          type: 'system',
        },
      ]);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message_history) {
        setMessages((prev) => [
          {
            message: 'Historial de mensajes',
            timestamp: new Date().toISOString(),
            type: 'system',
          },
          ...data.message_history.map((msg: any) => ({
            username: msg.username,
            message: msg.message,
            timestamp: msg.timestamp,
            type: 'user',
          })),
          {
            message: 'Nuevos mensajes',
            timestamp: new Date().toISOString(),
            type: 'system',
          },
        ]);
      } else if (data.message) {
        setMessages((prev) => [
          ...prev,
          {
            username: data.username,
            message: data.message,
            timestamp: new Date().toISOString(),
            type: 'user',
          },
        ]);
      }
    };

    ws.current.onerror = (error) => {
      console.error('Error de WebSocket:', error);
      setMessages((prev) => [
        ...prev,
        {
          message: 'Error al intentar conectar con el servidor.',
          timestamp: new Date().toISOString(),
          type: 'system',
        },
      ]);
    };

    ws.current.onclose = () => {
      console.log('Conexión cerrada.');
      setIsConnected(false);
      setMessages((prev) => [
        ...prev,
        {
          message: 'Conexión cerrada.',
          timestamp: new Date().toISOString(),
          type: 'system',
        },
      ]);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [eventId, router]);

  const handleAcceptRules = () => {
    setShowRules(false);
  };

  const handleSend = () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Por favor, ingresa un mensaje.');
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ message: inputText.trim() }));
      setInputText('');
    }

    // Scroll automáticamente al final después de mandar un mensaje
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === 'system' ? styles.systemMessage : styles.userMessage,
      ]}
    >
      {item.type === 'user' && item.username && (
        <Text style={styles.username}>{item.username}</Text>
      )}
      <Text
        style={[
          styles.messageText,
          item.type === 'system' && styles.systemMessageText,
        ]}
      >
        {item.message}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
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
          style={{ flex: 1 }}
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
            contentContainerStyle={{ paddingBottom: 80 }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={() => console.log('Ficheros')} //Falta posar per afegir fotos, fichers, blablabla
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
  loading: {
    marginLeft: spacing.sm,
  },
  messageContainer: {
    borderRadius: 12,
    marginVertical: spacing.xs,
    maxWidth: '80%',
    padding: spacing.sm,
  },
  messageList: {
    flex: 1,
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
  userMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  username: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
});
