import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';

// Define interfaces for the state and user
interface AuthUser {
  idToken: string;
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
      webClientId: '259177311342-jpmq68ro7s6jq1hs84o84pv2u1baebu9.apps.googleusercontent.com',
      iosClientId: '259177311342-m3as7g1cidrdtf7r858i285atqljusnq.apps.googleusercontent.com',
      scopes: ['profile', 'email']
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await GoogleSignin.hasPlayServices();
      
      // The signIn method returns a userInfo object with different structure
      const userInfo = await GoogleSignin.signIn();
      
      // Get the tokens - this is a separate call
      const tokens = await GoogleSignin.getTokens();

      if (!tokens.idToken) {
        throw new Error("No idToken returned");
      }

      const authUser: AuthUser = {
        idToken: tokens.idToken,
      };

      setState({ user: authUser, isLoading: false, error: null });
      return authUser;
    } catch (error: any) {
      let errorMessage = 'An error occurred while signing in with Google';
      
      if (error.code) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          errorMessage = 'Sign in was cancelled';
        } else if (error.code === statusCodes.IN_PROGRESS) {
          errorMessage = 'Sign in is already in progress';
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          errorMessage = 'Play services not available or outdated';
        }
      }

      // Enhanced error logging
      console.error('Google SignIn Error:', error);
      if (error && typeof error === 'object') {
        Object.keys(error).forEach((key) => {
          try {
            // @ts-ignore
            console.error(`Google SignIn Error property [${key}]:`, error[key]);
          } catch {}
        });
      }
      if (error?.stack) {
        console.error('Google SignIn Error stack:', error.stack);
      }
      
      setState({
        user: null,
        isLoading: false,
        error: errorMessage,
      });
      
      return null;
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      setState({
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to sign out'
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