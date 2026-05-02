import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Unbounded_700Bold, Unbounded_800ExtraBold, useFonts } from '@expo-google-fonts/unbounded';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useHomeFeed } from '@/hooks/useHomeFeed';
import { useUserSession } from '@/hooks/useUserSession';
import { supabase } from '@/lib/supabase';
import PostCard from './components/PostCard';

export default function HomeScreen() {
  const { items, setItems, loading, refreshing, refresh, loadMore } = useHomeFeed();
  const { userName } = useUserSession();
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  let [fontsLoaded] = useFonts({
    Unbounded_800ExtraBold, Unbounded_700Bold,
    Inter_400Regular, Inter_600SemiBold, Inter_700Bold,
  });

  const handleLike = useCallback(async (itemId: string) => {
    const isCurrentlyLiked = likedItems[itemId];
    setLikedItems(prev => ({ ...prev, [itemId]: !isCurrentlyLiked }));
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, likes_count: (Number(item.likes_count) || 0) + (isCurrentlyLiked ? -1 : 1) }
        : item
    ));

    try {
      const { error } = await supabase.rpc('increment_likes', { item_id: itemId });
      if (error) throw error;
    } catch (e) {
      setLikedItems(prev => ({ ...prev, [itemId]: isCurrentlyLiked }));
    }
  }, [likedItems, setItems]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <PostCard 
      item={item} 
      isLiked={!!likedItems[item.id]} 
      onLike={handleLike} 
    />
  ), [likedItems, handleLike]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      {loading && items.length === 0 && <LoadingOverlay message="FETCHING FEED" />}
      
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={() => loadMore()}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="transparent" />}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <View>
              <Text style={styles.brandName}>TOBIE</Text>
              <Text style={styles.welcomeText}>Hi, {userName} 👋</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity><Ionicons name="add-circle-outline" size={26} color="#1A1A1A" /></TouchableOpacity>
              <TouchableOpacity><Ionicons name="notifications-outline" size={26} color="#1A1A1A" /></TouchableOpacity>
            </View>
          </View>
        )}
      />
      {refreshing && <LoadingOverlay message="REFRESHING" />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#FFF' },
  brandName: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 22, color: '#1A1A1A', letterSpacing: -1 },
  welcomeText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#999', marginTop: -2 },
  headerActions: { flexDirection: 'row', gap: 15 },
});