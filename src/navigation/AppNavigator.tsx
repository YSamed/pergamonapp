import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { TasksScreen } from '../screens/TasksScreen';
import { CreateTaskScreen } from '../screens/CreateTaskScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { SkillsScreen } from '../screens/SkillsScreen';
import { SkillDetailScreen } from '../screens/SkillDetailScreen';
import { SkillStatisticsScreen } from '../screens/SkillStatisticsScreen';
import type { MainTabParamList, RootStackParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const d = colors.dark;

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{name}</Text>
    <Text style={styles.placeholderSub}>Yakında 🚀</Text>
  </View>
);

const TAB_ICONS: Record<string, string> = {
  Tasks: '✓',
  Progress: '📊',
  Clan: '🛡️',
  Profile: '👤',
};

const MainTabs = () => (
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
    <Tab.Screen name="Progress" component={SkillsScreen} />
    <Tab.Screen name="Clan" children={() => <PlaceholderScreen name="Clan" />} />
    <Tab.Screen name="Profile" children={() => <PlaceholderScreen name="Profile" />} />
  </Tab.Navigator>
);

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="SkillDetail" component={SkillDetailScreen} />
      <Stack.Screen name="SkillStatistics" component={SkillStatisticsScreen} />
      <Stack.Screen
        name="CreateTask"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      >
        {({ navigation }) => (
          <CreateTaskScreen
            onClose={() => navigation.goBack()}
            onSubmit={(task) => {
              // TODO: servise gönder
              console.log('New task:', task);
              navigation.goBack();
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer>
);

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
