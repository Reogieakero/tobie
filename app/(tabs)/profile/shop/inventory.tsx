import QuantityProductModal from '@/app/(tabs)/profile/shop/components/QuantityProductModal';
import { useInventory } from '@/hooks/useInventory';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2;

export default function InventoryScreen() {
  const router = useRouter();
  const { items, loading, refresh } = useInventory();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isGridView, setIsGridView] = useState(true);

  const renderItem = ({ item }: { item: any }) => {
    const isEnded = item.displayStatus === 'ended';

    if (isGridView) {
      return (
        <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedItem(item)}>
          <View style={styles.gridImageContainer}>
            <Image source={{ uri: item.image_url }} style={styles.gridImage} />
            {isEnded && (
              <View style={styles.gridOverlay}>
                <Text style={styles.overlayText}>ENDED</Text>
              </View>
            )}
          </View>
          <Text style={styles.gridPrice}>₱{Number(item.price).toLocaleString()}</Text>
          <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.listItem} onPress={() => setSelectedItem(item)}>
        <Image source={{ uri: item.image_url }} style={styles.listImage} />
        <View style={styles.listInfo}>
          <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.listPrice}>₱{Number(item.price).toLocaleString()}</Text>
          <View style={styles.listMeta}>
            <Text style={[styles.statusTag, { color: isEnded ? '#EF4444' : '#10B981' }]}>
              {item.displayStatus}
            </Text>
            <Text style={styles.listQty}>STOCK: {item.quantity || 1}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFF' },
          headerTitleAlign: 'center',
          headerTitle: () => <Text style={styles.headerTitle}>INVENTORY</Text>,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color="#111" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => setIsGridView(!isGridView)} style={styles.headerBtn}>
              <Ionicons name={isGridView ? "reorder-three" : "grid-outline"} size={24} color="#111" />
            </TouchableOpacity>
          ),
        }} 
      />

      <FlatList
        key={isGridView ? 'GRID' : 'LIST'}
        data={items}
        numColumns={isGridView ? 2 : 1}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={refresh}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={isGridView ? { gap: 8 } : null}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      <QuantityProductModal 
        visible={!!selectedItem} 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 12, letterSpacing: 1.5 },
  headerBtn: { marginRight: 16 },
  listContent: { paddingHorizontal: 16, paddingTop: 16 },
  gridItem: { width: COLUMN_WIDTH, marginBottom: 24 },
  gridImageContainer: { 
    width: '100%', 
    aspectRatio: 1, 
    borderRadius: 4, 
    backgroundColor: '#F8FAFC', 
    overflow: 'hidden',
    marginBottom: 10 
  },
  gridImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  gridOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
  overlayText: { fontFamily: 'Unbounded_700Bold', fontSize: 10, color: '#111' },
  gridPrice: { fontFamily: 'Unbounded_700Bold', fontSize: 15, color: '#111' },
  gridTitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 },
  listItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  listImage: { width: 64, height: 64, borderRadius: 4, backgroundColor: '#F8FAFC' },
  listInfo: { flex: 1, marginLeft: 16 },
  listTitle: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#111' },
  listPrice: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111', marginTop: 4 },
  listMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  statusTag: { fontFamily: 'Inter_700Bold', fontSize: 9, textTransform: 'uppercase' },
  listQty: { fontFamily: 'Unbounded_700Bold', fontSize: 9, color: '#94A3B8' }
});0