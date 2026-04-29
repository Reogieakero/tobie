import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AuctionItem {
  id: string;
  title: string;
  bid: string;
  time: string;
}

const LIVE_AUCTIONS: AuctionItem[] = [
  { id: '1', title: 'Vintage Rolex', bid: '₱45,000', time: '2m 45s' },
  { id: '2', title: 'Jordan 1 Retro', bid: '₱12,200', time: '14m 10s' },
  { id: '3', title: 'Sony A7III Body', bid: '₱68,000', time: '1h 05m' },
];

export const LiveBidding = () => {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Live Bidding</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.auctionList}>
        {LIVE_AUCTIONS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.auctionCard}>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.auctionTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.currentBidLabel}>Current Bid</Text>
            <Text style={styles.bidValue}>{item.bid}</Text>
            <View style={styles.timerRow}>
              <Ionicons name="time-outline" size={10} color="#EF4444" />
              <Text style={styles.timerText}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.analyticsBar}>
        <Text style={styles.analyticsText}>Track your shop's growth over time.</Text>
        <TouchableOpacity style={styles.analyticsButton}>
          <Text style={styles.analyticsButtonText}>Visual Analytics</Text>
          <Ionicons name="bar-chart" size={14} color="#111" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 12, color: '#111', textTransform: 'uppercase' },
  seeAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#22C55E' },
  auctionList: { marginBottom: 24, marginHorizontal: -4 },
  auctionCard: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 16, width: 140, marginRight: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  liveText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#EF4444' },
  auctionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#111', marginBottom: 4 },
  currentBidLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#888' },
  bidValue: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111', marginTop: 2 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  timerText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#EF4444' },
  analyticsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 24, paddingHorizontal: 4 },
  analyticsText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#666' },
  analyticsButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F3F4F6', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  analyticsButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#111' },
});

export default LiveBidding;