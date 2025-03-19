import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, ImageBackground, View, TouchableOpacity } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { styles } from '@styles/mainPageStyles';

const Card = (props) => {
  const { name, image, place, cat, date } = props.event1;
  const router = useRouter();
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
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons
              name='information-circle-outline'
              size={30}
              color='white'
            />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

export default Card;
