import { Redirect } from 'expo-router';
import React from 'react';

import { useAuth } from './context/authContext';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href='/(tabs)/main' />;
  } else {
    return <Redirect href='/registerLogin' />;
  }
}
