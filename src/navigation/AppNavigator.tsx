import { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { TasksScreen } from '../screens/TasksScreen';
import { CreateTaskScreen } from '../screens/CreateTaskScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { SkillsScreen } from '../screens/SkillsScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { ClanScreen } from '../screens/ClanScreen';
import { SkillDetailScreen } from '../screens/SkillDetailScreen';
import { SkillStatisticsScreen } from '../screens/SkillStatisticsScreen';
import type { MainTabParamList, RootStackParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const d = colors;

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{name}</Text>
    <Text style={styles.placeholderSub}>Yakında 🚀</Text>
  </View>
);

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Tasks: 'checkmark-done-outline',
  Progress: 'stats-chart-outline',
  Community: 'people-outline',
  Clan: 'shield-outline',
  Profile: 'person-outline',
};

const ACTIVE_PILL_WIDTH = 56;

const GlassTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const [barWidth, setBarWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const itemWidth = barWidth > 0 ? barWidth / state.routes.length : 0;

  useEffect(() => {
    if (!itemWidth) return;
    const nextX = state.index * itemWidth + (itemWidth - ACTIVE_PILL_WIDTH) / 2;
    Animated.spring(translateX, {
      toValue: nextX,
      useNativeDriver: true,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
    }).start();
  }, [itemWidth, state.index, translateX]);

  return (
    <View style={styles.tabBarShell}>
      <View
        style={styles.tabBar}
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
      >
        <View style={styles.tabBarBackgroundWrap}>
          <BlurView intensity={35} tint="dark" style={styles.tabBarBlur} />
          <View style={styles.tabBarOverlay} />
        </View>

        {itemWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activePill,
              {
                transform: [{ translateX }],
              },
            ]}
          >
            <BlurView
              intensity={40}
              tint="light"
              style={styles.activePillBlur}
            />
            <View style={styles.activePillOverlay} />
          </Animated.View>
        ) : null}

        <View style={styles.tabItemsRow}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const { options } = descriptors[route.key];

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarButtonTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
              >
                <View style={styles.tabIconWrap}>
                  <Ionicons
                    name={TAB_ICONS[route.name] ?? 'ellipse-outline'}
                    size={20}
                    color={isFocused ? d.text : d.textMuted}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const MainTabs = () => (
  <Tab.Navigator
    initialRouteName="Tasks"
    tabBar={(props) => <GlassTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      sceneStyle: styles.scene,
      tabBarHideOnKeyboard: true,
    }}
  >
    <Tab.Screen name="Tasks" component={TasksScreen} />
    <Tab.Screen name="Progress" component={SkillsScreen} />
    <Tab.Screen name="Community" component={CommunityScreen} />
    <Tab.Screen name="Clan" component={ClanScreen} />
    <Tab.Screen
      name="Profile"
      children={() => <PlaceholderScreen name="Profile" />}
    />
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
          <CreateTaskScreen onClose={() => navigation.goBack()} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer>
);

const styles = StyleSheet.create({
  scene: {
    backgroundColor: d.background,
  },
  tabBarShell: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  tabBar: {
    height: 72,
    justifyContent: 'center',
  },
  tabBarBackgroundWrap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabBarBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  tabBarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,36,0.72)',
  },
  activePill: {
    position: 'absolute',
    top: 8,
    width: ACTIVE_PILL_WIDTH,
    height: 56,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: d.primary,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  activePillBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  activePillOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabItemsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrap: {
    width: ACTIVE_PILL_WIDTH,
    height: ACTIVE_PILL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
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
