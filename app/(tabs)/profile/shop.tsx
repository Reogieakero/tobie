import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useLoading } from '@/hooks/useLoading';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  AppStateStatus,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApplyState } from './components/ApplyState';
import { PendingState } from './components/PendingState';
import { MyShop } from './shop/my-shop';

type AppStatus = 'none' | 'pending' | 'approved' | 'loading';

export default function ShopScreen() {
  const [status, setStatus] = useState<AppStatus>('loading');
  const [shopData, setShopData] = useState<any>(null);
  const [isPressed, setIsPressed] = useState(false);
  const holdAnim = useRef(new Animated.Value(0)).current;
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { isLoading, startLoading, stopLoading } = useLoading(true);

  const fetchApplication = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setStatus('none'); stopLoading(); return; }

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
    stopLoading();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchApplication();
    }, [fetchApplication])
  );

  useEffect(() => {
    async function setupRealtime() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel(`shop_screen:${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'shop_applications', filter: `user_id=eq.${user.id}` },
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

    const appStateSub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') fetchApplication();
    });

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      appStateSub.remove();
    };
  }, [fetchApplication]);

  const handleExit = () => router.replace('/(tabs)/profile');

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(holdAnim, { toValue: 1, duration: 2500, useNativeDriver: false }).start(({ finished }) => {
      if (finished) {
        holdAnim.setValue(0);
        setIsPressed(false);
        router.push('/profile/shop/apply');
      }
    });
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(holdAnim, { toValue: 0, useNativeDriver: false }).start();
  };

  const fillHeight = holdAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const renderContent = () => {
    if (isLoading) return <LoadingOverlay />;
    if (status === 'pending') return <PendingState shopData={shopData} />;
    if (status === 'approved') return <MyShop shopData={shopData} />;
    return (
      <ApplyState 
        isPressed={isPressed} 
        handlePressIn={handlePressIn} 
        handlePressOut={handlePressOut} 
        fillHeight={fillHeight} 
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={handleExit}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {status === 'approved' ? 'SHOP DASHBOARD' : 'MY SHOP'}
        </Text>

        <View style={styles.navActions}>
          {status === 'approved' ? (
            <TouchableOpacity style={styles.navBtn}>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 32 }} />
          )}
        </View>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 16,
    color: '#111',
  },
  navActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  navBtn: { padding: 4 },
});