import React from 'react';
import { Text, Image, ImageBackground, View, StyleSheet } from 'react-native';

const App = () => {
  return (
    <View style={styles.pageContainer}>
      <View style={styles.card}>
        <ImageBackground
          source={require('../assets/images/FotoJazz.jpg')}
          style={styles.image}
        >
          <View style={styles.cardInner}>
            <Text style={styles.name}>Concierto de Jazz</Text>
            <Text style={styles.info}>Lugar: UPC</Text>
            <Text style={styles.info}>Distancia: 32 km</Text>
          </View>
        </ImageBackground>
      </View>
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

export default App;
