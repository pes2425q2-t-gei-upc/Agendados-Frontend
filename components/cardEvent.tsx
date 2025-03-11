import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Text,
  ImageBackground,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

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
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => router.push('/main')}
          >
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

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    elevation: 12,
    height: '95%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    width: '95%',
  },

  cardInner: {
    padding: 10,
    zIndex: 2,
  },

  dateTag: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: 'absolute',
    right: 10,
    top: 10,
  },

  dateText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },

  gradientContainer: {
    bottom: 0,
    height: '60%',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },

  image: {
    borderRadius: 10,
    height: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: '100%',
  },

  infoButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    borderRadius: 25,
    bottom: 10,
    height: 50,
    justifyContent: 'center',
    padding: 0,
    position: 'absolute',
    right: 10,
    width: 50,
  },

  name: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },

  tag: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    flexDirection: 'row',
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  tagText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
});

export default Card;
