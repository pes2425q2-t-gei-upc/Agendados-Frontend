import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import { colors, spacing } from '@styles/globalStyles';

const WELCOME_STEPS = [
  {
    title: '¡Bienvenido a Agendados!',
    description:
      'Te guiaremos a través de las principales características de la app.',
    icon: 'information-circle',
    position: { top: '40%', left: '10%' },
  },
  {
    title: 'Eventos Recomendados',
    description: 'Desliza para ver eventos recomendados para ti',
    icon: 'home',
    position: { top: '40%', left: '10%' },
    tabHighlight: 'main',
  },
  {
    title: 'Descubre Eventos',
    description: 'En el mapa podrás explorar todos los eventos disponibles',
    icon: 'compass',
    position: { top: '40%', left: '10%' },
    tabHighlight: 'explore',
  },
  {
    title: 'Consulta tus Favoritos',
    description: 'Consulta tus eventos guardados previamente',
    icon: 'bookmark',
    position: { top: '40%', left: '10%' },
    tabHighlight: 'saved',
  },
  {
    title: 'Visualiza tu perfil',
    description: 'Visualiza los logros y características de tu perfil',
    icon: 'person',
    position: { top: '40%', left: '10%' },
    tabHighlight: 'profile',
  },
];

export const Welcome = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!visible) {
    return null;
  }

  const step = WELCOME_STEPS[currentStep];

  const handleNext = async () => {
    if (currentStep < WELCOME_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      onClose();
    }
  };

  const getTabArrowIconStyle = (tab: string | undefined) => {
    if (!tab) {
      return null;
    }

    const tabPositions: Record<string, number> = {
      main: 0,
      explore: 1,
      saved: 2,
      profile: 3,
    };

    const index = tabPositions[tab];
    if (index === undefined) {
      return null;
    }

    const tabWidth = Dimensions.get('window').width / 4;
    const iconSize = 30;
    const left = index * tabWidth + tabWidth / 2 - iconSize / 2 - 12;

    return {
      position: 'absolute' as const,
      bottom: 15,
      left,
      zIndex: 20,
    };
  };

  return (
    <View style={styles.overlayContainer}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name='close' size={24} color={colors.lightText} />
      </TouchableOpacity>

      <View style={styles.overlay} />

      <View style={styles.tooltip}>
        <View style={styles.tooltipIcon}>
          <Ionicons name={step.icon as any} size={30} color={colors.primary} />
        </View>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>

        <View style={styles.dotsContainer}>
          {WELCOME_STEPS.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentStep === index && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentStep === WELCOME_STEPS.length - 1
              ? '¡Empezar!'
              : 'Siguiente'}
          </Text>
        </TouchableOpacity>
      </View>

      {step.tabHighlight && (
        <View
          style={[
            getTabArrowIconStyle(step.tabHighlight),
            styles.arrowContainer,
          ]}
        >
          <Ionicons name='arrow-down' size={50} color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: colors.primary,
    width: 20,
  },
  arrowContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    padding: 3,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: colors.lightText,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 40,
    zIndex: 30,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  dot: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 8,
    marginHorizontal: 4,
    width: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  tooltip: {
    alignSelf: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    elevation: 5,
    maxWidth: '85%',
    padding: spacing.lg,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    top: '30%',
  },
  tooltipIcon: {
    marginBottom: spacing.md,
  },
});
