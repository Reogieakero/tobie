import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';


function useGlobalShopApprovalListener() {
  const lastKnownStatus = useRef<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function setup() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

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
            event: 'UPDATE',
            schema: 'public',
            table: 'shop_applications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newStatus = (payload.new as any)?.status;
            const shopName  = (payload.new as any)?.shop_name;

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

      {/* Hide profile sub-screens from tab bar */}
      <Tabs.Screen name="profile/components/ProfileHeader"   options={{ href: null }} />
      <Tabs.Screen name="profile/components/ProfileTabs"     options={{ href: null }} />
      <Tabs.Screen name="profile/components/ProfileGrid"     options={{ href: null }} />
      <Tabs.Screen name="profile/components/ProfileBio"      options={{ href: null }} />
      <Tabs.Screen name="profile/components/ProfileListings" options={{ href: null }} />
      <Tabs.Screen name="profile/shop"                       options={{ href: null }} />
      <Tabs.Screen name="profile/shop/apply"                 options={{ href: null }} />
      <Tabs.Screen name="profile/components/ApplyState"      options={{ href: null }} />
      <Tabs.Screen name="profile/shop/my-shop"               options={{ href: null }} />
      <Tabs.Screen name="profile/components/PendingState"    options={{ href: null }} />
      <Tabs.Screen name="profile/settings/index"             options={{ href: null }} />
      <Tabs.Screen name="profile/settings/account/index"     options={{ href: null }} />
      <Tabs.Screen name="profile/settings/my-shop/index"     options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/ShopHeader"    options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/StatsGrid"     options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/RevenueCard"   options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/LiveBidding"   options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/ManagementGrid" options={{ href: null }} />
      <Tabs.Screen name="profile/shop/addItem/index"         options={{ href: null }} />
      <Tabs.Screen name="profile/shop/shop-products"         options={{ href: null }} />
      <Tabs.Screen name="profile/shop/addItem/components/ImageUpload"        options={{ href: null }} />
      <Tabs.Screen name="profile/shop/addItem/components/SellingTypeSelector" options={{ href: null }} />
      <Tabs.Screen name="profile/shop/addItem/components/AuctionScheduler"   options={{ href: null }} />
      <Tabs.Screen name="profile/shop/addItem/components/PricingFields"      options={{ href: null }} />
      <Tabs.Screen name="profile/shop/addItem/components/IssuesSection"      options={{ href: null }} />
      <Tabs.Screen name="profile/shop/addItem/components/ValidatedField"     options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/FilterTabs"                 options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/ModalScheduledRow"           options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/AuctionTimer"                 options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/ModalCountdown"                options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/DeleteConfirmOverlay"           options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/ProductModal"                    options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/ProductsNavBar"                 options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/GridItem"                    options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/ScheduledBar"                    options={{ href: null }} />
      <Tabs.Screen name="profile/shop/components/ListItem"                    options={{ href: null }} />
    </Tabs>
  );
}