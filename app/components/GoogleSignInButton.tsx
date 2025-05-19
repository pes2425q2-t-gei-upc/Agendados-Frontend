// app/components/GoogleSignInButton.tsx
import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useGoogleAuth } from '@services/GoogleAuthService';
import { loginWithGoogle } from '@services/AuthService';
import { useAuth } from '@context/authContext';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const googleAuth = useGoogleAuth();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    // Prevent multiple simultaneous sign-in attempts
    if (isLoading) return;
    
    try {
      setIsLoading(true);      
      // Get Google authentication data
      const googleAuthResult = await googleAuth.signInWithGoogle();
      
      if (!googleAuthResult || !googleAuthResult.idToken) {
        throw new Error('No se pudo completar la autenticación con Google');
      }      
      // Send the ID token to our backend
      const authResponse = await loginWithGoogle(googleAuthResult.idToken);
      
      // Validate backend response
      if (!authResponse?.token) {
        throw new Error('El servidor no devolvió un token válido');
      }      
      // Update authentication context
      await login(authResponse.token, authResponse.user);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('[GoogleSignInButton] Error:', error);
      
      // Format error message
      let errorMessage = 'Error al iniciar sesión con Google';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Show error to user
      Alert.alert('Error de autenticación', errorMessage);
      
      // Call error callback
      if (onError) {
        onError(error);
      }
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