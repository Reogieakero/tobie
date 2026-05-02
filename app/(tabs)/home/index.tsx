import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useHomeFeed } from '@/hooks/useHomeFeed';
import { useUserSession } from '@/hooks/useUserSession';
import { supabase } from '@/lib/supabase';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Unbounded_700Bold, Unbounded_800ExtraBold, useFonts } from '@expo-google-fonts/unbounded';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, RefreshControl, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from './components/PostCard';

export default function HomeScreen() {
  const [showOwnProducts, setShowOwnProducts] = useState(true);
  const { items, setItems, loading, refreshing, refresh, loadMore } = useHomeFeed(showOwnProducts);
  const { userName } = useUserSession();
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const flatListRef = useRef<FlatList>(null);

  let [fontsLoaded] = useFonts({
    Unbounded_800ExtraBold, Unbounded_700Bold,
    Inter_400Regular, Inter_600SemiBold, Inter_700Bold,
  });

  const handleRefreshPress = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    refresh();
  };

  const handleLike = useCallback(async (itemId: string) => {
    const isCurrentlyLiked = likedItems[itemId];
    setLikedItems(prev => ({ ...prev, [itemId]: !isCurrentlyLiked }));
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, likes_count: (Number(item.likes_count) || 0) + (isCurrentlyLiked ? -1 : 1) } : item
    ));
    try {
      await supabase.rpc('increment_likes', { item_id: itemId });
    } catch (e) {
      setLikedItems(prev => ({ ...prev, [itemId]: isCurrentlyLiked }));
    }
  }, [likedItems, setItems]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      {loading && items.length === 0 && <LoadingOverlay message="FETCHING FEED" />}
      
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={({ item }) => <PostCard item={item} isLiked={!!likedItems[item.id]} onLike={handleLike} />}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={1.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="transparent" />}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <View>
              <Text style={styles.brandName}>TOBIE</Text>
              <Text style={styles.welcomeText}>Hi, {userName} 👋</Text>
            </View>
            <View style={styles.headerActions}>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>SHOW MINE</Text>
                <Switch 
                  value={showOwnProducts} 
                  onValueChange={setShowOwnProducts}
                  trackColor={{ false: "#E2E8F0", true: "#1A1A1A" }}
                  thumbColor="#FFF"
                />
              </View>
              <TouchableOpacity><Ionicons name="notifications-outline" size={24} color="#1A1A1A" /></TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.refreshFab} onPress={handleRefreshPress}>
        <Ionicons name="refresh" size={24} color="#FFF" />
      </TouchableOpacity>

      {refreshing && <LoadingOverlay message="REFRESHING" />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8 },
  brandName: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 22, color: '#1A1A1A', letterSpacing: -1 },
  welcomeText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#999', marginTop: -2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toggleLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#64748B' },
  refreshFab: {
    position: 'absolute', bottom: 20, right: 20, backgroundColor: '#1A1A1A',
    width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
  }
});