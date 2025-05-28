import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

import { CalendarService } from '@services/CalendarService';

export const CalendarTestButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('🧪 Testing Google Calendar connection...');

      // Test the connection
      const isConnected = await CalendarService.testGoogleCalendarConnection();

      if (isConnected) {
        Alert.alert(
          '✅ Éxito',
          'Conexión con Google Calendar establecida correctamente. Ya puedes agregar eventos a tu calendario de Google.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Error',
          'No se pudo conectar con Google Calendar. Asegúrate de haber iniciado sesión con Google.',
          [
            { text: 'OK' },
            {
              text: 'Solicitar permisos',
              onPress: async () => {
                const hasPermissions =
                  await CalendarService.requestCalendarPermissions();
                if (hasPermissions) {
                  Alert.alert(
                    '✅ Permisos concedidos',
                    'Ahora intenta probar la conexión nuevamente.'
                  );
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error testing calendar connection:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error al probar la conexión con Google Calendar.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={testConnection}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? '🔄 Probando...' : '🧪 Probar Google Calendar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
});
