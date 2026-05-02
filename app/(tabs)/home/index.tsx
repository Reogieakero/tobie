import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useHomeFeed } from '@/hooks/useHomeFeed';
import { useUserSession } from '@/hooks/useUserSession';
import { supabase } from '@/lib/supabase';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Unbounded_700Bold, Unbounded_800ExtraBold, useFonts } from '@expo-google-fonts/unbounded';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, RefreshControl, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from './components/PostCard';

type SearchCategory = 'item' | 'shop' | 'name';

export default function HomeScreen() {
  const [showOwnProducts, setShowOwnProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<SearchCategory>('item');
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(-180)).current;
  const searchInputRef = useRef<TextInput>(null);

  const { items, setItems, loading, refreshing, refresh, loadMore } = useHomeFeed(showOwnProducts);
  const { userName } = useUserSession();
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const flatListRef = useRef<FlatList>(null);

  let [fontsLoaded] = useFonts({
    Unbounded_800ExtraBold, Unbounded_700Bold,
    Inter_400Regular, Inter_600SemiBold, Inter_700Bold,
  });

  const toggleSearch = () => {
    if (isSearchActive) {
      Animated.timing(slideAnim, {
        toValue: -180,
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        setIsSearchActive(false);
        setSearchQuery('');
      });
    } else {
      setIsSearchActive(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => searchInputRef.current?.focus());
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => {
      switch (searchCategory) {
        case 'shop':
          return item.profiles?.shop_applications?.[0]?.shop_name?.toLowerCase().includes(query);
        case 'name':
          const fullName = `${item.profiles?.first_name} ${item.profiles?.last_name}`.toLowerCase();
          return fullName.includes(query);
        case 'item':
        default:
          return item.title?.toLowerCase().includes(query);
      }
    });
  }, [items, searchQuery, searchCategory]);

  const handleLike = useCallback(async (itemId: string) => {
    const isCurrentlyLiked = likedItems[itemId];
    setLikedItems(prev => ({ ...prev, [itemId]: !isCurrentlyLiked }));
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, likes_count: (Number(item.likes_count) || 0) + (isCurrentlyLiked ? -1 : 1) } : item
    ));
    try { await supabase.rpc('increment_likes', { item_id: itemId }); } catch (e) {
      setLikedItems(prev => ({ ...prev, [itemId]: isCurrentlyLiked }));
    }
  }, [likedItems, setItems]);

  const handleRefreshPress = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    refresh();
  };

  const renderItem = useCallback(({ item }: any) => (
    <PostCard item={item} isLiked={!!likedItems[item.id]} onLike={handleLike} />
  ), [likedItems, handleLike]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {loading && items.length === 0 && <LoadingOverlay message="FETCHING FEED" />}
      {refreshing && <LoadingOverlay message="REFRESHING" />}

      <Animated.View style={[styles.searchDrawer, { top: slideAnim }]}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder={`Search by ${searchCategory}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity onPress={toggleSearch} style={styles.closeBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryRow}>
          {(['item', 'shop', 'name'] as SearchCategory[]).map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSearchCategory(cat)}
              style={[styles.categoryBtn, searchCategory === cat && styles.categoryBtnActive]}
            >
              <Text style={[styles.categoryText, searchCategory === cat && styles.categoryTextActive]}>
                {cat.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

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
          <TouchableOpacity onPress={toggleSearch} style={styles.iconBtn}>
            <Ionicons name="search" size={26} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={7}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#1A1A1A" />}
      />

      <TouchableOpacity style={styles.refreshFab} onPress={handleRefreshPress}>
        <Ionicons name="refresh" size={24} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FFF', zIndex: 1 
  },
  brandName: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 22, color: '#1A1A1A', letterSpacing: -1 },
  welcomeText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#999', marginTop: -2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#64748B' },
  iconBtn: { padding: 4 },
  
  searchDrawer: {
    position: 'absolute', left: 0, right: 0, backgroundColor: '#FFF',
    paddingHorizontal: 20, paddingTop: 15, paddingBottom: 20, zIndex: 10,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9', elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9',
    borderRadius: 12, paddingHorizontal: 12, height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#1A1A1A', height: '100%' },
  closeBtn: { marginLeft: 10 },
  cancelText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A1A1A' },
  categoryRow: { flexDirection: 'row', marginTop: 15, gap: 8 },
  categoryBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F8FAFC',
    alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0',
  },
  categoryBtnActive: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
  categoryText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#64748B' },
  categoryTextActive: { color: '#FFF' },

  refreshFab: {
    position: 'absolute', bottom: 20, right: 20, backgroundColor: '#1A1A1A',
    width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
  }
});