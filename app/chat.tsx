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
} from 'react-native';

import { colors, spacing } from '@styles/globalStyles';

interface Message {
  username?: string;
  message: string;
  timestamp: string;
  type: 'user' | 'system';
}

export default function ChatScreen() {
  const { eventId } = useLocalSearchParams();
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

  const handleSend = () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Por favor, ingresa un mensaje.');
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ message: inputText.trim() }));
      setInputText('');
    }
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name='arrow-back' size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Chat del Evento</Text>
        {!isConnected && <ActivityIndicator style={styles.loading} />}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        style={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputContainer}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginRight: spacing.sm,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: spacing.md,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: spacing.sm,
  },
  loading: {
    marginLeft: spacing.sm,
  },
  messageContainer: {
    borderRadius: 8,
    marginVertical: spacing.xs,
    maxWidth: '80%',
    padding: spacing.sm,
  },
  messageList: {
    flex: 1,
    padding: spacing.sm,
  },
  messageText: {
    color: colors.text,
    fontSize: 14,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
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
    marginTop: 4,
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  userMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundAlt,
  },
  username: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
