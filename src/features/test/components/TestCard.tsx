import React from 'react';
import { Text, View } from 'react-native';

import { TestItem } from '../types';
import { styles } from './TestCard.styles';

type TestCardProps = {
  item: TestItem;
};

export const TestCard = ({ item }: TestCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );
};
