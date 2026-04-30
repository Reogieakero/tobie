import { useLiveAuctions } from '@/hooks/useLiveAuctions';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { LogBox, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

    const { error } = await supabase.rpc('update_items_order', { 
      payload: payload 
    });

    if (error) {
      console.error('Error saving order via RPC:', error.message);
    }
  };

  const handleDragEnd = ({ data: newData }: { data: any[] }) => {
    setData(newData);
    if (global.requestIdleCallback) {
      global.requestIdleCallback(() => saveNewOrder(newData));
    } else {
      saveNewOrder(newData);
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<any>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.rowItem,
            { backgroundColor: isActive ? 'transparent' : '#FFF' }
          ]}
        >
          <AuctionCard item={item} isDragging={isActive} />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>LIVE BIDDING</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <DraggableFlatList
          data={data}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={refresh}
          refreshing={loading}
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
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
  },
  headerTitle: { 
    fontFamily: 'Unbounded_700Bold', 
    fontSize: 13, 
    color: '#111' 
  },
  listContent: { 
    paddingHorizontal: 16, 
    paddingBottom: 32 
  },
  rowItem: {
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyText: { 
    textAlign: 'center', 
    fontFamily: 'Inter_400Regular', 
    color: '#888', 
    marginTop: 40 
  },
  navBtn: { width: 40 }
});