import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '@styles/globalStyles';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  const renderListItem = (text: string) => (
    <View style={styles.listItem}>
      <Text style={styles.bullet}>•</Text>
      <Text style={[styles.text, styles.listText]}>{text}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('privacyPolicy.title')}</Text>
        <Text style={styles.lastUpdated}>
          {t('privacyPolicy.lastUpdated', { date: 'May 23, 2025' })}
        </Text>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>
          {t('privacyPolicy.summaryTitle')}
        </Text>
        <Text style={styles.summaryText}>
          {t('privacyPolicy.summaryIntro')}
        </Text>
      </View>

      {/* Table of Contents */}
      <View style={styles.tocContainer}>
        <Text style={styles.tocTitle}>
          {t('privacyPolicy.tableOfContents')}
        </Text>
        {[
          'privacyPolicy.toc.informationCollect',
          'privacyPolicy.toc.processInformation',
          'privacyPolicy.toc.legalBases',
          'privacyPolicy.toc.shareInformation',
          'privacyPolicy.toc.cookiesTracking',
          'privacyPolicy.toc.socialLogins',
          'privacyPolicy.toc.keepInformation',
          'privacyPolicy.toc.informationSafe',
          'privacyPolicy.toc.privacyRights',
          'privacyPolicy.toc.doNotTrack',
          'privacyPolicy.toc.updates',
          'privacyPolicy.toc.contact',
          'privacyPolicy.toc.reviewData',
        ].map((item, index) => (
          <Text key={index} style={styles.tocItem}>
            {index + 1}. {t(item)}
          </Text>
        ))}
      </View>

      {/* 1. What Information Do We Collect */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>1.</Text>
        <Text style={styles.sectionTitle}>
          {t('privacyPolicy.section1.title')}
        </Text>

        <Text style={styles.subsectionTitle}>
          {t('privacyPolicy.section1.personalInfo.title')}
        </Text>
        <Text style={styles.inShort}>
          {t('privacyPolicy.section1.personalInfo.inShort')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section1.personalInfo.description')}
        </Text>

        <Text style={styles.subsectionTitle}>
          {t('privacyPolicy.section1.personalInfo.provided')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section1.personalInfo.providedDescription')}
        </Text>

        <View style={styles.listContainer}>
          {renderListItem(
            t('privacyPolicy.section1.personalInfo.phoneNumbers')
          )}
          {renderListItem(t('privacyPolicy.section1.personalInfo.names'))}
          {renderListItem(t('privacyPolicy.section1.personalInfo.emails'))}
          {renderListItem(t('privacyPolicy.section1.personalInfo.addresses'))}
          {renderListItem(t('privacyPolicy.section1.personalInfo.usernames'))}
          {renderListItem(t('privacyPolicy.section1.personalInfo.authData'))}
          {renderListItem(t('privacyPolicy.section1.personalInfo.preferences'))}
        </View>

        <Text style={styles.subsectionTitle}>
          {t('privacyPolicy.section1.sensitiveInfo.title')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section1.sensitiveInfo.description')}
        </Text>

        <Text style={styles.subsectionTitle}>
          {t('privacyPolicy.section1.socialMedia.title')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section1.socialMedia.description')}
        </Text>

        <Text style={styles.subsectionTitle}>
          {t('privacyPolicy.section1.appData.title')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section1.appData.description')}
        </Text>

        <View style={styles.listContainer}>
          {renderListItem(t('privacyPolicy.section1.appData.geolocation'))}
          {renderListItem(t('privacyPolicy.section1.appData.deviceAccess'))}
          {renderListItem(
            t('privacyPolicy.section1.appData.pushNotifications')
          )}
        </View>
      </View>

      {/* 2. How Do We Process Your Information */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>2.</Text>
        <Text style={styles.sectionTitle}>
          {t('privacyPolicy.section2.title')}
        </Text>
        <Text style={styles.inShort}>
          {t('privacyPolicy.section2.inShort')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section2.description')}
        </Text>

        <View style={styles.listContainer}>
          {renderListItem(t('privacyPolicy.section2.accountCreation'))}
          {renderListItem(t('privacyPolicy.section2.vitalInterests'))}
        </View>
      </View>

      {/* 3. Legal Bases */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>3.</Text>
        <Text style={styles.sectionTitle}>
          {t('privacyPolicy.section3.title')}
        </Text>
        <Text style={styles.inShort}>
          {t('privacyPolicy.section3.inShort')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section3.description')}
        </Text>

        <View style={styles.listContainer}>
          {renderListItem(t('privacyPolicy.section3.consent'))}
          {renderListItem(t('privacyPolicy.section3.legalObligations'))}
          {renderListItem(t('privacyPolicy.section3.vitalInterests'))}
        </View>
      </View>

      {/* 4. When and With Whom Do We Share */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>4.</Text>
        <Text style={styles.sectionTitle}>
          {t('privacyPolicy.section4.title')}
        </Text>
        <Text style={styles.inShort}>
          {t('privacyPolicy.section4.inShort')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section4.description')}
        </Text>

        <View style={styles.listContainer}>
          {renderListItem(t('privacyPolicy.section4.businessTransfers'))}
          {renderListItem(t('privacyPolicy.section4.googleMaps'))}
        </View>
      </View>

      {/* 5. Cookies and Tracking */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>5.</Text>
        <Text style={styles.sectionTitle}>
          {t('privacyPolicy.section5.title')}
        </Text>
        <Text style={styles.inShort}>
          {t('privacyPolicy.section5.inShort')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section5.description')}
        </Text>
      </View>

      {/* 6. Social Logins */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>6.</Text>
        <Text style={styles.sectionTitle}>
          {t('privacyPolicy.section6.title')}
        </Text>
        <Text style={styles.inShort}>
          {t('privacyPolicy.section6.inShort')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section6.description')}
        </Text>
      </View>

      {/* 7. How Long Do We Keep Information */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>7.</Text>
        <Text style={styles.sectionTitle}>
          {t('privacyPolicy.section7.title')}
        </Text>
        <Text style={styles.inShort}>
          {t('privacyPolicy.section7.inShort')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section7.description')}
        </Text>
      </View>

      {/* 8. How Do We Keep Information Safe */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>8.</Text>
        <Text style={styles.sectionTitle}>
          {t('privacyPolicy.section8.title')}
        </Text>
        <Text style={styles.inShort}>
          {t('privacyPolicy.section8.inShort')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section8.description')}
        </Text>
      </View>

      {/* 9. Privacy Rights */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>9.</Text>
        <Text style={styles.sectionTitle}>
          {t('privacyPolicy.section9.title')}
        </Text>
        <Text style={styles.inShort}>
          {t('privacyPolicy.section9.inShort')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section9.description')}
        </Text>

        <Text style={styles.subsectionTitle}>
          {t('privacyPolicy.section9.withdrawConsent.title')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section9.withdrawConsent.description')}
        </Text>

        <Text style={styles.subsectionTitle}>
          {t('privacyPolicy.section9.accountInfo.title')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section9.accountInfo.description')}
        </Text>

        <View style={styles.listContainer}>
          {renderListItem(
            t('privacyPolicy.section9.accountInfo.loginSettings')
          )}
        </View>
      </View>

      {/* 10. Do Not Track */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>10.</Text>
        <Text style={styles.sectionTitle}>
          {t('privacyPolicy.section10.title')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section10.description')}
        </Text>
      </View>

      {/* 11. Updates to Notice */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>11.</Text>
        <Text style={styles.sectionTitle}>
          {t('privacyPolicy.section11.title')}
        </Text>
        <Text style={styles.inShort}>
          {t('privacyPolicy.section11.inShort')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section11.description')}
        </Text>
      </View>

      {/* 12. Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>12.</Text>
        <Text style={styles.sectionTitle}>
          {t('privacyPolicy.section12.title')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section12.description')}
        </Text>

        <View style={styles.contactInfo}>
          <Text style={styles.contactText}>Agendados</Text>
          <Text style={styles.contactText}>FIB</Text>
          <Text style={styles.contactText}>UPC</Text>
          <Text style={styles.contactText}>08001</Text>
          <Text style={styles.contactText}>Spain</Text>
        </View>
      </View>

      {/* 13. Review, Update, Delete Data */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>13.</Text>
        <Text style={styles.sectionTitle}>
          {t('privacyPolicy.section13.title')}
        </Text>
        <Text style={styles.text}>
          {t('privacyPolicy.section13.description')}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('privacyPolicy.footer')}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bullet: {
    color: colors.primary,
    fontSize: 15,
    marginRight: spacing.sm,
    marginTop: 2,
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
  footerText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  inShort: {
    borderLeftColor: colors.primary,
    borderLeftWidth: 2,
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: spacing.md,
    paddingLeft: spacing.sm,
  },
  lastUpdated: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  listContainer: {
    marginVertical: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  listText: {
    flex: 1,
    marginBottom: 0,
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
  subsection: {
    marginTop: spacing.lg,
  },
  subsectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  summaryContainer: {
    backgroundColor: colors.background || '#f8f9fa',
    borderLeftColor: colors.primary,
    borderLeftWidth: 4,
    borderRadius: 8,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  summaryText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
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
  tocContainer: {
    backgroundColor: colors.background || '#f8f9fa',
    borderRadius: 8,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  tocItem: {
    color: colors.primary,
    fontSize: 14,
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  tocTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
});

export default PrivacyPolicy;
