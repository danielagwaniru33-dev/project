// src/navigation/AppNavigator.js
// ============================================================
//  FitQuest – Application Navigation Structure
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { useAuth } from '../context/AuthContext';
import LoginScreen      from '../screens/LoginScreen';
import HomeScreen       from '../screens/HomeScreen';
import ActivityScreen   from '../screens/ActivityScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import ProfileScreen    from '../screens/ProfileScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_ICONS = {
  Home:        { active: '🏠', inactive: '🏡' },
  Activity:    { active: '🏃', inactive: '🏃' },
  Leaderboard: { active: '🏆', inactive: '🏅' },
  Challenges:  { active: '⚔️',  inactive: '🎯' },
  Profile:     { active: '👤', inactive: '👤' },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   '#1A3A5C',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8EDF5',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22 }}>
            {focused ? TAB_ICONS[route.name]?.active : TAB_ICONS[route.name]?.inactive}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home"        component={HomeScreen} />
      <Tab.Screen name="Activity"    component={ActivityScreen} options={{ title: 'Track' }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Ranks' }} />
      <Tab.Screen name="Challenges"  component={ChallengesScreen} options={{ title: 'Compete' }} />
      <Tab.Screen name="Profile"     component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, initialising } = useAuth();

  if (initialising) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashTitle}>FitQuest 🏅</Text>
        <ActivityIndicator color="#1A3A5C" size="large" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FB' },
  splashTitle: { fontSize: 42, fontWeight: '900', color: '#1A3A5C' },
});
