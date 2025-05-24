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
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useAuth } from '@context/authContext';
import { login, register } from '@services/AuthService';
import { colors, spacing } from '@styles/globalStyles';

import { GoogleSignInButton } from './components/GoogleSignInButton';
import { PasswordResetForm } from './components/PasswordResetForm';

const { height: screenHeight } = Dimensions.get('window');

export default function RegisterLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const auth = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const toggleResetPassword = () => {
    setShowResetPassword(!showResetPassword);
  };

  const showErrorToast = (message: string) => {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: message,
      visibilityTime: 4000,
      autoHide: true,
      topOffset: Platform.OS === 'ios' ? 60 : 40,
      position: 'top',
      text1Style: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      text2Style: {
        fontSize: 12, // Slightly smaller font
        fontWeight: '500',
        lineHeight: 18, // Better line spacing
        textAlign: 'left', // Ensure proper alignment
      },
      swipeable: true, // Allow swipe to dismiss
    });
  };

  const showSuccessToast = (message: string) => {
    Toast.show({
      type: 'success',
      text1: 'Éxito',
      text2: message,
      visibilityTime: 3000,
      autoHide: true,
      topOffset: Platform.OS === 'ios' ? 60 : 40,
      position: 'top',
      text1Style: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      text2Style: {
        fontSize: 12, // Slightly smaller font
        fontWeight: '500',
        lineHeight: 18, // Better line spacing
        textAlign: 'left', // Ensure proper alignment
      },
      swipeable: true, // Allow swipe to dismiss
    });
  };

  // Improved animated styles
  const loginFormStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(showLogin ? 1 : 0, {
        duration: 300,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      }),
      transform: [
        {
          translateX: withTiming(showLogin ? 0 : -50, {
            duration: 300,
            easing: Easing.bezier(0.25, 1, 0.5, 1),
          }),
        },
      ],
      position: 'absolute',
      display: showLogin ? 'flex' : 'none',
      width: '100%',
      alignItems: 'center',
    };
  });

  const registerFormStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(showLogin ? 0 : 1, {
        duration: 300,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      }),
      transform: [
        {
          translateX: withTiming(showLogin ? 50 : 0, {
            duration: 300,
            easing: Easing.bezier(0.25, 1, 0.5, 1),
          }),
        },
      ],
      position: 'absolute',
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

  // ...existing code...
  const handleLogin = async () => {
    if (!username || !password) {
      showErrorToast(
        t('auth.completeFields') || 'Por favor, completa todos los campos'
      );
      return;
    }

    try {
      setLoading(true);
      const response = await login(username, password);

      if (response.token) {
        await auth.login(response.token, response.user);
        showSuccessToast('Sesión iniciada correctamente');
        router.replace('/(tabs)/main');
      } else {
        showErrorToast(
          t('auth.noTokenReceived') || 'No se recibió un token de autenticación'
        );
      }
    } catch (error) {
      // Handle errors from AuthService - these are plain Error objects
      if (error instanceof Error) {
        // Check if it's a 404 error based on the message
        if (error.message.includes('404')) {
          showErrorToast(
            t('auth.userNotFound') || 'Usuario o contraseña incorrectos'
          );
        } else if (error.message.includes('401')) {
          showErrorToast(
            t('auth.invalidCredentials') || 'Credenciales inválidas'
          );
        } else if (error.message.includes('403')) {
          showErrorToast(
            t('auth.accountBlocked') || 'Cuenta bloqueada o sin permisos'
          );
        } else if (error.message.includes('500')) {
          showErrorToast(
            t('auth.serverError') || 'Error del servidor. Inténtalo más tarde'
          );
        } else {
          // Use the actual error message from the server
          showErrorToast(error.message);
        }
      } else {
        // Fallback for unknown error types
        showErrorToast(
          t('auth.loginError') || 'Error al iniciar sesión. Inténtalo de nuevo.'
        );
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };
  // ...existing code...

  const handleRegister = async () => {
    if (!username || !email || !password) {
      showErrorToast(
        t('auth.completeFields') || 'Por favor, completa todos los campos'
      );
      return;
    }

    if (!validateEmail(email)) {
      showErrorToast(
        t('auth.invalidEmail') || 'Por favor, introduce un email válido'
      );
      return;
    }

    if (password.length < 3) {
      showErrorToast(
        t('auth.passwordLength') ||
          'La contraseña debe tener al menos 3 caracteres'
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

      showSuccessToast('Cuenta creada exitosamente');
      router.replace('/(tabs)/main');
    } catch (error) {
      // Manejo específico para errores de registro
      if ((error as any).response?.status === 409) {
        showErrorToast(t('auth.userExists') || 'El usuario o email ya existe');
      } else if ((error as any).response?.status === 400) {
        showErrorToast(
          t('auth.badRequest') || 'Datos inválidos. Verifica la información'
        );
      } else if ((error as any).response?.status === 500) {
        showErrorToast(
          t('auth.serverError') || 'Error del servidor. Inténtalo más tarde'
        );
      } else if ((error as any).response?.data?.message) {
        showErrorToast((error as any).response.data.message);
      } else {
        showErrorToast(
          t('auth.registerError') ||
            'Error al registrar usuario. Inténtalo de nuevo.'
        );
      }
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
    setUsername('');
    setEmail('');
    setPassword('');
  };

  if (showResetPassword) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: '#f5f5f5',
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <PasswordResetForm onBackToLogin={toggleResetPassword} />
        <Toast />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overlay}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps='handled'
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>Agendados</Text>
              </View>

              {/* Título animado según el formulario activo */}
              <Animated.Text
                style={[
                  styles.title,
                  {
                    opacity: showLogin ? 1 : 0,
                    display: showLogin ? 'flex' : 'none',
                  },
                ]}
              >
                {t('auth.login') || 'Iniciar Sesión'}
              </Animated.Text>

              <Animated.Text
                style={[
                  styles.title,
                  {
                    opacity: showLogin ? 0 : 1,
                    display: showLogin ? 'none' : 'flex',
                  },
                ]}
              >
                {t('auth.register') || 'Crear Cuenta'}
              </Animated.Text>

              {/* Contenedor de formularios */}
              <View style={styles.formsContainer}>
                {/* Formulario de Login */}
                <Animated.View style={[styles.formCard, loginFormStyle]}>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name='person-outline'
                      size={22}
                      color={colors.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.username') || 'Nombre de usuario'}
                      placeholderTextColor='#999'
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize='none'
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons
                      name='lock-closed-outline'
                      size={22}
                      color={colors.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { paddingRight: 40 }]}
                      placeholder={t('auth.password') || 'Contraseña'}
                      placeholderTextColor='#999'
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
                        color='#999'
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={toggleResetPassword}
                  >
                    <Text
                      style={[
                        styles.forgotPasswordText,
                        { textAlign: 'center' },
                      ]}
                    >
                      {t('auth.forgotPassword') || '¿Olvidaste tu contraseña?'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
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

                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>
                      {t('auth.orContinueWith') || 'O continúa con'}
                    </Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <GoogleSignInButton
                    onSuccess={() => {
                      showSuccessToast('Sesión iniciada con Google');
                      router.replace('/(tabs)/main');
                    }}
                    onError={(error) =>
                      showErrorToast(
                        error?.message ?? 'Error al iniciar sesión con Google'
                      )
                    }
                  />
                </Animated.View>

                {/* Formulario de Registro */}
                <Animated.View style={[styles.formCard, registerFormStyle]}>
                  {/* Username Input */}
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name='person-outline'
                      size={22}
                      color={colors.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.username') || 'Nombre de usuario'}
                      placeholderTextColor='#999'
                      autoCapitalize='none'
                      value={username}
                      onChangeText={setUsername}
                      editable={!loading}
                    />
                  </View>

                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name='mail-outline'
                      size={22}
                      color={colors.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.email') || 'Correo electrónico'}
                      placeholderTextColor='#999'
                      autoCapitalize='none'
                      keyboardType='email-address'
                      value={email}
                      onChangeText={setEmail}
                      editable={!loading}
                    />
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name='lock-closed-outline'
                      size={22}
                      color={colors.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.password') || 'Contraseña'}
                      placeholderTextColor='#999'
                      autoCapitalize='none'
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color='#999'
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color='#fff' />
                    ) : (
                      <Text style={styles.buttonText}>
                        {t('auth.register') || 'Registrarse'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Toggle Container */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {showLogin
                    ? t('auth.noAccount') || '¿No tienes cuenta?'
                    : t('auth.haveAccount') || '¿Ya tienes cuenta?'}
                </Text>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={toggleForm}
                  disabled={loading}
                >
                  <Text style={styles.toggleButtonText}>
                    {showLogin
                      ? t('auth.registerNow') || 'Regístrate'
                      : t('auth.loginNow') || 'Inicia sesión'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>

      {/* Toast Component */}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  background: {
    flex: 1,
    width: '100%',
    height: screenHeight,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : spacing.xl * 2,
    width: '100%',
    minHeight: screenHeight,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    color: 'white',
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 50,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  formsContainer: {
    position: 'relative',
    width: '90%',
    height: 350,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 245, 245, 0.9)',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    height: 55,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: spacing.sm,
    height: 55,
  },
  passwordToggle: {
    padding: spacing.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    elevation: 4,
    height: 55,
    justifyContent: 'center',
    marginTop: spacing.md,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    width: '100%',
  },
  buttonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dividerText: {
    color: 'rgba(0, 0, 0, 0.5)',
    marginHorizontal: spacing.sm,
    fontSize: 14,
  },
  toggleContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  toggleText: {
    color: 'white',
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  toggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    minWidth: 150,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});
