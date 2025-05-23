import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  View,
} from 'react-native';

import { colors } from '@styles/globalStyles';

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
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <Text style={styles.headerTitle}>Agendados</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: IS_IOS ? 80 : 80,
            shadowColor: colors.darkBackground,
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            width: SCREEN_WIDTH,
            alignItems: 'center',
            justifyContent: 'space-around',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 0,
            textAlign: 'center',
          },
          tabBarIconStyle: {
            marginBottom: 0,
            alignSelf: 'center',
          },
          header: () => <CustomHeader />,
          headerStyle: {
            backgroundColor: colors.background,
            width: SCREEN_WIDTH,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
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
            header: () => null,
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
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    elevation: 3,
    height: IS_IOS ? 60 : 60 + STATUSBAR_HEIGHT,
    justifyContent: 'center',
    marginTop: 50,
    paddingTop: IS_IOS ? 0 : STATUSBAR_HEIGHT,
    width: SCREEN_WIDTH,
  },
  headerTitle: {
    alignSelf: 'center',
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
