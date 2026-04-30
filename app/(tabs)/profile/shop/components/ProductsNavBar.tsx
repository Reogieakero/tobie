import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  shopName: string;
  selectionMode: boolean;
  selectedCount: number;
  layout: 'grid' | 'list';
  onBack: () => void;
  onExitSelection: () => void;
  onToggleLayout: () => void;
  onDeletePress: () => void;
}

export default function ShopHeader({
  shopName,
  selectionMode,
  selectedCount,
  layout,
  onBack,
  onExitSelection,
  onToggleLayout,
  onDeletePress,
}: Props) {
  return (
    <View style={styles.container}>
      {selectionMode ? (
        <TouchableOpacity onPress={onExitSelection} style={styles.navBtn}>
          <Ionicons name="close" size={24} color="#111" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onBack} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>
        {selectionMode ? `${selectedCount} SELECTED` : (shopName?.toUpperCase() || 'MY SHOP')}
      </Text>
      <View style={styles.right}>
        {selectionMode ? (
          <TouchableOpacity onPress={onDeletePress} disabled={selectedCount === 0}>
            <Ionicons name="trash-outline" size={22} color={selectedCount === 0 ? '#ccc' : '#EF4444'} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navBtn} onPress={onToggleLayout}>
            <Ionicons name={layout === 'grid' ? 'list-outline' : 'grid-outline'} size={24} color="#111" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  navBtn: { padding: 4 },
  title: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});