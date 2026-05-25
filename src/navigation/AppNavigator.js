import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import PaywallScreen from '../screens/PaywallScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon component
const TabIcon = ({ emoji, focused, label }) => (
  <View style={tabStyles.iconWrapper}>
    <Text style={[tabStyles.emoji, focused && tabStyles.emojiFocused]}>{emoji}</Text>
    <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{label}</Text>
  </View>
);

const tabStyles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  emoji: {
    fontSize: 22,
    opacity: 0.5,
  },
  emojiFocused: {
    opacity: 1,
  },
  label: {
    fontSize: FONTS.size.xs,
    marginTop: 2,
    color: COLORS.TAB_INACTIVE,
    fontWeight: FONTS.weight.medium,
  },
  labelFocused: {
    color: COLORS.TAB_ACTIVE,
    fontWeight: FONTS.weight.semibold,
  },
});

// Bottom tab navigator (main app)
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.WHITE,
        borderTopWidth: 1,
        borderTopColor: COLORS.BORDER,
        height: 72,
        paddingBottom: 10,
        paddingTop: 4,
      },
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="🏠" focused={focused} label="Inicio" />
        ),
      }}
    />
    <Tab.Screen
      name="Historial"
      component={HistoryScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="💬" focused={focused} label="Historial" />
        ),
      }}
    />
    <Tab.Screen
      name="Ajustes"
      component={SettingsScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="⚙️" focused={focused} label="Ajustes" />
        ),
      }}
    />
  </Tab.Navigator>
);

// Loading screen shown while context hydrates from AsyncStorage
const LoadingScreen = () => (
  <View style={loadingStyles.container}>
    <Text style={loadingStyles.logo}>🐾</Text>
    <Text style={loadingStyles.appName}>PetVoice AI</Text>
    <ActivityIndicator
      color={COLORS.PRIMARY}
      size="large"
      style={{ marginTop: 24 }}
    />
  </View>
);

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 56,
    marginBottom: 8,
  },
  appName: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.PRIMARY,
    letterSpacing: -0.5,
  },
});

// Root navigator
const AppNavigator = () => {
  const { pet, isLoading } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.BG },
          presentation: 'card',
        }}
      >
        {isLoading ? (
          // Splash / loading state
          <Stack.Screen
            name="Loading"
            component={LoadingScreen}
            options={{ animationEnabled: false }}
          />
        ) : !pet ? (
          // Onboarding — pet not configured yet
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ animationEnabled: true, gestureEnabled: false }}
          />
        ) : (
          // Main app
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{
                presentation: 'modal',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
