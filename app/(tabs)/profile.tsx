import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import EventDetailModal from '@components/EventDetailModal';
import { Event } from '@models/Event';
import { SavedService } from '@services/SavedService';
import { colors, spacing, typography } from '@styles/globalStyles';
import { changeLanguage } from 'localization/i18n';

export default function ProfileScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    savedEvents: 0,
    attendedEvents: 0,
    likedCategories: [] as { name: string; count: number }[],
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Simulated user data
  const user = {
    name: 'Alex García',
    username: 'alexgarcia',
    email: 'alex.garcia@example.com',
    avatar: require('@assets/images/ReyLeon.jpg'), // Using an example image from your assets
    joinDate: new Date(2023, 2, 15),
  };

  // Load user stats
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch saved events
        const savedEvents = await SavedService.getFavorites();
        setRecentEvents(savedEvents.slice(0, 3)); // Get just the 3 most recent

        // Calculate stats
        const categories = savedEvents.flatMap(
          (event) => event.categories?.map((cat) => cat.name) || []
        );

        // Count occurrences of each category
        const categoryCounts = categories.reduce(
          (acc, category) => {
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        const likedCategories = Object.entries(categoryCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3); // Top 3 categories

        setStats({
          savedEvents: savedEvents.length,
          attendedEvents: Math.floor(savedEvents.length * 0.7), // Simulated data
          likedCategories,
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLanguageChange = async (lang: string) => {
    await changeLanguage(lang);
  };

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
      year: 'numeric',
      month: 'long',
    });
  };

  const navigateToSettings = () => {
    router.push('/config');
  };

  const navigateToSaved = () => {
    router.push('/(tabs)/saved');
  };

  const handleLogout = () => {
    // Add logout functionality here
    router.replace('/registerLogin');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with avatar and user info */}
      <View style={styles.header}>
        <Image source={user.avatar} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userHandle}>@{user.username}</Text>
          <Text style={styles.joinDate}>
            {t('profile.joinedOn', { date: formatJoinDate(user.joinDate) })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={navigateToSettings}
        >
          <Ionicons name='settings-outline' size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* User Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.savedEvents}</Text>
          <Text style={styles.statLabel}>{t('profile.savedEvents')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.attendedEvents}</Text>
          <Text style={styles.statLabel}>{t('profile.attendedEvents')}</Text>
        </View>
      </View>

      {/* Favorite Categories */}
      {stats.likedCategories.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {t('profile.favoriteCategories')}
          </Text>
          <View style={styles.categoriesContainer}>
            {stats.likedCategories.map((category, index) => (
              <View key={index} style={styles.categoryTag}>
                <Text style={styles.categoryText}>{category.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recently Saved Events */}
      {recentEvents.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('profile.recentlySaved')}
            </Text>
            <TouchableOpacity onPress={navigateToSaved}>
              <Text style={styles.seeAllText}>{t('profile.seeAll')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.eventsPreview}>
            {recentEvents.map((event, index) => (
              <TouchableOpacity
                key={index}
                style={styles.eventPreviewItem}
                onPress={() => {
                  setSelectedEvent(event);
                  setDetailModalVisible(true);
                }}
              >
                <Image
                  source={
                    event.images && event.images.length > 0
                      ? { uri: event.images[0].image_url }
                      : require('@assets/images/FotoJazz.jpg')
                  }
                  style={styles.eventImage}
                />
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {event.title}
                </Text>
                <Text style={styles.eventDate}>
                  {new Date(event.date_ini).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Language Selector */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.languageSelector}>
          <TouchableOpacity
            style={[
              styles.languageOption,
              i18n.language === 'es' && styles.languageOptionActive,
            ]}
            onPress={() => handleLanguageChange('es')}
          >
            <Text
              style={[
                styles.languageText,
                i18n.language === 'es' && styles.languageTextActive,
              ]}
            >
              {t('settings.spanish')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageOption,
              i18n.language === 'en' && styles.languageOptionActive,
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text
              style={[
                styles.languageText,
                i18n.language === 'en' && styles.languageTextActive,
              ]}
            >
              {t('settings.english')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageOption,
              i18n.language === 'ca' && styles.languageOptionActive,
            ]}
            onPress={() => handleLanguageChange('ca')}
          >
            <Text
              style={[
                styles.languageText,
                i18n.language === 'ca' && styles.languageTextActive,
              ]}
            >
              {t('settings.catalan')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name='log-out-outline' size={22} color={colors.lightText} />
        <Text style={styles.logoutText}>{t('profile.logout')}</Text>
      </TouchableOpacity>

      {/* Version Info */}
      <Text style={styles.versionText}>Agendados v1.0.0</Text>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          visible={detailModalVisible}
          onClose={() => {
            setDetailModalVisible(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.border,
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    marginBottom: spacing.sm,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  categoryText: {
    color: colors.lightText,
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  divider: {
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
    width: 1,
  },
  editButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  eventDate: {
    color: colors.textSecondary,
    fontSize: 10,
    paddingBottom: 6,
    paddingHorizontal: 6,
  },
  eventImage: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    height: 90,
    width: '100%',
  },
  eventPreviewItem: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    overflow: 'hidden',
    width: '30%',
  },
  eventTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
    padding: 6,
  },
  eventsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  joinDate: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  languageOption: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  languageOptionActive: {
    backgroundColor: colors.primary,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  languageTextActive: {
    color: colors.lightText,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingVertical: 12,
  },
  logoutText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  sectionContainer: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.subtitle.fontSize,
    fontWeight: '600', // Using a specific valid fontWeight value
    marginBottom: spacing.sm,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 14,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  statValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.md,
  },
  userHandle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    ...typography.subtitle,
    color: colors.text,
    fontWeight: 'bold',
  },
  versionText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
});
