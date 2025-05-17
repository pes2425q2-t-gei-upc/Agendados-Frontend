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
  interpolate,
} from 'react-native-reanimated';

import { useAuth } from '@context/authContext';
import { login, register } from '@services/AuthService';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { colors, spacing } from '@styles/globalStyles';

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
    } catch (error) {
      if ((error as any).response?.data?.message) {
        setErrorMessage((error as any).response.data.message);
      } else if ((error as any).message) {
        setErrorMessage((error as any).message);
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

    if (password.length < 3) {
      setErrorMessage(
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

      router.replace('/(tabs)/main');
    } catch (error) {
      if ((error as any).response?.data?.message) {
        setErrorMessage((error as any).response.data.message);
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

  const renderErrorMessage = () => {
    if (!errorMessage) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={18}
          color={colors.error}
        />
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <ImageBackground
        source={require('@assets/images/agendadosbg.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overlay}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Agendados</Text>
            </View>

            {/* Título animado según el formulario activo */}
            <Animated.Text 
              style={[
                styles.title, 
                { opacity: showLogin ? 1 : 0, display: showLogin ? 'flex' : 'none' }
              ]}
            >
              {t('auth.login') || 'Iniciar Sesión'}
            </Animated.Text>
            
            <Animated.Text 
              style={[
                styles.title, 
                { opacity: showLogin ? 0 : 1, display: showLogin ? 'none' : 'flex' }
              ]}
            >
              {t('auth.register') || 'Crear Cuenta'}
            </Animated.Text>

            {/* Contenedor de formularios */}
            <View style={styles.formsContainer}>
              {/* Formulario de Login */}
              <Animated.View style={[styles.formCard, loginFormStyle]}>
                {renderErrorMessage()}

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color={colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.username') || 'Nombre de usuario'}
                    placeholderTextColor="#999"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color={colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { paddingRight: 40 }]}
                    placeholder={t('auth.password') || 'Contraseña'}
                    placeholderTextColor="#999"
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
                      color="#999"
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
                    loading && { opacity: 0.7 },
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {t('auth.loginButton') || 'Entrar'}
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('auth.orContinueWith') || 'O continúa con'}</Text>
                  <View style={styles.dividerLine} />
                </View>

                <GoogleSignInButton
                  onSuccess={() => router.replace('/(tabs)/main')}
                  onError={(error) => setErrorMessage(error?.message || 'Error al iniciar sesión con Google')}
                />
              </Animated.View>

              {/* Formulario de Registro */}
              <Animated.View style={[styles.formCard, registerFormStyle]}>
                {renderErrorMessage()}

                {/* Username Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color={colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.username') || 'Nombre de usuario'}
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                    editable={!loading}
                  />
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={22}
                    color={colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.email') || 'Correo electrónico'}
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color={colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.password') || 'Contraseña'}
                    placeholderTextColor="#999"
                    autoCapitalize="none"
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
                      color="#999"
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
                    <ActivityIndicator color="#fff" />
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
        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
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
  },
  overlay: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : spacing.xl * 2,
    width: '100%',
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
    height: 350, // Fixed height to avoid layout shifts
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