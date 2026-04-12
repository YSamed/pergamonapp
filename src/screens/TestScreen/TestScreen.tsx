import React from 'react';
import { Text, View } from 'react-native';

import { ScreenContainer } from '../../components';
import { strings } from '../../constants/strings';
import { TestCard, testItems } from '../../features/test';
import { styles } from './TestScreen.styles';

export const TestScreen = () => {
  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.overline}>{strings.testScreen.overline}</Text>
        <Text style={styles.title}>{strings.testScreen.title}</Text>
        <Text style={styles.description}>{strings.testScreen.description}</Text>
      </View>

      {testItems.map(item => (
        <TestCard key={item.id} item={item} />
      ))}
    </ScreenContainer>
  );
};
