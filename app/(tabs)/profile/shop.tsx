import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    AppState,
    AppStateStatus,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AppStatus = 'none' | 'pending' | 'approved' | 'loading';

export default function ShopScreen() {
  const [status, setStatus] = useState<AppStatus>('loading');
  const [shopData, setShopData] = useState<any>(null);
  const [isPressed, setIsPressed] = useState(false);
  const holdAnim = useRef(new Animated.Value(0)).current;
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Core fetch ────────────────────────────────────────────
  // Extracted so it can be called from useFocusEffect, AppState, and realtime.
  const fetchApplication = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setStatus('none'); return; }

    const { data } = await supabase
      .from('shop_applications')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setStatus(data.status as AppStatus);
      setShopData(data);
    } else {
      setStatus('none');
    }
  }, []);

  // ── Re-fetch every time this screen gains focus ───────────
  // This is the KEY fix: when the user comes back from the apply screen,
  // this fires immediately and shows the pending state — no logout needed.
  useFocusEffect(
    useCallback(() => {
      fetchApplication();
    }, [fetchApplication])
  );

  // ── Real-time subscription + AppState fallback ────────────
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function setupRealtime() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`shop_screen:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'shop_applications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const row = payload.new as any;
            if (row?.status) {
              setStatus(row.status as AppStatus);
              setShopData(row);
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    }

    setupRealtime();

    // AppState fallback: re-fetch when app is foregrounded
    // (catches approval if realtime is not enabled on the table)
    const appStateSub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') fetchApplication();
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      appStateSub.remove();
    };
  }, [fetchApplication]);

  const handleExit = () => router.replace('/(tabs)/profile');

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(holdAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onHoldComplete();
    });
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(holdAnim, { toValue: 0, useNativeDriver: false }).start();
  };

  const onHoldComplete = () => {
    holdAnim.setValue(0);
    setIsPressed(false);
    router.push('/profile/shop/apply');
  };

  const fillHeight = holdAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // ── LOADING ──────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleExit}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MY SHOP</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerFill}>
          <ActivityIndicator color="#111" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // ── PENDING ──────────────────────────────────────────────
  if (status === 'pending') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleExit}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MY SHOP</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.pendingIconCircle}>
            <Ionicons name="time-outline" size={40} color="#888" />
          </View>
          <Text style={styles.title}>Application Sent</Text>
          <Text style={styles.description}>
            Your shop application is currently under review. We'll notify you once our team has verified your details.
          </Text>

          <View style={styles.pendingBadge}>
            <View style={styles.pendingDot} />
            <Text style={styles.pendingText}>WAITING FOR APPROVAL</Text>
          </View>

          {shopData && (
            <View style={styles.detailCard}>
              <DetailRow icon="storefront-outline" label="Shop Name" value={shopData.shop_name} />
              <DetailRow icon="pricetag-outline"   label="Category"  value={shopData.category} />
              <DetailRow icon="location-outline"   label="City"      value={shopData.city} />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ── APPROVED ─────────────────────────────────────────────
  if (status === 'approved') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleExit}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SHOP DASHBOARD</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={22} color="#111" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.dashboardContent}>
          <View style={styles.shopHeader}>
            <View style={styles.shopIcon}>
              <Ionicons name="storefront" size={30} color="#fff" />
            </View>
            <Text style={styles.shopName}>{shopData?.shop_name}</Text>
            <Text style={styles.shopCategory}>{shopData?.category}</Text>
            <View style={styles.approvedBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#22C55E" />
              <Text style={styles.approvedText}>Verified Seller</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>Sold</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>₱0</Text>
              <Text style={styles.statLabel}>Earned</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.mainActionBtn} activeOpacity={0.85}>
            <Ionicons name="add-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.mainActionText}>LIST NEW ITEM</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── NONE (apply) ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleExit}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY SHOP</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="briefcase-outline" size={40} color="#111" />
        </View>
        <Text style={styles.title}>Start Selling Today</Text>
        <Text style={styles.description}>
          Join our community of elite sellers. Opening a shop allows you to list items and manage auctions.
        </Text>

        <View style={styles.actionContainer}>
          <Text style={styles.holdHint}>Hold to start application</Text>
          <View style={styles.holdContainer}>
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={({ pressed }) => [
                styles.circleButton,
                pressed && styles.circleButtonPressed,
              ]}
            >
              <Animated.View style={[styles.fill, { height: fillHeight }]} />
              <View style={styles.buttonContent}>
                <Ionicons
                  name={isPressed ? 'timer-outline' : 'finger-print'}
                  size={32}
                  color={isPressed ? '#fff' : '#111'}
                />
                <Text style={[styles.holdText, isPressed && { color: '#fff' }]}>
                  {isPressed ? 'HOLDING' : 'START'}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color="#888" />
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  centerFill: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 14, color: '#111' },
  backBtn: { padding: 4 },
  placeholder: { width: 32 },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 20,
    color: '#111',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },

  pendingIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    marginBottom: 24,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  pendingText: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 11,
    color: '#888',
    letterSpacing: 0.8,
  },
  detailCard: {
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
    gap: 14,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailText: { flex: 1 },
  detailLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#AAA' },
  detailValue: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#111', marginTop: 1 },

  actionContainer: { alignItems: 'center', width: '100%' },
  holdHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#AAA',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 28,
  },
  holdContainer: { alignItems: 'center' },
  circleButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#111',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleButtonPressed: { transform: [{ scale: 0.96 }] },
  buttonContent: { alignItems: 'center', zIndex: 2 },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    zIndex: 1,
  },
  holdText: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 10,
    marginTop: 6,
    color: '#111',
  },

  dashboardContent: { padding: 20, alignItems: 'center' },
  shopHeader: { alignItems: 'center', marginVertical: 28 },
  shopIcon: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  shopName: { fontFamily: 'Unbounded_700Bold', fontSize: 18, color: '#111', marginBottom: 4 },
  shopCategory: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#888', marginBottom: 10 },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  approvedText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#22C55E' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 28,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  statNum: { fontFamily: 'Unbounded_700Bold', fontSize: 16, color: '#111' },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  mainActionBtn: {
    backgroundColor: '#111',
    width: '100%',
    padding: 18,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainActionText: {
    color: '#fff',
    fontFamily: 'Unbounded_700Bold',
    fontSize: 12,
    letterSpacing: 1,
  },
});