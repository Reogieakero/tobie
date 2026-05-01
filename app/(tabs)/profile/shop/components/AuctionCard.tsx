import { useAuctionCardData } from '@/hooks/useAuctionCardData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Path, Stop, LinearGradient as SvgGradient } from 'react-native-svg';

const Sparkline = ({ data, width, height }: { data: number[], width: number, height: number }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((val - min) / range) * (height - 4) - 2,
  }));
  
  const d = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const areaD = `${d} L${width},${height} L0,${height} Z`;

  return (
    <Svg height={height} width={width} style={{ overflow: 'visible' }}>
      <Defs>
        <SvgGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#10B981" stopOpacity="0.3" />
          <Stop offset="1" stopColor="#10B981" stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Path d={areaD} fill="url(#grad)" />
      <Path d={d} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const AuctionCard = ({ item, isDragging }: { item: any, isDragging?: boolean }) => {
  const { timeLeft, currentPrice, targetBid, isEnded, loading } = useAuctionCardData(item);
  const history = item.history || [1200, 1500, 1400, 2000, 1800, 2600, 2400, 3100];

  return (
    <LinearGradient
      colors={['#2C2C2C', '#1A1A1A', '#0F0F0F']} 
      style={[styles.fullWidthContainer, isDragging && styles.dragging]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Image
        source={require('../../../../../assets/images/wolf-logo-no-bg.png')}
        style={styles.backgroundImage}
        resizeMode="contain"
      />

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <View style={styles.liveIndicator}>
              <View style={[styles.liveDot, isEnded && styles.endedDot]} />
              <Text style={styles.liveText}>{isEnded ? 'FINISHED' : 'LIVE'}</Text>
            </View>
          </View>
          
          <View style={[styles.timerWrapper, isEnded && styles.timerEnded]}>
            <Ionicons name="time" size={12} color={isEnded ? "#94A3B8" : "#F87171"} />
            <Text style={[styles.timerText, isEnded && styles.textMuted]}>{timeLeft}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.dashboardRow}>
          <View style={styles.graphSection}>
            <Text style={styles.label}>MARKET TREND</Text>
            <View style={styles.graphContainer}>
              <Sparkline data={history} width={110} height={35} />
            </View>
            <View style={styles.trendBadge}>
              <Ionicons name="trending-up" size={10} color="#10B981" />
              <Text style={styles.trendText}>+24.8%</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.priceSection}>
              <Text style={styles.label}>FLOOR</Text>
              <Text style={styles.floorPrice}>₱{Number(currentPrice).toLocaleString()}</Text>
            </View>

            <View style={styles.priceSection}>
              <Text style={styles.labelPrimary}>TARGET BID</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#10B981" style={{ marginTop: 4 }} />
              ) : (
                <Text style={styles.targetPriceText}>
                  {targetBid != null ? `₱${Number(targetBid).toLocaleString()}` : '—'}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fullWidthContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 24,
    position: 'relative',
    minHeight: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dragging: { opacity: 0.7 },
  backgroundImage: {
    position: 'absolute',
    right: 0,
    bottom: -10,
    width: 140,
    height: 140,
    opacity: 0.06,
  },
  contentContainer: { zIndex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: { flex: 1 },
  title: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 14,
    color: '#F8FAFC',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  endedDot: { backgroundColor: '#64748B' },
  liveText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#64748B', letterSpacing: 1 },
  timerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timerEnded: { backgroundColor: 'rgba(148, 163, 184, 0.05)' },
  timerText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#F87171' },
  textMuted: { color: '#94A3B8' },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)', marginBottom: 16 },
  dashboardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  graphSection: { flex: 1.2 },
  graphContainer: { marginVertical: 6 },
  statsContainer: { flex: 1, alignItems: 'flex-end', gap: 12 },
  priceSection: { alignItems: 'flex-end' },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 8, color: '#64748B', letterSpacing: 1.2, marginBottom: 2 },
  labelPrimary: { fontFamily: 'Inter_700Bold', fontSize: 8, color: '#10B981', letterSpacing: 1.2, marginBottom: 2 },
  floorPrice: { fontFamily: 'Unbounded_700Bold', fontSize: 12, color: '#94A3B8' },
  targetPriceText: { fontFamily: 'Unbounded_700Bold', fontSize: 18, color: '#FFFFFF' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#10B981' },
});

export default AuctionCard;