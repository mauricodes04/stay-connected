import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import ContactsScreen from '../screens/ContactsScreen';
import PlanScreen from '../screens/PlanScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GooberDetailScreen from '../screens/GooberDetailScreen';
import { usePeople } from '@/hooks/usePeople';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  const { people } = usePeople();
  const count = people.length;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Contacts') icon = 'people';
          else if (route.name === 'Plan') icon = 'calendar';
          else if (route.name === 'History') icon = 'time';
          else if (route.name === 'Settings') icon = 'settings';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{ title: `Contacts (${count})` }}
      />
      <Tab.Screen name="Plan" component={PlanScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        headerShadowVisible: false,
        gestureEnabled: true,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="Root" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="GooberDetail" component={GooberDetailScreen} options={{ title: 'Goober' }} />
    </Stack.Navigator>
  );
}
