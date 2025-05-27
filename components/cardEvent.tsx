import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
  Text,
  ImageBackground,
  View,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import { TapGestureHandler } from 'react-native-gesture-handler';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { Event as EventModel } from '@models/Event';
import { styles } from '@styles/mainPageStyles';

export default function Card({
  event,
  onInfoPress,
  simultaneousHandlers,
  infoButtonRef,
}: {
  event: EventModel;
  onInfoPress: ((event: GestureResponderEvent) => void) | undefined;
  simultaneousHandlers?: any; // Añade esta prop para pasar el handler del swipe
  infoButtonRef: React.RefObject<any>;
}) {
  console.log('Pressed!');
  const name = event.title;
  const image = event.images[0]
    ? { uri: event.images[0].image_url }
    : require('../assets/images/agendadosbg.png');
  const place = event.location?.town.name ?? 'Unknown Place';
  const cat = event.categories?.[0]?.name || 'Unknown Category';
  const date = event.date_ini
    ? new Date(event.date_ini).toLocaleDateString('es', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : 'Unknown Date';

  return (
    <View style={styles.card}>
      <ImageBackground source={image} style={styles.image}>
        <View style={styles.gradientContainer}>
          <Svg height='100%' width='100%'>
            <Defs>
              <LinearGradient id='grad' x1='0%' y1='0%' x2='0%' y2='100%'>
                <Stop offset='0' stopColor='#000000' stopOpacity='0' />
                <Stop offset='1' stopColor='#000000' stopOpacity='0.8' />
              </LinearGradient>
            </Defs>
            <Rect x='0' y='0' width='100%' height='100%' fill='url(#grad)' />
          </Svg>
        </View>
        <View style={styles.dateTag}>
          <Ionicons name='calendar-outline' size={16} color='#fff' />
          <Text style={styles.dateText}>{date}</Text>
        </View>
        <View style={styles.cardInner}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.tag}>
            <Ionicons name='grid-outline' size={18} color='#fff' />
            <Text style={styles.tagText}>{cat}</Text>
          </View>
          <View style={styles.tag}>
            <Ionicons name='location-outline' size={18} color='#fff' />
            <Text style={styles.tagText}>{place}</Text>
          </View>
          <View pointerEvents='box-none'>
            <TapGestureHandler
              ref={infoButtonRef}
              onActivated={onInfoPress}
              simultaneousHandlers={simultaneousHandlers}
            >
              <TouchableOpacity
                style={styles.infoButton}
                onPress={onInfoPress}
                activeOpacity={0.7}
              >
                <Ionicons
                  name='information-circle-outline'
                  size={30}
                  color='white'
                />
              </TouchableOpacity>
            </TapGestureHandler>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
