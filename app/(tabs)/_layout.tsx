import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { Icon } from '../../components/ui/Icon';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  // Safe bottom padding:
  // - When insets.bottom is reported (iOS home indicator or modern Android gesture nav),
  //   give insets.bottom plus comfortable breathing space so labels never touch the bar.
  // - When insets.bottom is 0 (3-button navigation on Android or devices where inset is 0),
  //   provide a generous 20px bottom padding so labels are safely elevated from the screen edge.
  const bottomInset = insets.bottom > 0
    ? insets.bottom + (Platform.OS === 'android' ? 8 : 4)
    : (Platform.OS === 'android' ? 20 : 16);

  const tabHeight = 58 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          borderTopWidth: StyleSheet.hairlineWidth,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="House"
              size="sm"
              color={color}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="Barbell"
              size="sm"
              color={color}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="ChartLineUp"
              size="sm"
              color={color}
              weight={focused ? 'bold' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="GearSix"
              size="sm"
              color={color}
              weight={focused ? 'fill' : 'regular'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
