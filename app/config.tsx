import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { changeLanguage } from '../localization/i18n';

export default function Config() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const handleLanguageChange = async (lang: string) => {
    setLanguage(lang);
    await changeLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings')}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('language')}</Text>

        <View style={styles.languageOptions}>
          <TouchableOpacity
            style={[styles.languageButton, language === 'es' && styles.selectedLanguage]}
            onPress={() => handleLanguageChange('es')}
          >
            <Text style={language === 'es' ? styles.selectedText : styles.languageText}>
              {t('spanish')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.languageButton, language === 'ca' && styles.selectedLanguage]}
            onPress={() => handleLanguageChange('ca')}
          >
            <Text style={language === 'ca' ? styles.selectedText : styles.languageText}>
              {t('catalan')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.languageButton, language === 'en' && styles.selectedLanguage]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text style={language === 'en' ? styles.selectedText : styles.languageText}>
              {t('english')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
  },
  languageButton: {
    borderColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  languageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  languageText: {
    color: '#333',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  selectedLanguage: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  selectedText: {
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
});
