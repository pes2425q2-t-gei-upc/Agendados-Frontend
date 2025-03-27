/* eslint-disable react-native/sort-styles */
/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
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
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  StatusBar,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useAuth } from '@context/authContext';
import { login, register } from '@services/AuthService';

import { colors, spacing } from '../styles/globalStyles';

export default function RegisterLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const auth = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Animated styles - Corregido para mostrar ambos formularios
  const loginFormStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(showLogin ? 1 : 0, {
        duration: 350,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      }),
      transform: [
        {
          translateY: withTiming(showLogin ? 0 : 20, {
            duration: 350,
            easing: Easing.bezier(0.25, 1, 0.5, 1),
          }),
        },
      ],
      display: showLogin ? 'flex' : 'none',
      width: '100%',
      alignItems: 'center',
    };
  });

  const registerFormStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(showLogin ? 0 : 1, {
        duration: 350,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      }),
      transform: [
        {
          translateY: withTiming(showLogin ? 20 : 0, {
            duration: 350,
            easing: Easing.bezier(0.25, 1, 0.5, 1),
          }),
        },
      ],
      display: showLogin ? 'none' : 'flex',
      width: '100%',
      alignItems: 'center',
    };
  });

  // Validation
  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleLogin = async () => {
    setErrorMessage('');

    if (!username || !password) {
      setErrorMessage(
        t('auth.completeFields') || 'Por favor, completa todos los campos'
      );
      return;
    }

    try {
      setLoading(true);
      const response = await login(username, password);

      if (response.token) {
        await auth.login(response.token, response.user);
        router.replace('/(tabs)/main');
      } else {
        setErrorMessage(
          t('auth.noTokenReceived') || 'No se recibió un token de autenticación'
        );
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          t('auth.loginError') || 'Error al iniciar sesión. Inténtalo de nuevo.'
        );
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setErrorMessage('');

    if (!username || !email || !password) {
      setErrorMessage(
        t('auth.completeFields') || 'Por favor, completa todos los campos'
      );
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage(
        t('auth.invalidEmail') || 'Por favor, introduce un email válido'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        t('auth.passwordLength') ||
          'La contraseña debe tener al menos 6 caracteres'
      );
      return;
    }

    try {
      setLoading(true);
      const response = await register(username, email, password);

      // If registration returns token, login automatically
      if (response?.token) {
        await auth.login(response.token, response.user);
      }

      router.replace('/(tabs)/main');
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(
          t('auth.registerError') ||
            'Error al registrar usuario. Inténtalo de nuevo.'
        );
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
    setUsername('');
    setEmail('');
    setPassword('');
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar
        barStyle='light-content'
        translucent
        backgroundColor='transparent'
      />
      <ImageBackground
        source={require('@assets/images/agendadosbg.png')}
        style={styles.background}
        resizeMode='cover'
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Agendados</Text>
            </View>

            {/* Título diferente según el formulario activo */}
            <Text style={styles.title}>
              {showLogin
                ? t('auth.login') || 'Iniciar Sesión'
                : t('auth.register') || 'Crear Cuenta'}
            </Text>

            {/* Contenedor de formularios */}
            <View style={styles.formsContainer}>
              {/* Formulario de Login */}
              <Animated.View style={[styles.formContent, loginFormStyle]}>
                {errorMessage && showLogin ? (
                  <View style={styles.errorContainer}>
                    <Ionicons
                      name='alert-circle-outline'
                      size={18}
                      color={colors.error}
                    />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                <View style={styles.inputContainer}>
                  <Ionicons
                    name='person-outline'
                    size={22}
                    color='#666'
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.username') || 'Nombre de usuario'}
                    placeholderTextColor='#666'
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize='none'
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name='lock-closed-outline'
                    size={22}
                    color='#666'
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { paddingRight: 40 }]}
                    placeholder={t('auth.password') || 'Contraseña'}
                    placeholderTextColor='#666'
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color='#666'
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    {t('auth.forgotPassword') || '¿Olvidaste tu contraseña?'}
                  </Text>
                </TouchableOpacity>

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
                    <Text style={styles.buttonText}>
                      {t('auth.loginButton') || 'Entrar'}
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Formulario de Registro */}
              <Animated.View style={[styles.formContent, registerFormStyle]}>
                {errorMessage && !showLogin ? (
                  <View style={styles.errorContainer}>
                    <Ionicons
                      name='alert-circle-outline'
                      size={18}
                      color={colors.error}
                    />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                <View style={styles.inputContainer}>
                  <Ionicons
                    name='person-outline'
                    size={22}
                    color='#666'
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.username') || 'Nombre de usuario'}
                    placeholderTextColor='#666'
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize='none'
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name='mail-outline'
                    size={22}
                    color='#666'
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.email') || 'Correo electrónico'}
                    placeholderTextColor='#666'
                    keyboardType='email-address'
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize='none'
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name='lock-closed-outline'
                    size={22}
                    color='#666'
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { paddingRight: 40 }]}
                    placeholder={t('auth.password') || 'Contraseña'}
                    placeholderTextColor='#666'
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color='#666'
                    />
                  </TouchableOpacity>
                </View>

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
                      {t('auth.registerButton') || 'Registrar'}
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Contenedor del switch entre Login y Register */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {showLogin
                  ? t('auth.noAccount') || '¿No tienes cuenta?'
                  : t('auth.haveAccount') || '¿Ya tienes cuenta?'}
              </Text>
              {showLogin ? (
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={toggleForm}
                  disabled={loading}
                >
                  <Text style={styles.switchButtonText}>
                    {t('auth.registerNow') || 'Regístrate'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={toggleForm}
                  disabled={loading}
                >
                  <Text style={styles.switchButtonText}>
                    {t('auth.loginNow') || 'Inicia sesión'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 25,
    elevation: 2,
    height: 50,
    justifyContent: 'center',
    marginTop: spacing.xl,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: '100%',
  },
  buttonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(209, 17, 73, 0.1)',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.sm,
    width: '100%',
  },
  errorText: {
    color: colors.error,
    flex: 1,
    fontSize: 14,
    marginLeft: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
  },
  forgotPasswordText: {
    color: colors.secondary,
    fontSize: 14,
  },
  formsContainer: {
    position: 'relative',
    width: '85%',
  },
  formContent: {
    alignItems: 'center',
    width: '100%',
  },
  input: {
    color: '#333',
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: '#f0f0fa',
    borderRadius: 25,
    flexDirection: 'row',
    height: 54,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.xl * 2,
  },
  logoText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  overlay: {
    flex: 1,
    width: '100%',
  },
  passwordToggle: {
    position: 'absolute',
    right: spacing.md,
  },
  scrollContainer: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : spacing.xl,
    width: '100%',
  },
  switchButtonText: {
    color: 'white',
    fontWeight: 'semibold',
  },
  switchContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: spacing.xl * 2,
    width: '85%',
  },
  switchText: {
    color: 'white',
    marginBottom: spacing.sm,
  },
  // Nuevo estilo para el botón del switch
  switchButton: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: 24,
    paddingVertical: 6,
    width: '70%',
    backgroundColor: colors.primary, // Fondo blanco con 80% de opacidad
  },

  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: spacing.xl, // Se aumenta el margen inferior para separar mejor del formulario
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
