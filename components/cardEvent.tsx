import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Text,
  ImageBackground,
  View,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { Event as EventModel } from '@models/Event';
import { styles } from '@styles/mainPageStyles';

const Card = (props: {
  event: EventModel;
  onInfoPress: ((event: GestureResponderEvent) => void) | undefined;
}) => {
  console.log('Pressed!');
  const event = props.event;
  const name = event.title;
  const image = event.images[0]
    ? { uri: event.images[0].image_url }
    : require('../assets/images/agendadosbg.png');
  const place =
    typeof event.location?.town === 'string'
      ? event.location.town
      : 'Unknown Place';
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
            <TouchableOpacity
              style={styles.infoButton}
              onPress={props.onInfoPress}
            >
              <Ionicons
                name='information-circle-outline'
                size={30}
                color='white'
              />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default Card;
