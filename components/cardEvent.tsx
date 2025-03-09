import React from 'react';
import { Text, Image, ImageBackground, View, StyleSheet } from 'react-native';

const Card = (props) => {
  const { name, image, place, dist } = props.event1;
  return (
    <View style={styles.card}>
      <ImageBackground source={image} style={styles.image}>
        <View style={styles.cardInner}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.info}>Lugar: {place}</Text>
          <Text style={styles.info}>Distancia: {dist} km</Text>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    elevation: 12,

    height: '80%',
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
  },

  image: {
    borderRadius: 10,
    height: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',

    width: '100%',
  },

  info: {
    color: 'white',
    fontSize: 13,
    lineHeight: 15,
  },

  name: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },

  pageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default Card;
