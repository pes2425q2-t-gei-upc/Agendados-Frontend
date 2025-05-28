import { BarCodeScanner, BarCodeScanningResult } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@styles/globalStyles';

interface QRScannerProps {
  visible: boolean;
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ visible, onScan, onClose }: QRScannerProps) {
  const { t } = useTranslation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    if (visible) {
      getCameraPermissions();
    }
  }, [visible]);

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    if (scanned) return;
    
    setScanned(true);
    onScan(data);
    onClose();
  };

  const handleClose = () => {
    setScanned(false);
    onClose();
  };

  if (!visible) return null;

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.message}>{t('common.loading')}</Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.permissionTitle}>
              {t('rooms.cameraPermissionTitle')}
            </Text>
            <Text style={styles.permissionMessage}>
              {t('rooms.cameraPermissionMessage')}
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleClose}>
              <Text style={styles.buttonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.lightText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('rooms.scanQRCode')}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.cameraContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.camera}
          />
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
          </View>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            {t('rooms.scanQRCodeDescription')}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  closeButton: {
    padding: spacing.sm,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 50,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    color: colors.lightText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructions: {
    backgroundColor: colors.backgroundAlt,
    padding: spacing.lg,
  },
  instructionsText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  message: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionMessage: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  permissionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  placeholder: {
    width: 24,
  },
  scanArea: {
    borderColor: colors.primary,
    borderRadius: 12,
    borderWidth: 3,
    height: 250,
    width: 250,
  },
});
