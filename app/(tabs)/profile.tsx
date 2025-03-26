import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Button, StyleSheet } from 'react-native';

import { colors, globalStyles, typography } from '@styles/globalStyles';

export default function Profile() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={globalStyles.container}>
      <Text style={typography.title}>{t('navigation.profile')}</Text>
      <Text style={styles.welcomeText}>{t('profile.welcome')}</Text>

      <View style={styles.buttonContainer}>
        <Button
          title={t('profile.goToSettings')}
          onPress={() => router.push('/config')}
          color={colors.primary}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={t('profile.logout')}
          onPress={() => {
            // Logout functionality would go here
            console.log('User logged out');
          }}
          color={colors.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 10,
    width: '80%',
  },
  welcomeText: {
    ...typography.body,
    marginVertical: 20,
    textAlign: 'center',
  },
});
