import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShopProductsScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    fetchShopContent();

    const channel = supabase
      .channel(`shop_products_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchShopContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchShopContent = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: products } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setShopData(profile);
      setItems(products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/products/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.productPrice}>₱{item.price.toLocaleString()}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.selling_type === 'posted' ? 'FIXED' : item.selling_type.toUpperCase()}</Text>
          </View>
          {item.selling_type === 'auction' && (
            <Ionicons name="hammer-outline" size={12} color="#999" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{shopData?.full_name?.toUpperCase() || 'SHOP PRODUCTS'}</Text>
        <TouchableOpacity style={styles.navBtn}>
          <Ionicons name="share-outline" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerSpacing}>
            <Text style={styles.sectionTitle}>ALL PRODUCTS ({items.length})</Text>
          </View>
        }
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#E2E2E2" />
            <Text style={styles.emptyText}>This shop has no active listings.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: { padding: 4 },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111' },
  listContent: { paddingBottom: 40 },
  row: { justifyContent: 'space-between', paddingHorizontal: 16 },
  headerSpacing: { marginTop: 10 },
  sectionTitle: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 10,
    color: '#999',
    marginHorizontal: 16,
    marginBottom: 16,
    letterSpacing: 1.2,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  productImage: { width: '100%', height: 180, resizeMode: 'cover' },
  productInfo: { padding: 12, gap: 4 },
  productTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#111' },
  productPrice: { fontFamily: 'Unbounded_700Bold', fontSize: 14, color: '#111' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  typeBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontFamily: 'Inter_700Bold', fontSize: 8, color: '#666' },
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { textAlign: 'center', color: '#999', fontFamily: 'Inter_400Regular', fontSize: 14 },
});