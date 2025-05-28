/* eslint-disable react-native/no-unused-styles */
// app/config.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  StatusBar,
  SafeAreaView,
  Animated,
} from 'react-native';

import { useAuth } from '@context/authContext';
import { colors, spacing, globalStyles } from '@styles/globalStyles';
import { changeLanguage } from 'localization/i18n';

import LanguageSelector from '../components/LanguageSelector';

import { uploadProfileImage } from './Services/AuthService'; // Importar el servicio

const HEADER_MAX_HEIGHT = 240;
const NAV_BAR_HEIGHT = 56;
const STATUS_BAR = Platform.select({
  ios: 0,
  android: StatusBar.currentHeight ?? 0,
}) as number;

const Config = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { userInfo, loading, changePassword, userToken, updateUserProfile } =
    useAuth(); // Añadir userToken y updateUserProfile
  const scrollY = useRef(new Animated.Value(0)).current;

  // Estados de perfil
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  // Edición de username
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  // Cargando (guardado/permisos/subida)
  const [isSaving, setIsSaving] = useState(false); // Renombrado desde isLoading para claridad

  // Modal de cambio de contraseña
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Cargar datos del usuario
  useEffect(() => {
    if (!userInfo) {
      return;
    }
    setUsername(userInfo.username ?? '');
    setEmail(userInfo.email ?? '');
    setAvatar(userInfo.profile_image ?? null);
  }, [userInfo]);

  // Animaciones del header
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 60, 110],
    outputRange: [HEADER_MAX_HEIGHT, 140, 0],
    extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 40, 90],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });
  const titleScale = scrollY.interpolate({
    inputRange: [0, 60, 120],
    outputRange: [1, 0.9, 0.8],
    extrapolate: 'clamp',
  });
  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 60, 120],
    outputRange: [0, -5, -10],
    extrapolate: 'clamp',
  });
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });
  const navBarOpacity = scrollY.interpolate({
    inputRange: [40, 90],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Handlers
  const handleBackPress = () => router.back();

  const handleLanguageChange = async (lang: 'es' | 'en' | 'ca') => {
    try {
      setIsSaving(true);
      await changeLanguage(lang);
    } catch {
      Alert.alert(t('settings.error'), t('settings.languageChangeError'));
    } finally {
      setIsSaving(false);
    }
  };

  // Avatar
  const handleAvatarUpdate = async (imageUri: string) => {
    if (!userToken || !updateUserProfile) {
      Alert.alert(t('settings.error'), t('settings.updateProfileErrorNoAuth'));
      return;
    }
    setIsSaving(true);
    try {
      const updatedUser = await uploadProfileImage(userToken, imageUri);
      if (updatedUser && updatedUser.profile_image) {
        await updateUserProfile({ profile_image: updatedUser.profile_image }); // Changed 'avatar' to 'profile_image'
        setAvatar(updatedUser.profile_image);
        // Eliminamos el Alert que causaba la interrupción
      } else {
        throw new Error(t('settings.avatarUpdateResponseError'));
      }
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      Alert.alert(
        t('settings.error'),
        error.message ?? t('settings.updateProfileError')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('settings.permissionRequired'),
        t('settings.galleryPermissionMessage')
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      // setAvatar(uri); // Se actualiza en handleAvatarUpdate tras éxito
      // handleSaveProfile({ avatar: uri }); // Reemplazado por handleAvatarUpdate
      await handleAvatarUpdate(uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('settings.permissionRequired'),
        t('settings.cameraPermissionMessage')
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      // setAvatar(uri); // Se actualiza en handleAvatarUpdate tras éxito
      // handleSaveProfile({ avatar: uri }); // Reemplazado por handleAvatarUpdate
      await handleAvatarUpdate(uri);
    }
  };

  const showAvatarOptions = () =>
    Alert.alert(
      t('settings.changeProfilePhoto'),
      '',
      [
        { text: t('settings.takePhoto'), onPress: handleTakePhoto },
        { text: t('settings.chooseFromLibrary'), onPress: pickImage },
        { text: t('common.cancel'), style: 'cancel' },
      ],
      { cancelable: true }
    );

  const handleSaveUsername = async () => {
    if (username.trim().length < 3) {
      Alert.alert(
        t('settings.validationError'),
        t('settings.usernameMinLength')
      );
      return;
    }
    if (!updateUserProfile) {
      Alert.alert(t('settings.error'), t('settings.updateProfileErrorNoAuth'));
      return;
    }
    setIsSaving(true);
    try {
      await updateUserProfile({ username });
      Alert.alert(t('settings.success'), t('settings.profileUpdated'));
      setIsEditingUsername(false);
    } catch (error: any) {
      console.error('Error saving username:', error);
      Alert.alert(
        t('settings.error'),
        error.message ?? t('settings.updateProfileError')
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Cambio de contraseña
  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert(
        t('settings.validationError'),
        t('settings.currentPasswordRequired')
      );
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(
        t('settings.validationError'),
        t('settings.passwordMinLength')
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(
        t('settings.validationError'),
        t('settings.passwordsDoNotMatch')
      );
      return;
    }
    try {
      setIsSaving(true);
      const ok = await changePassword(currentPassword, newPassword);
      if (ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setChangePasswordVisible(false);
        Alert.alert(t('settings.success'), t('settings.passwordUpdated'));
      } else {
        Alert.alert(
          t('settings.error'),
          t('settings.currentPasswordIncorrect')
        );
      }
    } catch (err) {
      console.error('changePassword error:', err);
      Alert.alert(t('settings.error'), t('settings.passwordChangeError'));
    } finally {
      setIsSaving(false);
    }
  };

  const renderChangePasswordModal = () => (
    <Modal
      visible={changePasswordVisible}
      animationType='slide'
      transparent
      onRequestClose={() => setChangePasswordVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('settings.changePassword')}
            </Text>
            <TouchableOpacity
              onPress={() => setChangePasswordVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name='close' size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {/** Campos de contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {t('settings.currentPassword')}
              </Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder={t('settings.enterCurrentPassword')}
                secureTextEntry
                autoCapitalize='none'
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('settings.newPassword')}</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={t('settings.enterNewPassword')}
                secureTextEntry
                autoCapitalize='none'
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {t('settings.confirmPassword')}
              </Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('settings.confirmNewPassword')}
                secureTextEntry
                autoCapitalize='none'
              />
            </View>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.disabledButton]}
              onPress={handleChangePassword}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size='small' color={colors.lightText} />
              ) : (
                <Text style={styles.saveButtonText}>
                  {t('settings.updatePassword')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.centeredContainer]}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={{ marginTop: 20 }}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <>
      {/* HEADER EXPANDIBLE */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.headerSafe}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backBtn}>
              <Ionicons name='arrow-back' size={24} color='white' />
            </TouchableOpacity>
          </SafeAreaView>
          <Animated.View
            style={[styles.headerAvatarContainer, { opacity: headerOpacity }]}
          >
            <TouchableOpacity
              onPress={isSaving ? undefined : showAvatarOptions}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.headerAvatar} />
              ) : (
                <View style={styles.headerAvatarPlaceholder}>
                  <Ionicons name='person' size={30} color='white' />
                </View>
              )}
              {isSaving && (
                <View style={[styles.loadingOverlay, { borderRadius: 30 }]}>
                  <ActivityIndicator size='small' color={colors.lightText} />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={[
              styles.headerTitleContainer,
              {
                opacity: titleOpacity,
                transform: [
                  { scale: titleScale },
                  { translateY: titleTranslateY },
                ],
              },
            ]}
          >
            <Text style={styles.headerTitle}>{t('settings.title')}</Text>
            <Text style={styles.headerSubtitle}>@{username}</Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* NAVBAR COMPACTA */}
      <Animated.View style={[styles.navBar, { opacity: navBarOpacity }]}>
        <SafeAreaView style={styles.navBarContent}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name='arrow-back' size={24} color='white' />
          </TouchableOpacity>
          <Animated.Text
            style={[styles.navBarTitle, { opacity: navBarOpacity }]}
          >
            {t('settings.title')}
          </Animated.Text>
          <TouchableOpacity>
            <Ionicons name='settings-outline' size={24} color='white' />
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>

      {/* CONTENIDO PRINCIPAL */}
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          contentContainerStyle={{
            paddingTop: HEADER_MAX_HEIGHT,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xl * 2,
          }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={8}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          overScrollMode='never'
        >
          {/* Perfil */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
            <View style={styles.avatarContainer}>
              <TouchableOpacity
                onPress={isSaving ? undefined : showAvatarOptions}
              >
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name='person' size={60} color={colors.border} />
                  </View>
                )}
                {isSaving ? (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size='small' color={colors.lightText} />
                  </View>
                ) : (
                  <View style={styles.avatarEditButton}>
                    <Ionicons
                      name='camera'
                      size={20}
                      color={colors.lightText}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.profileItem}>
              <View style={styles.profileItemHeader}>
                <Text style={styles.profileItemLabel}>
                  {t('settings.username')}
                </Text>
              </View>
              {isEditingUsername ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={username}
                    onChangeText={setUsername}
                    placeholder={t('settings.enterUsername')}
                    autoCapitalize='none'
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => setIsEditingUsername(false)}
                    >
                      <Ionicons
                        name='close-outline'
                        size={22}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={handleSaveUsername}
                    >
                      <Ionicons
                        name='checkmark-outline'
                        size={22}
                        color={colors.success}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Text style={styles.profileItemValue}>@{username}</Text>
              )}
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileItemLabel}>{t('settings.email')}</Text>
              <Text style={styles.profileItemValue}>{email}</Text>
            </View>
            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={() => setChangePasswordVisible(true)}
            >
              <Ionicons name='key-outline' size={22} color={colors.primary} />
              <Text style={styles.changePasswordText}>
                {t('settings.changePassword')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Idioma */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
            <LanguageSelector onLanguageChange={handleLanguageChange} />
          </View>

          {/* Privacidad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/TermsOfService')}
            >
              <Ionicons
                name='document-text-outline'
                size={22}
                color={colors.text}
              />
              <Text style={styles.menuItemText}>
                {t('settings.termsOfService')}
              </Text>
              <Ionicons
                name='chevron-forward'
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/PrivacyPolicy')}
            >
              <Ionicons
                name='shield-checkmark-outline'
                size={22}
                color={colors.text}
              />
              <Text style={styles.menuItemText}>
                {t('settings.privacyPolicy')}
              </Text>
              <Ionicons
                name='chevron-forward'
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>Agendados v0.0.3</Text>
        </Animated.ScrollView>
      </SafeAreaView>

      {renderChangePasswordModal()}
    </>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 50,
    height: 100,
    width: 100,
  },
  avatarContainer: { alignItems: 'center', marginVertical: spacing.md },
  avatarEditButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 15,
    bottom: 0,
    elevation: 3,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 30,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderRadius: 50,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 100,
    justifyContent: 'center',
    width: 100,
  },
  backBtn: { padding: spacing.xs },
  changePasswordButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  changePasswordText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  closeButton: { padding: 4 },
  disabledButton: { backgroundColor: colors.disabled },
  editActions: { flexDirection: 'row', marginLeft: spacing.sm },
  editButton: { marginLeft: 4, padding: 8 },
  editContainer: { alignItems: 'center', flexDirection: 'row', marginTop: 4 },
  editInput: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 16,
    padding: spacing.sm,
  },
  header: {
    backgroundColor: 'transparent',
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  headerAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'white',
    borderRadius: 30,
    borderWidth: 2,
    height: 60,
    width: 60,
  },
  headerAvatarContainer: { alignItems: 'center', marginBottom: spacing.sm },
  headerAvatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'white',
    borderRadius: 30,
    borderWidth: 2,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  headerGradient: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.md,
    paddingTop: STATUS_BAR + 20,
  },
  headerSafe: {
    alignItems: 'center',
    flexDirection: 'row',
    left: 0,
    paddingHorizontal: spacing.md,
    paddingTop: STATUS_BAR,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  headerTitleContainer: { alignItems: 'center', marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    padding: spacing.sm,
  },
  inputContainer: { marginBottom: spacing.md },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
    justifyContent: 'center',
  },
  menuItem: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  menuItemText: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    marginLeft: spacing.sm,
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    elevation: 5,
    padding: spacing.lg,
    width: '90%',
  },
  modalContent: { marginBottom: spacing.md },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  navBar: {
    backgroundColor: colors.primary,
    elevation: 6,
    height: NAV_BAR_HEIGHT + STATUS_BAR,
    left: 0,
    paddingTop: STATUS_BAR,
    position: 'absolute',
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    top: 0,
    zIndex: 2,
  },
  navBarContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  navBarTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  profileItem: { marginBottom: spacing.md },
  profileItemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileItemLabel: { color: colors.textSecondary, fontSize: 14 },
  profileItemValue: { color: colors.text, fontSize: 16 },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  saveButtonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    elevation: 2,
    marginBottom: spacing.xl,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
  },
  toggleInfo: { alignItems: 'center', flexDirection: 'row' },
  toggleItem: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  toggleLabel: { color: colors.text, fontSize: 16, marginLeft: spacing.sm },
  versionText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});

export default Config;
