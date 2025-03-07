import { useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import "../localization/i18n";
import { changeLanguage, loadSavedLanguage } from "../localization/i18n";

export default function Index() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Cargar el idioma guardado cuando se inicia la app
    loadSavedLanguage();
  }, []);

  // Función para cambiar idioma
  interface LanguageCode {
    lang: 'es' | 'en' | 'ca';
  }

  const handleChangeLanguage = (lang: LanguageCode['lang']): void => {
    changeLanguage(lang);
  };

  // Componente para los botones de idioma
  const LanguageButton = ({ lang, label }: { lang: LanguageCode['lang']; label: string }) => (
    <TouchableOpacity
      style={[
        styles.langButton,
        i18n.language === lang ? styles.selectedLang : null
      ]}
      onPress={() => handleChangeLanguage(lang)}
    >
      <Text style={i18n.language === lang ? styles.selectedText : null}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('welcome.title')}</Text>
      <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
      
      <View style={styles.langSection}>
        <Text style={styles.langTitle}>{t('language.selectLanguage')}</Text>
        <View style={styles.langButtonContainer}>
          <LanguageButton lang="es" label={t('language.spanish')} />
          <LanguageButton lang="en" label={t('language.english')} />
          <LanguageButton lang="ca" label={t('language.catalan')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
    opacity: 0.8,
  },
  langSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  langTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  langButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  langButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    minWidth: 100,
    alignItems: "center",
  },
  selectedLang: {
    backgroundColor: "#007AFF",
  },
  selectedText: {
    color: "white",
  },
});