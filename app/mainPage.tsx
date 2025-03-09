import React from 'react';
import { Text, Image, ImageBackground, View, StyleSheet } from 'react-native';

import Card from '../components/cardEvent.tsx';

const e1 = {
  name: 'Concierto de Jazz',
  image: require('../assets/images/FotoJazz.jpg'),
  place: 'UPC',
  dist: '32',
};

const e2 = {
  name: 'Festival',
  image: require('../assets/images/FotoConcierto.jpg'),
  place: 'Playa Barceloneta',
  dist: '3',
};

const App = () => {
  return (
    <View style={styles.pageContainer}>
      <Card event1={e1} />
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default App;
