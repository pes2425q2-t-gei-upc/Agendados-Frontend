import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@styles/globalStyles';

// Constantes para dimensiones consistentes entre desarrollo y producción
const SCREEN_WIDTH = Dimensions.get('window').width;
const STATUSBAR_HEIGHT = StatusBar.currentHeight ?? 0;
const IS_IOS = Platform.OS === 'ios';

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
  const { t } = useTranslation();
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
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
              height: IS_IOS ? 90 : 70,
              shadowColor: colors.darkBackground,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 5,
              width: SCREEN_WIDTH, // Asegura el ancho completo
              alignItems: 'center', // Centra los elementos
              justifyContent: 'space-around', // Distribuye los íconos uniformemente
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
              marginTop: 4,
              textAlign: 'center', // Asegura que el texto esté centrado
            },
            tabBarIconStyle: {
              marginBottom: 0,
              alignSelf: 'center', // Centra los íconos
            },
            // Add the custom header to all screens
            header: () => <CustomHeader />,
            headerStyle: {
              backgroundColor: colors.background,
              width: SCREEN_WIDTH, // Asegura el ancho completo del header
            },
          }}
        >
          <Tabs.Screen
            name='main'
            options={{
              title: t('navigation.home'),
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'home' : 'home-outline'}
                  size={28}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name='explore'
            options={{
              title: t('navigation.explore'),
              header: () => null, // Esto elimina el header solo para esta pestaña
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'compass' : 'compass-outline'}
                  size={28}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name='saved'
            options={{
              title: t('navigation.saved'),
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'bookmark' : 'bookmark-outline'}
                  size={28}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name='chats'
            options={{
              title: t('navigation.chats'),
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
                  size={28}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name='profile'
            options={{
              title: t('navigation.profile'),
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'person' : 'person-outline'}
                  size={28}
                  color={color}
                />
              ),
            }}
          />
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
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
    height: IS_IOS ? 70 : 50 + STATUSBAR_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
    width: SCREEN_WIDTH, // Asegura que el ancho sea el de la pantalla completa
  },
  headerTitle: {
    alignSelf: 'center', // Asegura que el título esté centrado
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
    paddingTop: IS_IOS ? 15 : STATUSBAR_HEIGHT + 10,
    textAlign: 'center', // Asegura que el texto esté centrado
  },
  safeArea: {
    flex: 1,
    width: SCREEN_WIDTH, // Asegura que el ancho sea el de la pantalla completa
  },
});
