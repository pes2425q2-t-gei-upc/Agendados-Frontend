import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Button } from 'react-native';

import { colors, globalStyles, typography } from '@styles/globalStyles';

export default function Explore() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={globalStyles.container}>
      <Text style={typography.title}>{'Saved Events'}</Text>
      <Button
        title={t('goToSettings')}
        onPress={() => router.push('/config')}
        color={colors.primary}
      />
    </View>
  );
}
