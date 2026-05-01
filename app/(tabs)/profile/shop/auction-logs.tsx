import Button from '@/components/ui/Button';
import { useAuctionLogs } from '@/hooks/useAuctionLogs';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const MOCK_BIDS = [
  { id: 'm1', amount: 8500, created_at: new Date().toISOString(), profiles: { first_name: 'Joshua', last_name: 'Serrano' } },
  { id: 'm2', amount: 7200, created_at: new Date().toISOString(), profiles: { first_name: 'Marl', last_name: 'Soriano' } },
  { id: 'm3', amount: 6800, created_at: new Date().toISOString(), profiles: { first_name: 'Jeslito', last_name: 'Geverola' } },
];

export default function AuctionLogsScreen() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams();
  const { bids, itemDetails, loading, refresh } = useAuctionLogs(id as string);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!itemDetails?.end_time) return;

    const timer = setInterval(() => {
      const end = new Date(itemDetails.end_time).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('ENDED');
        clearInterval(timer);
        return;
      }

      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [itemDetails?.end_time]);

  const displayBids = bids.length > 0 
    ? [...bids].sort((a, b) => b.amount - a.amount) 
    : MOCK_BIDS;

  const renderBidItem = ({ item, index }: { item: any, index: number }) => {
    const isTopBid = index === 0;
    const nextItem = displayBids[index + 1];
    const diff = nextItem ? item.amount - nextItem.amount : 0;
    const fullName = item.profiles ? `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() : 'Anonymous Bidder';
    
    const profileImage = item.profiles?.avatar_url 
      ? { uri: item.profiles.avatar_url } 
      : require('@/assets/images/wolf-logo-no-bg.png');

    return (
      <View style={[styles.bidRow, isTopBid && styles.topBidRow]}>
        <View style={styles.profileContainer}>
          <Image source={profileImage} style={styles.avatarImage} />
          <View style={[styles.rankOverlay as any, isTopBid && styles.topRankOverlay]}>
            <Text style={styles.rankTextSmall}>{isTopBid ? '★' : index + 1}</Text>
          </View>
        </View>

        <View style={styles.bidInfo}>
          <Text style={styles.bidderName}>{fullName}</Text>
          <Text style={styles.bidTime}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>

        <View style={styles.amountWrapper}>
          {diff > 0 && (
            <View style={styles.diffContainer}>
              <Ionicons name="caret-up" size={10} color={isTopBid ? "#10B981" : "#EF4444"} />
              <Text style={[styles.diffText, !isTopBid && { color: '#EF4444' }]}>+{diff.toLocaleString()}</Text>
            </View>
          )}
          <Text style={[styles.amountText, isTopBid ? styles.topAmountText : styles.lowerAmountText]}>
            ₱{Number(item.amount).toLocaleString()}
          </Text>
        </View>
      </View>
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
          headerTitle: () => <Text style={styles.headerTitle}>LIVE ACTIVITY</Text>,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={24} color="#111" />
            </TouchableOpacity>
          ),
          headerRight: () => <View style={{ width: 24, marginRight: 16 }} />,
        }} 
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
        <FlatList
          data={displayBids}
          renderItem={renderBidItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={refresh}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.heroSection}>
              <View style={styles.imageWrapper}>
                {itemDetails?.image_url ? (
                  <Image source={{ uri: itemDetails.image_url }} style={styles.heroImage} />
                ) : (
                  <View style={styles.imagePlaceholder}><Ionicons name="image-outline" size={60} color="#E2E8F0" /></View>
                )}
                
                <View style={styles.floatingOverlay}>
                  <View style={styles.overlayTextGroup}>
                    <Text style={styles.overlayLabel}>STARTING</Text>
                    <Text style={styles.overlayValue}>₱{Number(itemDetails?.price || 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.vDivider} />
                  <View style={styles.overlayTextGroup}>
                    <Text style={styles.overlayLabel}>TARGET</Text>
                    <Text style={[styles.overlayValue, { color: '#10B981' }]}>₱{Number(itemDetails?.target_bid || 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.vDivider} />
                  <View style={styles.overlayTextGroup}>
                    <Text style={styles.overlayLabel}>REMAINING</Text>
                    <Text style={[styles.overlayValue, { color: '#F59E0B' }]}>{timeLeft || '--:--:--'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.titleArea}>
                <View style={styles.titleContent}>
                   <View style={styles.textColumn}>
                      <View style={styles.liveIndicator}>
                        <View style={styles.dot} /><Text style={styles.liveText}>LIVE ACTIVITY</Text>
                      </View>
                      <Text style={styles.itemTitle} numberOfLines={1}>{title || "Auction Item"}</Text>
                   </View>
                   <Button 
                    label="PLACE BID" 
                    onPress={() => {}} 
                    variant="primary"
                    style={styles.bidButton}
                    labelStyle={styles.bidButtonLabel}
                   />
                </View>
              </View>

              <View style={styles.historyHeader}><Text style={styles.historyTitle}>BID HISTORY</Text></View>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 11, color: '#111', letterSpacing: 2 },
  navBtn: { marginLeft: 16 },
  heroSection: { backgroundColor: '#FFF' },
  imageWrapper: { width: width, height: width * 0.7, backgroundColor: '#F8FAFC', position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  floatingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  overlayTextGroup: { flex: 1 },
  vDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 8 },
  overlayLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 8, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, marginBottom: 2 },
  overlayValue: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#FFF' },
  titleArea: { paddingHorizontal: 16, paddingVertical: 16 },
  titleContent: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  textColumn: { flex: 1, marginRight: 12 },
  bidButton: { height: 50, paddingHorizontal: 0, borderRadius: 8 },
  bidButtonLabel: { fontSize: 10, letterSpacing: 1 },
  itemTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 22, color: '#1E293B' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444', marginRight: 6 },
  liveText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#EF4444', letterSpacing: 1 },
  historyHeader: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F8FAFC', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  historyTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 10, color: '#64748B', letterSpacing: 1 },
  listContent: { paddingBottom: 40 },
  bidRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  topBidRow: { backgroundColor: '#F0FDF4' },
  profileContainer: { position: 'relative', marginRight: 12 },
  avatarImage: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', resizeMode: 'contain' },
  rankOverlay: { position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#94A3B8', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFF' },
  topRankOverlay: { backgroundColor: '#10B981' },
  rankTextSmall: { fontFamily: 'Unbounded_700Bold', fontSize: 7, color: '#FFF' },
  bidInfo: { flex: 1 },
  bidderName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1E293B' },
  bidTime: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#94A3B8', marginTop: 1 },
  amountWrapper: { flexDirection: 'row', alignItems: 'center' },
  diffContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  diffText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#10B981', marginLeft: 2 },
  amountText: { fontFamily: 'Unbounded_700Bold', fontSize: 14, color: '#1E293B' },
  topAmountText: { color: '#10B981' },
  lowerAmountText: { color: '#EF4444' }
});