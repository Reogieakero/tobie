import { useLiveAuctions } from '@/hooks/useLiveAuctions';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { LogBox, SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuctionCard from './components/AuctionCard';

LogBox.ignoreLogs(['InteractionManager has been deprecated']);

export default function LiveAuctionsScreen() {
  const router = useRouter();
  const { auctions, loading, refresh } = useLiveAuctions();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (auctions) {
      const liveOnly = auctions.filter(item => Date.parse(item.end_time) > Date.now());
      setData(liveOnly);
    }
  }, [auctions]);

  const saveNewOrder = async (newData: any[]) => {
    const payload = newData.map((item, index) => ({
      id: item.id,
      display_order: index,
    }));
    await supabase.rpc('update_items_order', { payload });
  };

  const handleDragEnd = ({ data: newData }: { data: any[] }) => {
    setData(newData);
    if (global.requestIdleCallback) {
      global.requestIdleCallback(() => saveNewOrder(newData));
    } else {
      saveNewOrder(newData);
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<any>) => (
    <ScaleDecorator>
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={drag}
        onPress={() => {
          router.push({
            pathname: "/(tabs)/profile/shop/auction-logs",
            params: { id: item.id, title: item.title }
          });
        }}
        disabled={isActive}
        style={[styles.rowItem, { backgroundColor: isActive ? 'transparent' : '#FFF' }]}
      >
        <AuctionCard item={item} isDragging={isActive} />
      </TouchableOpacity>
    </ScaleDecorator>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#FFF' }}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFF' },
          headerTitle: () => (
            <Text style={styles.headerTitle}>LIVE BIDDING</Text>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace('/(tabs)/profile/shop/my-shop')} style={styles.navBtn}>
              <Ionicons name="arrow-back" size={24} color="#111" />
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
          headerLeftContainerStyle: { paddingLeft: 16 }
        }} 
      />

      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <DraggableFlatList
          data={data}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => `auction-${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={refresh}
          refreshing={loading}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading && <Text style={styles.emptyText}>No active auctions found.</Text>
          }
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111', letterSpacing: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 32 },
  rowItem: {
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyText: { textAlign: 'center', fontFamily: 'Inter_400Regular', color: '#888', marginTop: 40 },
  navBtn: { justifyContent: 'center', alignItems: 'center' }
});