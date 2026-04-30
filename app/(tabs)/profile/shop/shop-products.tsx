import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterType, useShopProducts } from '@/hooks/useShopProducts';

import DeleteConfirmOverlay from './components/DeleteConfirmOverlay';
import FilterTabs, { FILTERS } from './components/FilterTabs';
import GridItem from './components/GridItem';
import ListItem from './components/ListItem';
import ProductModal from './components/ProductModal';
import ShopHeader from './components/ProductsNavBar';

const GUTTER = 16;

type ViewLayout = 'grid' | 'list';

export default function ShopProductsScreen() {
  const router = useRouter();
  const { items, shopData, loading, tick, counts, getFilteredItems } = useShopProducts();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selected, setSelected] = useState<any | null>(null);
  const [layout, setLayout] = useState<ViewLayout>('grid');

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredItems = useMemo(
    () => getFilteredItems(activeFilter),
    [items, activeFilter, tick]
  );

  const toggleSelection = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const enterSelectionMode = (id: string) => {
    setSelectionMode(true);
    setSelectedIds([id]);
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const { error } = await supabase.from('items').delete().in('id', selectedIds);
    if (error) Alert.alert('Error', error.message);
    setShowDeleteConfirm(false);
    exitSelectionMode();
  };

  if (loading) return <LoadingOverlay />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ShopHeader
        shopName={shopData?.full_name}
        selectionMode={selectionMode}
        selectedCount={selectedIds.length}
        layout={layout}
        onBack={() => router.replace('/(tabs)/profile/shop')}
        onExitSelection={exitSelectionMode}
        onToggleLayout={() => setLayout((l) => l === 'grid' ? 'list' : 'grid')}
        onDeletePress={() => setShowDeleteConfirm(true)}
      />

      {!selectionMode && (
        <FilterTabs
          activeFilter={activeFilter}
          counts={counts}
          onSelect={setActiveFilter}
        />
      )}

      <FlatList
        key={layout}
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={layout === 'grid' ? 3 : 1}
        columnWrapperStyle={layout === 'grid' ? { gap: GUTTER } : undefined}
        showsVerticalScrollIndicator={false}
        extraData={[tick, layout, selectionMode, selectedIds]}
        contentContainerStyle={[
          filteredItems.length === 0 ? styles.emptyFlex : (layout === 'list' ? { paddingHorizontal: 16 } : undefined),
          layout === 'grid' && { gap: GUTTER },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={activeFilter === 'scheduled' ? 'calendar-outline' : 'cube-outline'}
              size={48}
              color="#E2E2E2"
            />
            <Text style={styles.emptyText}>
              {activeFilter === 'scheduled'
                ? 'No scheduled listings.'
                : activeFilter === 'all'
                ? 'No active listings yet.'
                : `No ${FILTERS.find((f) => f.id === activeFilter)?.label} listings.`}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);
          const commonProps = {
            item,
            selectionMode,
            isSelected,
            onPress: () => (selectionMode ? toggleSelection(item.id) : setSelected(item)),
            onLongPress: () => !selectionMode && enterSelectionMode(item.id),
          };

          return layout === 'list'
            ? <ListItem {...commonProps} />
            : <GridItem {...commonProps} />;
        }}
      />

      <ProductModal
        item={selected && !selectionMode ? selected : null}
        shopData={shopData}
        onClose={() => setSelected(null)}
      />

      {showDeleteConfirm && (
        <DeleteConfirmOverlay
          count={selectedIds.length}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={confirmBulkDelete}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  emptyFlex: { flex: 1 },
  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { textAlign: 'center', color: '#999', fontFamily: 'Inter_400Regular', fontSize: 14 },
});