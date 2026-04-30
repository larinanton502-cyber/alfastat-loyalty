import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { storage } from '../storage/storage';
import { colors } from '../constants/colors';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import SubscriptionDetailsScreen from '../screens/SubscriptionDetailsScreen';
import ForumScreen from '../screens/ForumScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SupportChatScreen from '../screens/SupportChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ label, focused }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.iconText, focused && styles.iconTextFocused]}>
      {label}
    </Text>
  </View>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.textOnPrimary,
      headerTitleStyle: { fontWeight: '700' },
      tabBarStyle: {
        backgroundColor: colors.background,
        borderTopColor: colors.border,
        height: 64,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'Главная',
        tabBarLabel: 'Главная',
        tabBarIcon: ({ focused }) => <TabIcon label="◆" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Subscriptions"
      component={SubscriptionsScreen}
      options={{
        title: 'Тарифы',
        tabBarLabel: 'Тарифы',
        tabBarIcon: ({ focused }) => <TabIcon label="★" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Forum"
      component={ForumScreen}
      options={{
        title: 'Сообщество',
        tabBarLabel: 'Сообщество',
        tabBarIcon: ({ focused }) => <TabIcon label="✎" focused={focused} />,
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="History"
      component={HistoryScreen}
      options={{
        title: 'История',
        tabBarLabel: 'История',
        tabBarIcon: ({ focused }) => <TabIcon label="≡" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Профиль',
        tabBarLabel: 'Профиль',
        tabBarIcon: ({ focused }) => <TabIcon label="●" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [onboardingSeen, setOnboardingSeen] = useState(null);

  useEffect(() => {
    (async () => {
      const seen = await storage.getOnboardingSeen();
      setOnboardingSeen(seen);
    })();
  }, []);

  if (loading || onboardingSeen === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textOnPrimary,
        }}
      >
        {!user ? (
          !onboardingSeen ? (
            <>
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Splash"
                component={SplashScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
              />
            </>
          )
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SubscriptionDetails"
              component={SubscriptionDetailsScreen}
              options={{ title: 'Тариф' }}
            />
            <Stack.Screen
              name="SupportChat"
              component={SupportChatScreen}
              options={{ title: 'Чат с поддержкой' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    color: colors.textMuted,
  },
  iconTextFocused: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default AppNavigator;
