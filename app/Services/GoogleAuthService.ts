/* eslint-disable @typescript-eslint/no-unused-vars */
// app/Services/GoogleAuthService.ts
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';

// Define interfaces for the state and user
interface AuthUser {
  idToken: string;
  user?: {
    email: string;
    familyName: string | null;
    givenName: string | null;
    id: string;
    name: string | null;
    photo: string | null;
  };
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export const useGoogleAuth = () => {
  // Initialize state with appropriate types
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    // Configure GoogleSignin
    GoogleSignin.configure({
      // Make sure these match your Google Cloud Console credentials
      webClientId:
        '259177311342-jpmq68ro7s6jq1hs84o84pv2u1baebu9.apps.googleusercontent.com',
      iosClientId:
        '259177311342-m3as7g1cidrdtf7r858i285atqljusnq.apps.googleusercontent.com',
      offlineAccess: true, // If you need a refresh token
      scopes: ['profile', 'email'],
    });

    // Check if user is already signed in
    const checkSignIn = async () => {
      try {
        const isSignedIn = await GoogleSignin.hasPlayServices();
        if (isSignedIn) {
          // Get current user info and tokens
          const tokens = await GoogleSignin.getTokens();

          if (tokens.idToken) {
            setState({
              user: {
                idToken: tokens.idToken,
              },
              isLoading: false,
              error: null,
            });
          }
        }
      } catch (error) {
        console.error('Error checking Google sign-in status:', error);
      }
    };

    checkSignIn();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Clear any existing sessions to prevent conflicts
      try {
        await GoogleSignin.signOut();
        console.log('[GoogleAuth] Cleared previous sign-in session');
      } catch (clearError) {
        // Ignore errors during sign out - this is just a precaution
        console.log('[GoogleAuth] No previous session to clear');
      }

      // Ensure Google Play Services are available (Android only)
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log('[GoogleAuth] Play Services check passed');

      // Sign in and get user info
      const userInfo = await GoogleSignin.signIn();
      console.log('[GoogleAuth] User signed in successfully');

      // Get tokens (ID token needed for backend auth)
      const tokens = await GoogleSignin.getTokens();
      console.log('[GoogleAuth] Retrieved tokens successfully');

      if (!tokens.idToken) {
        throw new Error(
          'No se pudo obtener un token de identificación de Google'
        );
      }

      const authUser: AuthUser = {
        idToken: tokens.idToken,
      };

      setState({ user: authUser, isLoading: false, error: null });

      // Return what's needed for the backend authentication
      return {
        idToken: tokens.idToken,
      };
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión con Google';

      // Handle specific error codes
      if (error.code) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            errorMessage = 'Inicio de sesión cancelado';
            break;
          case statusCodes.IN_PROGRESS:
            errorMessage = 'El inicio de sesión ya está en progreso';
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            errorMessage =
              'Google Play Services no está disponible o actualizado';
            break;
          default:
            errorMessage = 'Error en la autenticación de Google';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Enhanced error logging
      console.error('[GoogleAuth] SignIn Error:', error);
      console.error('[GoogleAuth] Error Message:', errorMessage);

      if (error && typeof error === 'object') {
        try {
          console.error(
            '[GoogleAuth] Error Details:',
            JSON.stringify(error, null, 2)
          );
        } catch (e) {
          console.error(
            '[GoogleAuth] Error with additional properties that cannot be stringified'
          );
        }
      }

      setState({
        user: null,
        isLoading: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      await GoogleSignin.signOut();
      console.log('[GoogleAuth] Signed out successfully');
      setState({
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('[GoogleAuth] Error signing out:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Error al cerrar sesión',
      }));
    }
  };

  return {
    ...state,
    signInWithGoogle,
    signOut,
    getCurrentUser: () => state.user,
    isSignedIn: () => !!state.user,
  };
};
