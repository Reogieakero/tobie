import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';


function useGlobalShopApprovalListener() {
  // Track the last known status so we only toast on the transition TO approved,
  // not on every re-render or initial load when already approved.
  const lastKnownStatus = useRef<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function setup() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      // Seed the last known status so we don't toast if they were already approved
      const { data } = await supabase
        .from('shop_applications')
        .select('status')
        .eq('user_id', user.id)
        .single();

      if (data) lastKnownStatus.current = data.status;

      const channel = supabase
        .channel(`global_shop_approval:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',         // Only care about updates (admin approves = UPDATE)
            schema: 'public',
            table: 'shop_applications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newStatus = (payload.new as any)?.status;
            const shopName  = (payload.new as any)?.shop_name;

            // Only fire when transitioning INTO 'approved'
            if (newStatus === 'approved' && lastKnownStatus.current !== 'approved') {
              showToast(
                '🎉 Shop Approved!',
                `${shopName ?? 'Your shop'} is now live. Start listing items!`,
                'success'
              );
            }

            lastKnownStatus.current = newStatus;
          }
        )
        .subscribe();

      channelRef.current = channel;
    }

    setup();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);
}

export default function TabsLayout() {
  // 👇 Activates the global listener for the entire tab session
  useGlobalShopApprovalListener();

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
      <Tabs.Screen name="profile/components/ProfileBio"      options={{ href: null }} />
      <Tabs.Screen name="profile/components/ProfileListings" options={{ href: null }} />
      <Tabs.Screen name="profile/shop"                       options={{ href: null }} />
      <Tabs.Screen name="profile/shop/apply"                 options={{ href: null }} />
    </Tabs>
  );
}