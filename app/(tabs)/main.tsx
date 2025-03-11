import React from 'react';
import { View, StyleSheet } from 'react-native';

import Card from '@components/cardEvent';

const e1 = {
  name: 'Concierto de Jazz',
  image: require('@assets/images/FotoJazz.jpg'),
  place: 'UPC',
  cat: 'Conciertos',
  date: '22/01/2026',
};

const e2 = {
  name: 'Festival Arena Sound',
  image: require('@assets/images/FotoConcierto.jpg'),
  place: 'Playa Barceloneta',
  cat: 'Festivales',
  date: '02/12/2028',
};

const styles = StyleSheet.create({
  pageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default function main() {
  return (
    <View style={styles.pageContainer}>
      <Card event1={e2} />
    </View>
  );
}
