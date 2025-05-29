import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { requestPasswordReset, resetPassword } from '@services/AuthService';
import { colors, spacing } from '@styles/globalStyles';

interface PasswordResetFormProps {
  onBackToLogin: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onBackToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'info' });

  const handleRequestReset = async () => {
    if (!email) {
      setMessage({
        text: 'Por favor ingresa tu correo electrónico',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: 'info' });

    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        setStep('reset');
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Error al procesar la solicitud',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token || !newPassword) {
      setMessage({
        text: 'Por favor completa todos los campos',
        type: 'error',
      });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        text: 'La contraseña debe tener al menos 6 caracteres',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: 'info' });

    try {
      const result = await resetPassword(token, newPassword);
      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        Alert.alert('Éxito', result.message, [
          { text: 'Aceptar', onPress: onBackToLogin },
        ]);
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Error al restablecer la contraseña',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Contraseña</Text>

      {message.text ? (
        <Text
          style={[
            styles.message,
            message.type === 'error' ? styles.error : styles.success,
          ]}
        >
          {message.text}
        </Text>
      ) : null}

      {step === 'email' ? (
        <>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder='Ingresa tu correo electrónico'
            keyboardType='email-address'
            autoCapitalize='none'
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRequestReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>Enviar Instrucciones</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.label}>Código de verificación</Text>
          <TextInput
            style={styles.input}
            value={token}
            onChangeText={setToken}
            placeholder='Ingresa el código recibido'
            autoCapitalize='none'
            editable={!loading}
          />
          <Text style={styles.label}>Nueva Contraseña</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder='Ingresa tu nueva contraseña'
            secureTextEntry
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>Restablecer Contraseña</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackToLogin}
        disabled={loading}
      >
        <Text style={styles.backButtonText}>Volver al inicio de sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    marginVertical: 'auto',
    maxWidth: 400,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: '90%',
  },
  error: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    height: 50,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  message: {
    borderRadius: 8,
    marginBottom: spacing.md,
    padding: spacing.sm,
    textAlign: 'center',
  },
  success: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  title: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
