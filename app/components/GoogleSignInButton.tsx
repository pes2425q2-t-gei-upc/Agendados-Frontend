import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useGoogleAuth } from '../Services/GoogleAuthService';
import { loginWithGoogle } from '../Services/AuthService';
import { useAuth } from '../context/authContext';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const { signInWithGoogle } = useGoogleAuth();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Iniciar sesión con Google
      const userInfo = await signInWithGoogle();
      console.log('User info from Google sign-in:', userInfo);
      
      if (userInfo?.idToken) {
        // Enviar el token a tu backend
        const authResponse = await loginWithGoogle(userInfo.idToken);
        
        // Actualizar el estado de autenticación
        if (authResponse?.token) {
          await login(authResponse.token, authResponse.user);
          onSuccess?.();
        } else {
          throw new Error('No se pudo obtener el token de autenticación del servidor');
        }
      } else {
        throw new Error('No se pudo obtener el token de Google');
      }
    } catch (error: any) {
      console.error('Error en el inicio de sesión con Google:', error);
      
      // Mostrar mensaje de error al usuario
      let errorMessage = 'Error al iniciar sesión con Google';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, isLoading && styles.buttonDisabled]} 
      onPress={handleGoogleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#DB4437" style={styles.loadingIndicator} />
      ) : (
        <AntDesign name="google" size={24} color="#DB4437" style={styles.icon} />
      )}
      <Text style={[styles.buttonText, isLoading && styles.buttonTextDisabled]}>
        {isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  icon: {
    marginRight: 12,
  },
  loadingIndicator: {
    marginRight: 12,
  },
  buttonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
});
