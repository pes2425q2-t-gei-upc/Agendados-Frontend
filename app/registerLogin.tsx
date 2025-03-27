/* eslint-disable react-native/no-inline-styles */
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { login, register } from '@services/AuthService';

import { colors, spacing } from '../styles/globalStyles';

export default function RegisterLoginPage() {
  const router = useRouter();
  const { t } = useTranslation(); // Inicializar el hook de traducción
  const [showLogin, setShowLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Usado solo en registro
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validación básica de email
  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleLogin = async () => {
    setErrorMessage('');

    if (!username || !password) {
      setErrorMessage(t('auth.completeFields'));
      return;
    }

    try {
      setLoading(true);
      // Suponiendo que la función login retorna un objeto con { user, error }
      const response = await login(username, password);
      // Si el backend indica que el usuario no existe o la contraseña es incorrecta
      if (response.error) {
        // Aquí puedes filtrar distintos mensajes de error
        setErrorMessage(response.error);
        return;
      }
      // Si todo está bien, se navega a la pantalla principal
      router.replace('/(tabs)/main');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // También puedes detectar errores específicos en el catch
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(t('auth.loginError'));
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setErrorMessage('');

    if (!username || !email || !password) {
      setErrorMessage(t('auth.completeFields'));
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage(t('auth.invalidEmail'));
      return;
    }

    if (password.length < 6) {
      setErrorMessage(t('auth.passwordLength'));
      return;
    }

    try {
      setLoading(true);
      const response = await register(username, email, password);
      console.log(response);
      router.replace('/(tabs)/main');
    } catch (error) {
      setErrorMessage(t('auth.registerError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[
        colors.primaryLight || '#ff9a9e',
        colors.secondaryLight || '#ffc3a0',
      ]}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          {showLogin ? t('auth.login') : t('auth.register')}
        </Text>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {showLogin ? (
          <>
            <TextInput
              style={styles.input}
              placeholder={t('auth.username')}
              placeholderTextColor='#999'
              value={username}
              onChangeText={setUsername}
              autoCapitalize='none'
              keyboardType='default'
            />
            <TextInput
              style={styles.input}
              placeholder={t('auth.password')}
              placeholderTextColor='#999'
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={[
                styles.button,
                loading && { backgroundColor: colors.disabled },
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size='small' color='#fff' />
              ) : (
                <Text style={styles.buttonText}>{t('auth.loginButton')}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowLogin(false);
                setUsername('');
                setEmail('');
                setPassword('');
              }}
              disabled={loading}
            >
              <Text style={styles.switchText}>
                {t('auth.switchToRegister')}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder={t('auth.username')}
              placeholderTextColor='#999'
              value={username}
              onChangeText={setUsername}
              autoCapitalize='none'
              keyboardType='default'
            />
            <TextInput
              style={styles.input}
              placeholder={t('auth.email')}
              placeholderTextColor='#999'
              keyboardType='email-address'
              value={email}
              onChangeText={setEmail}
              autoCapitalize='none'
            />
            <TextInput
              style={styles.input}
              placeholder={t('auth.password')}
              placeholderTextColor='#999'
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={[
                styles.button,
                loading && { backgroundColor: colors.disabled },
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size='small' color='#fff' />
              ) : (
                <Text style={styles.buttonText}>
                  {t('auth.registerButton')}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowLogin(true);
                setUsername('');
                setEmail('');
                setPassword('');
              }}
              disabled={loading}
            >
              <Text style={styles.switchText}>{t('auth.switchToLogin')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary || '#007AFF',
    borderRadius: 8,
    marginVertical: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 5,
    maxWidth: 400,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorText: {
    color: colors.error || 'red',
    fontSize: 14,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fafafa',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  switchText: {
    color: colors.primary || '#007AFF',
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  title: {
    color: colors.primary || '#333',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
