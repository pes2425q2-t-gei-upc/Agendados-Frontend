// components/ProfileAvatar.tsx
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@styles/globalStyles';
import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import Svg, { Circle, LinearGradient, Stop, Defs } from 'react-native-svg';

interface ProfileAvatarProps {
  avatar: string | null;
  savedEventsCount: number;
  isLoading?: boolean;
  onPress?: () => void;
  size?: number;
  showEditButton?: boolean;
}

/**
 * Componente de avatar de perfil con borde decorativo que cambia según la cantidad de eventos guardados
 */
const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatar,
  savedEventsCount,
  isLoading = false,
  onPress,
  size = 90,
  showEditButton = true,
}) => {
  // Determinar el nivel del badge según la cantidad de eventos guardados
  const getBadgeLevel = (): {
    level: string;
    colors: string[];
    strokeWidth: number;
    hasStar: boolean;
    rotation: boolean;
  } => {
    if (savedEventsCount >= 30) {
      // Nivel Premium
      return {
        level: 'premium',
        colors: ['#FFD700', '#FFA500', '#FF8C00', '#FFD700'], // Dorado con naranja
        strokeWidth: 3.5,
        hasStar: true,
        rotation: true,
      };
    } else if (savedEventsCount >= 16) {
      // Nivel Avanzado
      return {
        level: 'advanced',
        colors: ['#1E90FF', '#4169E1', '#0000CD', '#1E90FF'], // Azul real
        strokeWidth: 3,
        hasStar: false,
        rotation: true,
      };
    } else if (savedEventsCount >= 6) {
      // Nivel Intermedio
      return {
        level: 'intermediate',
        colors: ['#32CD32', '#228B22', '#008000', '#32CD32'], // Verde
        strokeWidth: 2.5,
        hasStar: false,
        rotation: false,
      };
    } else {
      // Nivel Básico
      return {
        level: 'basic',
        colors: ['#C0C0C0', '#A9A9A9', '#808080', '#C0C0C0'], // Plateado
        strokeWidth: 2,
        hasStar: false,
        rotation: false,
      };
    }
  };

  const badge = getBadgeLevel();
  const outerSize = size + badge.strokeWidth * 4;

  return (
    <View style={[styles.container, { width: outerSize, height: outerSize }]}>
      {/* Badge/Borde decorativo */}
      <Svg
        width={outerSize}
        height={outerSize}
        viewBox={`0 0 ${outerSize} ${outerSize}`}
      >
        <Defs>
          <LinearGradient
            id='badgeGradient'
            x1='0%'
            y1='0%'
            x2='100%'
            y2='100%'
          >
            {badge.colors.map((color, index) => (
              <Stop
                key={index}
                offset={`${(index * 100) / (badge.colors.length - 1)}%`}
                stopColor={color}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Circle
          cx={outerSize / 2}
          cy={outerSize / 2}
          r={(outerSize - badge.strokeWidth) / 2}
          stroke='url(#badgeGradient)'
          strokeWidth={badge.strokeWidth}
          fill='none'
        />
      </Svg>

      {/* Avatar */}
      <TouchableOpacity
        style={[styles.avatarButton, { width: size, height: size }]}
        onPress={onPress}
        disabled={isLoading || !onPress}
      >
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={[
              styles.avatar,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          >
            <Ionicons name='person' size={size * 0.5} color={colors.border} />
          </View>
        )}

        {/* Estrella para nivel premium */}
        {badge.hasStar && (
          <View style={styles.starContainer}>
            <Ionicons name='star' size={16} color='#FFD700' />
          </View>
        )}

        {/* Estado de carga */}
        {isLoading && (
          <View style={[styles.loadingOverlay, { borderRadius: size / 2 }]}>
            <ActivityIndicator size='small' color={colors.lightText} />
          </View>
        )}

        {/* Botón de editar */}
        {showEditButton && !isLoading && (
          <View style={styles.editButton}>
            <Ionicons name='camera' size={16} color={colors.lightText} />
          </View>
        )}
      </TouchableOpacity>

      {/* Badge de nivel (opcional) */}
      {savedEventsCount > 0 && (
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{savedEventsCount}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.backgroundAlt,
  },
  avatarButton: {
    overflow: 'hidden',
    position: 'absolute',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 15,
    bottom: 0,
    elevation: 3,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    width: 28,
  },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    bottom: 0,
    height: 24,
    justifyContent: 'center',
    left: 0,
    minWidth: 24,
    paddingHorizontal: 5,
    position: 'absolute',
  },
  levelText: {
    color: colors.lightText,
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'center',
  },
  starContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: 5,
    top: 5,
    width: 20,
  },
});

export default ProfileAvatar;
