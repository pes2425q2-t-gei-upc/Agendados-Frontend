// app/config.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';

import { useAuth } from '@context/authContext';
import {
  colors,
  spacing,
  typography,
  globalStyles,
} from '@styles/globalStyles';
import { changeLanguage } from 'localization/i18n';

import LanguageSelector from '../components/LanguageSelector';

const Config = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { userInfo, updateUserProfile, loading } = useAuth();

  // Estados de usuario
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados de notificaciones (para futura implementación)
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    if (userInfo) {
      setUsername(userInfo.username || '');
      setDisplayName(userInfo.name || userInfo.username || '');
      setEmail(userInfo.email || '');
      setAvatar(userInfo.avatar || null);
    }
  }, [userInfo]);

  const handleLanguageChange = async (lang: 'es' | 'en' | 'ca') => {
    try {
      setIsLoading(true);
      await changeLanguage(lang);
    } catch (error) {
      console.error('Error cambiando idioma:', error);
      Alert.alert(t('settings.error'), t('settings.languageChangeError'));
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Solicitar permiso a la galería
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          t('settings.permissionRequired'),
          t('settings.galleryPermissionMessage')
        );
        return;
      }

      // Iniciar el selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setAvatar(selectedAsset.uri);

        // Aquí se implementaría la lógica para guardar el avatar
        handleSaveProfile({
          avatar: selectedAsset.uri,
        });
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert(t('settings.error'), t('settings.imageSelectionError'));
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Solicitar permiso a la cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          t('settings.permissionRequired'),
          t('settings.cameraPermissionMessage')
        );
        return;
      }

      // Iniciar la cámara
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setAvatar(selectedAsset.uri);

        // Guardar el avatar
        handleSaveProfile({
          avatar: selectedAsset.uri,
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(t('settings.error'), t('settings.cameraError'));
    }
  };

  const showAvatarOptions = () => {
    Alert.alert(
      t('settings.changeProfilePhoto'),
      '',
      [
        {
          text: t('settings.takePhoto'),
          onPress: handleTakePhoto,
        },
        {
          text: t('settings.chooseFromLibrary'),
          onPress: pickImage,
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleSaveUsername = () => {
    if (username.trim().length < 3) {
      Alert.alert(
        t('settings.validationError'),
        t('settings.usernameMinLength')
      );
      return;
    }

    handleSaveProfile({ username });
    setIsEditingUsername(false);
  };

  const handleSaveDisplayName = () => {
    if (displayName.trim().length < 2) {
      Alert.alert(
        t('settings.validationError'),
        t('settings.displayNameMinLength')
      );
      return;
    }

    handleSaveProfile({ name: displayName });
    setIsEditingDisplayName(false);
  };

  const handleSaveProfile = async (data: any) => {
    try {
      setIsLoading(true);
      // Aquí iría la llamada al contexto de autenticación para actualizar el perfil
      // Por ahora, es un simulacro de la función
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulación de actualización exitosa
      Alert.alert(t('settings.success'), t('settings.profileUpdated'));

      // En una implementación real, se llamaría al contexto:
      // await updateUserProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(t('settings.error'), t('settings.updateProfileError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validaciones
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
      setIsLoading(true);
      // Simulación de actualización de contraseña
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Reiniciar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setChangePasswordVisible(false);

      Alert.alert(t('settings.success'), t('settings.passwordUpdated'));

      // En una implementación real:
      // await updatePassword(currentPassword, newPassword);
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert(t('settings.error'), t('settings.passwordChangeError'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderChangePasswordModal = () => {
    return (
      <Modal
        visible={changePasswordVisible}
        animationType='slide'
        transparent={true}
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
                <Text style={styles.inputLabel}>
                  {t('settings.newPassword')}
                </Text>
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
                style={[styles.saveButton, isLoading && styles.disabledButton]}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                {isLoading ? (
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
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.centeredContainer]}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={{ marginTop: 20 }}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      {/* Sección de Perfil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={showAvatarOptions}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name='person' size={60} color={colors.border} />
              </View>
            )}
            <View style={styles.avatarEditButton}>
              <Ionicons name='camera' size={20} color={colors.lightText} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Nombre para mostrar */}
        <View style={styles.profileItem}>
          <View style={styles.profileItemHeader}>
            <Text style={styles.profileItemLabel}>
              {t('settings.displayName')}
            </Text>
            {!isEditingDisplayName ? (
              <TouchableOpacity onPress={() => setIsEditingDisplayName(true)}>
                <Ionicons
                  name='create-outline'
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          {isEditingDisplayName ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={t('settings.enterDisplayName')}
                autoCapitalize='words'
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditingDisplayName(false)}
                >
                  <Ionicons
                    name='close-outline'
                    size={22}
                    color={colors.error}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleSaveDisplayName}
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
            <Text style={styles.profileItemValue}>{displayName}</Text>
          )}
        </View>

        {/* Nombre de usuario */}
        <View style={styles.profileItem}>
          <View style={styles.profileItemHeader}>
            <Text style={styles.profileItemLabel}>
              {t('settings.username')}
            </Text>
            {!isEditingUsername ? (
              <TouchableOpacity onPress={() => setIsEditingUsername(true)}>
                <Ionicons
                  name='create-outline'
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ) : null}
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

        {/* Email */}
        <View style={styles.profileItem}>
          <Text style={styles.profileItemLabel}>{t('settings.email')}</Text>
          <Text style={styles.profileItemValue}>{email}</Text>
        </View>

        {/* Cambiar contraseña */}
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

      {/* Sección de Idioma */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <LanguageSelector onLanguageChange={handleLanguageChange} />
      </View>

      {/* Sección de Notificaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>

        <View style={styles.toggleItem}>
          <View style={styles.toggleInfo}>
            <Ionicons
              name='notifications-outline'
              size={22}
              color={colors.text}
            />
            <Text style={styles.toggleLabel}>
              {t('settings.pushNotifications')}
            </Text>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={pushNotifications ? colors.primary : '#f4f3f4'}
            ios_backgroundColor={colors.border}
          />
        </View>

        <View style={styles.toggleItem}>
          <View style={styles.toggleInfo}>
            <Ionicons name='mail-outline' size={22} color={colors.text} />
            <Text style={styles.toggleLabel}>
              {t('settings.emailNotifications')}
            </Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={emailNotifications ? colors.primary : '#f4f3f4'}
            ios_backgroundColor={colors.border}
          />
        </View>
      </View>

      {/* Sección de Privacidad */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            /* Implementar navegación a términos */
          }}
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
          onPress={() => {
            /* Implementar navegación a política de privacidad */
          }}
        >
          <Ionicons
            name='shield-checkmark-outline'
            size={22}
            color={colors.text}
          />
          <Text style={styles.menuItemText}>{t('settings.privacyPolicy')}</Text>
          <Ionicons
            name='chevron-forward'
            size={22}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Versión de la app */}
      <Text style={styles.versionText}>Agendados v1.0.0</Text>

      {/* Modal de cambio de contraseña */}
      {renderChangePasswordModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 50,
    height: 100,
    width: 100,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
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
  closeButton: {
    padding: 4,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.lg,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  editActions: {
    flexDirection: 'row',
    marginLeft: spacing.sm,
  },
  editButton: {
    marginLeft: 4,
    padding: 8,
  },
  editContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
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
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    padding: spacing.sm,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '90%',
  },
  modalContent: {
    marginBottom: spacing.md,
  },
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
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  profileItem: {
    marginBottom: spacing.md,
  },
  profileItemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileItemLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  profileItemValue: {
    color: colors.text,
    fontSize: 16,
  },
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
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  toggleInfo: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  toggleItem: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    color: colors.text,
    fontSize: 16,
    marginLeft: spacing.sm,
  },
  versionText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.xl * 2,
    textAlign: 'center',
  },
});

export default Config;
