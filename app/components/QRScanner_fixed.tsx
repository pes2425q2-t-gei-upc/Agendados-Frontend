import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, spacing } from '@styles/globalStyles';

interface QRScannerProps {
  visible: boolean;
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({
  visible,
  onScan,
  onClose,
}: QRScannerProps) {
  const { t } = useTranslation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    if (visible) {
      getBarCodeScannerPermissions();
      setScanned(false);
    }
  }, [visible]);

  const handleBarCodeScanned = ({ data }: BarCodeScannerResult) => {
    if (scanned) {
      return;
    }
    setScanned(true);
    onScan(data);
  };

  if (!visible) {
    return null;
  }

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType='slide'>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            {t('requestingCameraPermission') ||
              'Requesting camera permission...'}
          </Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType='slide'>
        <View style={styles.permissionContainer}>
          <Ionicons
            color={colors.textSecondary}
            name='camera-outline'
            size={64}
          />
          <Text style={styles.permissionTitle}>
            {t('cameraPermissionTitle') || 'Camera Permission Required'}
          </Text>
          <Text style={styles.permissionText}>
            {t('cameraPermissionMessage') ||
              'Please grant camera permission to scan QR codes'}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{t('close') || 'Close'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType='slide'>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('scanQRCode') || 'Scan QR Code'}</Text>
          <TouchableOpacity style={styles.closeIconButton} onPress={onClose}>
            <Ionicons color={colors.lightText} name='close' size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.camera}
          />
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={styles.scanCorner} />
              <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
              <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
              <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
            </View>
          </View>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            {t('scanQRCodeDescription') ||
              'Point your camera at a QR code to scan it'}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  closeButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeButtonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeIconButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  instructionText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: colors.backgroundAlt,
    padding: spacing.lg,
  },
  overlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  permissionContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  permissionText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  permissionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  scanArea: {
    borderColor: colors.primary,
    borderWidth: 2,
    height: 200,
    position: 'relative',
    width: 200,
  },
  scanCorner: {
    borderColor: colors.primary,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    height: 20,
    left: -2,
    position: 'absolute',
    top: -2,
    width: 20,
  },
  scanCornerBottomLeft: {
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderTopWidth: 0,
    bottom: -2,
    top: 'auto',
  },
  scanCornerBottomRight: {
    borderBottomWidth: 4,
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderTopWidth: 0,
    bottom: -2,
    left: 'auto',
    right: -2,
    top: 'auto',
  },
  scanCornerTopRight: {
    borderLeftWidth: 0,
    borderRightWidth: 4,
    left: 'auto',
    right: -2,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
