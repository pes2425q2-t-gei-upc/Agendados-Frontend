import { Stack } from 'expo-router';
import React from 'react';

export default function FriendsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Friends',
        }}
      />
      <Stack.Screen
        name='add'
        options={{
          title: 'Add Friend',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name='[id]/favorites'
        options={{
          title: 'Friend Favorites',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='[id]/events'
        options={{
          title: 'Friend Events',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
