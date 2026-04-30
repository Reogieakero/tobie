import { useUserStats } from '@/hooks/useShopStats';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export const StatsGrid = () => {
  const { counts, loading } = useUserStats();

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.proStatsGrid}>
      <View style={styles.proStatItem}>
        <View style={styles.proStatHeader}>
          <Ionicons name="hammer-outline" size={14} color="#111" />
          <Text style={styles.proStatValue}>{counts.auction}</Text>
        </View>
        <Text style={styles.proStatLabel}>Auction List</Text>
      </View>

      <View style={[styles.proStatItem, styles.statDivider]}>
        <View style={styles.proStatHeader}>
          <Ionicons name="flash-outline" size={14} color="#111" />
          <Text style={styles.proStatValue}>{counts.active}</Text>
        </View>
        <Text style={styles.proStatLabel}>Active</Text>
      </View>

      <View style={[styles.proStatItem, styles.statDivider]}>
        <View style={styles.proStatHeader}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#111" />
          <Text style={styles.proStatValue}>{counts.sold}</Text>
        </View>
        <Text style={styles.proStatLabel}>Sold</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: { paddingVertical: 20, alignItems: 'center' },
  proStatsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, marginBottom: 24 },
  proStatItem: { alignItems: 'center', flex: 1 },
  statDivider: { borderLeftWidth: 1, borderColor: '#F3F4F6' },
  proStatHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  proStatValue: { fontFamily: 'Unbounded_700Bold', fontSize: 16, color: '#111' },
  proStatLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#888', marginTop: 2 },
});

export default StatsGrid;