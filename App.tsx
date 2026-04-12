import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.dark.background} />
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
