/* eslint-disable react-native/no-inline-styles */
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {
  globalStyles,
  typography,
  colors,
  spacing,
} from '../styles/globalStyles'; // Ajusta la ruta según tu estructura

export default function RegisterLoginPage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validación básica de email con expresión regular
  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleLogin = async () => {
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Por favor, completa todos los campos');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Por favor, introduce un email válido');
      return;
    }

    try {
      setLoading(true);
      // Simula la petición de red (reemplaza con tu lógica real)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.replace('/(tabs)/main');
    } catch (error) {
      setErrorMessage('Error al iniciar sesión. Inténtalo de nuevo.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setErrorMessage('');

    if (!fullName || !email || !password) {
      setErrorMessage('Por favor, completa todos los campos');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Por favor, introduce un email válido');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      // Simula la petición de red (reemplaza con tu lógica real)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.replace('/(tabs)/main');
    } catch (error) {
      setErrorMessage('Error al registrar usuario. Inténtalo de nuevo.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={typography.title}>
        {showLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
      </Text>

      {errorMessage ? (
        <Text
          style={{
            color: colors.error,
            fontSize: 14,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          {errorMessage}
        </Text>
      ) : null}

      {showLogin ? (
        <>
          <TextInput
            style={globalStyles.input}
            placeholder='Correo electrónico'
            keyboardType='email-address'
            value={email}
            onChangeText={setEmail}
            autoCapitalize='none'
          />
          <TextInput
            style={globalStyles.input}
            placeholder='Contraseña'
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={[
              globalStyles.button,
              loading && { backgroundColor: colors.disabled },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size='small' color='#fff' />
            ) : (
              <Text style={globalStyles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowLogin(false)}
            disabled={loading}
          >
            <Text
              style={{
                color: colors.primary,
                fontSize: 14,
                marginTop: spacing.sm,
                textAlign: 'center',
              }}
            >
              ¿No tienes cuenta? Regístrate
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={globalStyles.input}
            placeholder='Nombre completo'
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={globalStyles.input}
            placeholder='Correo electrónico'
            keyboardType='email-address'
            value={email}
            onChangeText={setEmail}
            autoCapitalize='none'
          />
          <TextInput
            style={globalStyles.input}
            placeholder='Contraseña'
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={[
              globalStyles.button,
              loading && { backgroundColor: colors.disabled },
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size='small' color='#fff' />
            ) : (
              <Text style={globalStyles.buttonText}>Registrar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowLogin(true)}
            disabled={loading}
          >
            <Text
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                color: colors.primary,
                fontSize: 14,
                marginTop: spacing.sm,
                textAlign: 'center',
              }}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
