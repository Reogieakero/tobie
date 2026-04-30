import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const Sparkline = ({ data, width, height }: { data: number[], width: number, height: number }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return { x, y };
  });

  const pathData = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');

  return (
    <Svg height={height} width={width}>
      <Path
        d={pathData}
        fill="none"
        stroke="#10B981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const getTimeRemaining = (endTime: string) => {
  const total = Date.parse(endTime) - Date.now();
  if (total <= 0) return 'Ended';
  const mins = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m ${Math.floor((total / 1000) % 60)}s`;
};

const AuctionCard = ({ item, isDragging }: { item: any, isDragging?: boolean }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(item.end_time));
  const history = item.history || [1200, 1500, 1400, 2000, 1800, 2600, 2400, 3100];

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeRemaining(item.end_time)), 1000);
    return () => clearInterval(interval);
  }, [item.end_time]);

  return (
    <View style={[styles.card, isDragging && styles.draggingCard]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="reorder-two-outline" size={18} color={isDragging ? "#10B981" : "#CBD5E1"} />
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        </View>
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={12} color="#EF4444" />
          <Text style={styles.timerText}>{timeLeft}</Text>
        </View>
      </View>

      <View style={styles.dashboardRow}>
        <View style={styles.graphContainer}>
          <Sparkline data={history} width={120} height={35} />
          <Text style={styles.trendText}>BIDDING MOMENTUM +24.8%</Text>
        </View>

        <View style={styles.targetGroup}>
          <Text style={styles.labelRight}>TARGET BID</Text>
          <Text style={styles.targetPrice}>₱{item.target_bid?.toLocaleString() || '0'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  draggingCard: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: '#FAFBFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  title: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 14,
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  timerText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#EF4444',
  },
  dashboardRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  graphContainer: {
    flex: 2,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  trendText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    color: '#10B981',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  targetGroup: {
    flex: 1,
    alignItems: 'flex-end',
  },
  labelRight: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: 'right',
  },
  targetPrice: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 16,
    color: '#0F172A',
  },
});

export default AuctionCard;