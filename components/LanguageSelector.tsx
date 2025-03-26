import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

import { colors, spacing } from '@styles/globalStyles';

interface LanguageSelectorProps {
  onLanguageChange: (lang: 'es' | 'en' | 'ca') => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageChange,
}) => {
  const { t, i18n } = useTranslation();

  const handleChangeLanguage = (lang: 'es' | 'en' | 'ca') => {
    i18n.changeLanguage(lang);
    onLanguageChange(lang);
  };

  return (
    <View style={styles.langButtonContainer}>
      <TouchableOpacity
        style={[
          styles.langButton,
          i18n.language === 'es' ? styles.selectedLang : null,
        ]}
        onPress={() => handleChangeLanguage('es')}
      >
        <Text style={i18n.language === 'es' ? styles.selectedText : null}>
          {t('settings.spanish')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.langButton,
          i18n.language === 'en' ? styles.selectedLang : null,
        ]}
        onPress={() => handleChangeLanguage('en')}
      >
        <Text style={i18n.language === 'en' ? styles.selectedText : null}>
          {t('settings.english')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.langButton,
          i18n.language === 'ca' ? styles.selectedLang : null,
        ]}
        onPress={() => handleChangeLanguage('ca')}
      >
        <Text style={i18n.language === 'ca' ? styles.selectedText : null}>
          {t('settings.catalan')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  langButton: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    minWidth: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  langButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  selectedLang: {
    backgroundColor: colors.primary,
  },
  selectedText: {
    color: colors.lightText,
  },
});

export default LanguageSelector;
