import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { colors, spacing } from '@styles/globalStyles';

const TermsOfService = () => {
  const { t } = useTranslation();

  const renderSection = (titleKey: string, contentKey: string, number: number) => (
    <View style={styles.section}>
      <Text style={styles.sectionNumber}>{number}.</Text>
      <Text style={styles.sectionTitle}>{t(titleKey)}</Text>
      <Text style={styles.text}>{t(contentKey)}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('termsOfService.title')}</Text>
        <Text style={styles.lastUpdated}>
          {t('termsOfService.lastUpdated', { date: 'May 23, 2025' })}
        </Text>
      </View>

      {/* Introduction */}
      <View style={styles.introContainer}>
        <Text style={styles.introTitle}>{t('termsOfService.intro.title')}</Text>
        <Text style={styles.introText}>{t('termsOfService.intro.description')}</Text>
      </View>

      {/* Sections */}
      {renderSection('termsOfService.section1.title', 'termsOfService.section1.content', 1)}
      {renderSection('termsOfService.section2.title', 'termsOfService.section2.content', 2)}
      {renderSection('termsOfService.section3.title', 'termsOfService.section3.content', 3)}
      {renderSection('termsOfService.section4.title', 'termsOfService.section4.content', 4)}
      {renderSection('termsOfService.section5.title', 'termsOfService.section5.content', 5)}
      {renderSection('termsOfService.section6.title', 'termsOfService.section6.content', 6)}
      {renderSection('termsOfService.section7.title', 'termsOfService.section7.content', 7)}
      {renderSection('termsOfService.section8.title', 'termsOfService.section8.content', 8)}

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>9.</Text>
        <Text style={styles.sectionTitle}>{t('termsOfService.section9.title')}</Text>
        <Text style={styles.text}>{t('termsOfService.section9.content')}</Text>
        
        <View style={styles.contactInfo}>
          <Text style={styles.contactText}>Agendados</Text>
          <Text style={styles.contactText}>FIB</Text>
          <Text style={styles.contactText}>UPC</Text>
          <Text style={styles.contactText}>08001</Text>
          <Text style={styles.contactText}>Spain</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('termsOfService.footer')}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  lastUpdated: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  introContainer: {
    backgroundColor: colors.background || '#f8f9fa',
    borderLeftColor: colors.primary,
    borderLeftWidth: 4,
    borderRadius: 8,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  introTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  introText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.xl,
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
  contactInfo: {
    backgroundColor: colors.background ?? '#f8f9fa',
    borderRadius: 8,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  contactText: {
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  footer: {
    borderTopColor: colors.border || '#e0e0e0',
    borderTopWidth: 1,
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default TermsOfService;