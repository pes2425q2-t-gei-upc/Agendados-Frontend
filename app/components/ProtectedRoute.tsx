// app/components/ProtectedRoute.tsx
import { useRouter, Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';

import { colors } from '@styles/globalStyles';

import { useAuth } from '../context/authContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, userToken } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    console.log('ProtectedRoute - Auth state:', {
      isAuthenticated,
      loading,
      userToken,
    });

    if (!loading) {
      setIsCheckingAuth(false);
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        router.replace('/registerLogin');
      }
    }
  }, [isAuthenticated, loading, router, userToken]);

  if (loading || isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Cargando...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated (final check), redirecting to login');
    return <Redirect href='/registerLogin' />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
