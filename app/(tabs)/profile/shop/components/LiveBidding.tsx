import { useLiveAuctions } from '@/hooks/useLiveAuctions';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const getTimeRemaining = (endTime: string) => {
  const total = Date.parse(endTime) - Date.now();
  if (total <= 0) return 'Ended';

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
};

const TimerTicker = ({ endTime, onEnd }: { endTime: string; onEnd: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(endTime);
      setTimeLeft(remaining);
      if (remaining === 'Ended') {
        onEnd();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return <Text style={styles.timerText}>{timeLeft}</Text>;
};

export default function LiveBidding() {
  const router = useRouter();
  const { auctions, loading } = useLiveAuctions();
  const [displayAuctions, setDisplayAuctions] = useState<any[]>([]);

  useEffect(() => {
    const liveOnly = auctions.filter(item => Date.parse(item.end_time) > Date.now());
    setDisplayAuctions(liveOnly);
  }, [auctions]);

  const handleTimerEnd = () => {
    const liveOnly = auctions.filter(item => Date.parse(item.end_time) > Date.now());
    setDisplayAuctions(liveOnly);
  };

  if (loading && auctions.length === 0) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color="#FF6B35" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Live Bidding</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile/shop/live-auctions')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.auctionList}>
        {displayAuctions.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.auctionCard}
            onPress={() => router.push({
              pathname: '/(tabs)/profile/shop/auction-logs',
              params: { id: item.id, title: item.title }
            })}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              {item.target_bid && (
                <Text style={styles.targetBidText}>🎯 ₱{item.target_bid}</Text>
              )}
            </View>

            <Text style={styles.auctionTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.currentBidLabel}>Starting Price</Text>
            <Text style={styles.bidValue}>₱{Number(item.price || 0).toLocaleString()}</Text> 
            
            <View style={styles.timerRow}>
              <Ionicons name="time-outline" size={10} color="#EF4444" />
              {item.end_time ? (
                <TimerTicker endTime={item.end_time} onEnd={handleTimerEnd} />
              ) : (
                <Text style={styles.timerText}>No Limit</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
        {displayAuctions.length === 0 && !loading && (
          <Text style={styles.emptyText}>No live auctions found.</Text>
        )}
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
}

const styles = StyleSheet.create({
  loader: { padding: 20, alignItems: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 12, color: '#111', textTransform: 'uppercase' },
  seeAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#22C55E' },
  auctionList: { marginBottom: 24, marginHorizontal: -4 },
  auctionCard: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 16, width: 160, marginRight: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  liveText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#EF4444' },
  targetBidText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#666' },
  auctionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#111', marginBottom: 4 },
  currentBidLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#888' },
  bidValue: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111', marginTop: 2 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  timerText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#EF4444', minWidth: 80 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#999', marginLeft: 4, marginTop: 10 },
  analyticsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 24, paddingHorizontal: 4 },
  analyticsText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#666' },
  analyticsButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F3F4F6', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  analyticsButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#111' },
});