import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false, 
        tabBarStyle: { 
          backgroundColor: '#F9F9F9', 
          borderTopColor: '#EFEFEF',
          // Reduced height: 50-55 is standard for a slim look
          height: Platform.OS === 'ios' ? 75 : 55, 
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          elevation: 0, // Removes shadow on Android for a flatter look
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarActiveTintColor: '#1A1A1A', 
        tabBarInactiveTintColor: '#BBB',
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 10,
          marginTop: 0, // Keeps label close to icon
        },
        tabBarIconStyle: {
          marginBottom: -2, // Pulls the icon slightly lower
        }
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products/index"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="auction/index"
        options={{
          title: 'Auctions',
          tabBarIcon: ({ color }) => <Ionicons name="hammer-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="checkout/index"
        options={{
          title: 'Checkout',
          tabBarIcon: ({ color }) => <Ionicons name="cart-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}