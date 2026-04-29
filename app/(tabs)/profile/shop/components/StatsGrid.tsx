import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const STATS = [
  { label: 'Auction List', value: '08', icon: 'hammer-outline' },
  { label: 'Active', value: '12', icon: 'flash-outline' },
  { label: 'Sold', value: '84', icon: 'checkmark-circle-outline' },
];

export const StatsGrid = () => {
  return (
    <View style={styles.proStatsGrid}>
      {STATS.map((stat, i) => (
        <View key={i} style={[styles.proStatItem, i !== 0 && styles.statDivider]}>
          <View style={styles.proStatHeader}>
            <Ionicons name={stat.icon as any} size={14} color="#111" />
            <Text style={styles.proStatValue}>{stat.value}</Text>
          </View>
          <Text style={styles.proStatLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  proStatsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, marginBottom: 24 },
  proStatItem: { alignItems: 'center', flex: 1 },
  statDivider: { borderLeftWidth: 1, borderColor: '#F3F4F6' },
  proStatHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  proStatValue: { fontFamily: 'Unbounded_700Bold', fontSize: 16, color: '#111' },
  proStatLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#888', marginTop: 2 },
});

export default StatsGrid;