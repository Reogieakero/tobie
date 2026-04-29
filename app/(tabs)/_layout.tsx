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
          height: Platform.OS === 'ios' ? 75 : 55,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 2,
          elevation: 0,
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
          marginTop: 0,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
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

      {/* Hide profile sub-components from the tab bar */}
      <Tabs.Screen name="profile/components/ProfileHeader"   options={{ href: null }} />
      <Tabs.Screen name="profile/components/ProfileTabs"     options={{ href: null }} />
      <Tabs.Screen name="profile/components/ProfileGrid"     options={{ href: null }} />
      <Tabs.Screen name="profile/components/ProfileBio" options={{ href: null }} />
      <Tabs.Screen name="profile/components/ProfileListings" options={{ href: null }} />
      <Tabs.Screen name="profile/shop" options={{ href: null }} />
      <Tabs.Screen name="profile/shop/apply" options={{ href: null }} />

    </Tabs>
  );
}