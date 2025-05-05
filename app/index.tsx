import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  // Redirect to the main tab when the app opens at the root '/'
  return <Redirect href='/(tabs)/main' />;
  //return <Redirect href='/registerLogin' />;
  //return <Redirect href='/registerLogin' />;
}
