import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { colors, spacing } from '@styles/globalStyles';

const TermsOfService = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderSection = (
    titleKey: string,
    contentKey: string,
    number: number
  ) => (
    <View style={viewStyles.section}>
      <Text style={textStyles.sectionNumber}>{number}.</Text>
      <Text style={textStyles.sectionTitle}>{t(titleKey)}</Text>
      <Text style={textStyles.text}>{t(contentKey)}</Text>
    </View>
  );

  return (
    <ScrollView
      style={viewStyles.container}
      contentContainerStyle={viewStyles.content}
    >
      {/* Back Button */}
      <TouchableOpacity style={viewStyles.backButton} onPress={handleGoBack}>
        <Text style={textStyles.backButtonText}>
          ← {t('common.back', 'Atrás')}
        </Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={viewStyles.header}>
        <Text style={textStyles.title}>{t('termsOfService.title')}</Text>
        <Text style={textStyles.lastUpdated}>
          {t('termsOfService.lastUpdated', { date: 'May 23, 2025' })}
        </Text>
      </View>

      {/* Introduction */}
      <View style={viewStyles.introContainer}>
        <Text style={textStyles.introTitle}>
          {t('termsOfService.intro.title')}
        </Text>
        <Text style={textStyles.introText}>
          {t('termsOfService.intro.description')}
        </Text>
      </View>

      {/* Sections */}
      {renderSection(
        'termsOfService.section1.title',
        'termsOfService.section1.content',
        1
      )}
      {renderSection(
        'termsOfService.section2.title',
        'termsOfService.section2.content',
        2
      )}
      {renderSection(
        'termsOfService.section3.title',
        'termsOfService.section3.content',
        3
      )}
      {renderSection(
        'termsOfService.section4.title',
        'termsOfService.section4.content',
        4
      )}
      {renderSection(
        'termsOfService.section5.title',
        'termsOfService.section5.content',
        5
      )}
      {renderSection(
        'termsOfService.section6.title',
        'termsOfService.section6.content',
        6
      )}
      {renderSection(
        'termsOfService.section7.title',
        'termsOfService.section7.content',
        7
      )}
      {renderSection(
        'termsOfService.section8.title',
        'termsOfService.section8.content',
        8
      )}

      {/* Contact Information */}
      <View style={viewStyles.section}>
        <Text style={textStyles.sectionNumber}>9.</Text>
        <Text style={textStyles.sectionTitle}>
          {t('termsOfService.section9.title')}
        </Text>
        <Text style={textStyles.text}>
          {t('termsOfService.section9.content')}
        </Text>

        <View style={viewStyles.contactInfo}>
          <Text style={textStyles.contactText}>Agendados</Text>
          <Text style={textStyles.contactText}>FIB</Text>
          <Text style={textStyles.contactText}>UPC</Text>
          <Text style={textStyles.contactText}>08001</Text>
          <Text style={textStyles.contactText}>Spain</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={viewStyles.footer}>
        <Text style={textStyles.footerText}>{t('termsOfService.footer')}</Text>
      </View>
    </ScrollView>
  );
};

const viewStyles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background || '#f8f9fa',
    borderColor: colors.border || '#e0e0e0',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.lg,
    marginTop: 50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  contactInfo: {
    backgroundColor: colors.background ?? '#f8f9fa',
    borderRadius: 8,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  footer: {
    borderTopColor: colors.border || '#e0e0e0',
    borderTopWidth: 1,
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  introContainer: {
    backgroundColor: colors.background || '#f8f9fa',
    borderLeftColor: colors.primary,
    borderLeftWidth: 4,
    borderRadius: 8,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
});

const textStyles = StyleSheet.create({
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  contactText: {
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  introText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  introTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  lastUpdated: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  sectionNumber: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  text: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});

export default TermsOfService;
