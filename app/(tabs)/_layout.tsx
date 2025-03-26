import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors } from '@styles/globalStyles';

// Custom Header Component
function CustomHeader() {
  const router = useRouter();

  const handlePress = () => {
    router.push('/main');
  };
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.headerContainer}
      activeOpacity={0.9}
    >
      <Text style={styles.headerTitle}>Agendados</Text>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 90 : 80,
          shadowColor: colors.darkBackground,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        // Add the custom header to all screens
        header: () => <CustomHeader />,
        headerStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen
        name='main'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='explore'
        options={{
          title: 'Explore',
          header: () => null, // Esto elimina el header solo para esta pestaña
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'compass' : 'compass-outline'}
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='saved'
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bookmark' : 'bookmark-outline'}
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={30}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// Styles for the Custom Header
const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    elevation: 3,
    height: Platform.OS === 'ios' ? 100 : 80,
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
});
