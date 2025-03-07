import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

interface LanguageSelectorProps {
  onLanguageChange: (lang: 'es' | 'en' | 'ca') => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const { t, i18n } = useTranslation();

  const handleChangeLanguage = (lang: 'es' | 'en' | 'ca') => {
    i18n.changeLanguage(lang);
    onLanguageChange(lang);
  };

  return (
    <View style={styles.langButtonContainer}>
      <TouchableOpacity
        style={[styles.langButton, i18n.language === 'es' ? styles.selectedLang : null]}
        onPress={() => handleChangeLanguage('es')}
      >
        <Text style={i18n.language === 'es' ? styles.selectedText : null}>
          {t('language.spanish')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.langButton, i18n.language === 'en' ? styles.selectedLang : null]}
        onPress={() => handleChangeLanguage('en')}
      >
        <Text style={i18n.language === 'en' ? styles.selectedText : null}>
          {t('language.english')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.langButton, i18n.language === 'ca' ? styles.selectedLang : null]}
        onPress={() => handleChangeLanguage('ca')}
      >
        <Text style={i18n.language === 'ca' ? styles.selectedText : null}>
          {t('language.catalan')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default LanguageSelector;