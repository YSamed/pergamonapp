import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { TasksScreen } from '../screens/TasksScreen';
import type { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const d = colors.dark;

// Placeholder screen'ler — ileride gerçek ekranlarla değiştirilecek
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{name}</Text>
    <Text style={styles.placeholderSub}>Yakında 🚀</Text>
  </View>
);

const TAB_ICONS: Record<string, string> = {
  Tasks: '✓',
  Home: '⭐',
  Progress: '📊',
  Clan: '🛡️',
  Profile: '👤',
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Tasks"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: d.primary,
          tabBarInactiveTintColor: d.textMuted,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
              <Text style={[styles.tabIcon, { color }]}>
                {TAB_ICONS[route.name] ?? '●'}
              </Text>
            </View>
          ),
        })}
      >
        <Tab.Screen name="Tasks" component={TasksScreen} />
        <Tab.Screen name="Home" children={() => <PlaceholderScreen name="Home" />} />
        <Tab.Screen name="Progress" children={() => <PlaceholderScreen name="Progress" />} />
        <Tab.Screen name="Clan" children={() => <PlaceholderScreen name="Clan" />} />
        <Tab.Screen name="Profile" children={() => <PlaceholderScreen name="Profile" />} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: d.surface,
    borderTopColor: d.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
  },
  tabIconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  tabIconWrapActive: {
    backgroundColor: d.primaryDim,
  },
  tabIcon: {
    fontSize: 20,
  },
  placeholder: {
    flex: 1,
    backgroundColor: d.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  placeholderText: {
    color: d.text,
    fontSize: 22,
    fontWeight: '700',
  },
  placeholderSub: {
    color: d.textSecondary,
    fontSize: 15,
  },
});
