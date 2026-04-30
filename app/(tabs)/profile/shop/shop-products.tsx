import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = (width - 3) / 3;

type FilterType = 'all' | 'auction' | 'posted' | 'fast_flip';

const FILTERS: { id: FilterType; label: string; icon: string }[] = [
  { id: 'all',       label: 'All',       icon: 'grid-outline'     },
  { id: 'auction',   label: 'Auction',   icon: 'hammer-outline'   },
  { id: 'posted',    label: 'Fixed',     icon: 'pricetag-outline' },
  { id: 'fast_flip', label: 'Fast Flip', icon: 'flash-outline'    },
];

function getRemainingMs(endTime: string | null): number {
  if (!endTime) return 0;
  return Math.max(0, new Date(endTime).getTime() - Date.now());
}

type Urgency = 'ended' | 'critical' | 'warning' | 'normal';

function getUrgency(ms: number): Urgency {
  if (ms <= 0)         return 'ended';
  if (ms < 60_000)     return 'critical';
  if (ms < 300_000)    return 'warning';
  return 'normal';
}

function useCountdown(endTime: string | null): number {
  const [remaining, setRemaining] = useState(() => getRemainingMs(endTime));
  useEffect(() => {
    if (!endTime) return;
    const tick = () => setRemaining(getRemainingMs(endTime));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return remaining;
}

function AuctionTimer({ endTime }: { endTime: string }) {
  const remaining = useCountdown(endTime);
  const urgency = getUrgency(remaining);

  if (urgency === 'ended') return null;

  const totalSec = Math.floor(remaining / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');

  return (
    <View style={styles.auctionTimerContainer}>
      <View style={styles.auctionHeader}>
        <Ionicons name="time-outline" size={10} color="#fff" />
        <Text style={styles.auctionHeaderText}>ENDS IN</Text>
      </View>
      <View style={styles.digitContainer}>
        <View style={styles.digitBox}><Text style={styles.digitText}>{h}</Text></View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.digitBox}><Text style={styles.digitText}>{m}</Text></View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.digitBox}><Text style={styles.digitText}>{s}</Text></View>
      </View>
    </View>
  );
}

function ModalCountdown({ endTime }: { endTime: string }) {
  const remaining = useCountdown(endTime);
  const urgency = getUrgency(remaining);
  const color = urgency === 'critical' ? '#DC2626' : urgency === 'warning' ? '#D97706' : urgency === 'ended' ? '#6B7280' : '#111';
  
  const totalSec = Math.floor(remaining / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const timeStr = h > 0 ? `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s` : `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;

  return (
    <View style={[styles.countdownRow, urgency === 'critical' && { backgroundColor: '#FEF2F2' }, urgency === 'warning' && { backgroundColor: '#FFFBEB' }]}>
      <View style={styles.countdownLeft}>
        <Ionicons name="time-outline" size={14} color={color} />
        <Text style={[styles.countdownLabel, { color }]}>{remaining <= 0 ? 'Auction ended' : 'Time remaining'}</Text>
      </View>
      <Text style={[styles.countdownValue, { color }]}>{remaining <= 0 ? '—' : timeStr}</Text>
    </View>
  );
}

export default function ShopProductsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selected, setSelected] = useState<any | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let channel: any = null;
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await fetchShopContent(user.id);
      channel = supabase
        .channel(`shop_products_${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'items', filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              if (payload.new.status === 'active') {
                setItems((prev) => [payload.new, ...prev]);
              }
            } else if (payload.eventType === 'UPDATE') {
              setItems((prev) => 
                prev.map(i => i.id === payload.new.id ? payload.new : i)
                    .filter(i => i.status === 'active')
              );
            } else if (payload.eventType === 'DELETE') {
              setItems((prev) => prev.filter(i => i.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    };
    init();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const fetchShopContent = async (userId: string) => {
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      const { data: products } = await supabase.from('items').select('*').eq('user_id', userId).eq('status', 'active').order('created_at', { ascending: false });
      setShopData(profile);
      setItems(products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter((i) => i.selling_type === activeFilter);
  }, [items, activeFilter]);

  const isLive = (item: any) => item?.selling_type === 'auction' && item?.end_time && getRemainingMs(item.end_time) > 0;
  const isEnded = (item: any) => item?.selling_type === 'auction' && item?.end_time && getRemainingMs(item.end_time) <= 0;
  const hasNoTimer = (item: any) => item?.selling_type === 'auction' && !item?.end_time;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/profile/shop')} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{shopData?.full_name?.toUpperCase() || 'MY SHOP'}</Text>
        <TouchableOpacity style={styles.navBtn}>
          <Ionicons name="share-outline" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {FILTERS.map((f) => {
            const active = activeFilter === f.id;
            const count = f.id === 'all' ? items.length : items.filter((i) => i.selling_type === f.id).length;
            return (
              <TouchableOpacity key={f.id} style={[styles.filterTab, active && styles.filterTabActive]} onPress={() => setActiveFilter(f.id)} activeOpacity={0.75}>
                <Ionicons name={f.icon as any} size={14} color={active ? '#fff' : '#111'} />
                <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{f.label}</Text>
                {count > 0 && (
                  <View style={[styles.countBadge, active && styles.countBadgeActive]}>
                    <Text style={[styles.countText, active && styles.countTextActive]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        extraData={tick}
        contentContainerStyle={filteredItems.length === 0 ? styles.emptyFlex : undefined}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#E2E2E2" />
            <Text style={styles.emptyText}>{activeFilter === 'all' ? 'No active listings yet.' : `No ${FILTERS.find((f) => f.id === activeFilter)?.label} listings.`}</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const ended = isEnded(item);
          const live = isLive(item);
          const noTimer = hasNoTimer(item);
          return (
            <TouchableOpacity style={[styles.cell, { marginLeft: index % 3 === 1 ? 1.5 : 0, marginRight: index % 3 === 1 ? 1.5 : 0 }, ended && { opacity: 0.55 }]} activeOpacity={0.85} onPress={() => setSelected(item)}>
              <Image source={{ uri: item.image_url }} style={styles.cellImage} />
              {(item.selling_type !== 'posted' || ended) && (
                <View style={[styles.typeBadge, item.selling_type === 'fast_flip' && styles.typeBadgeFlip, live && styles.typeBadgeLive, ended && styles.typeBadgeEnded, noTimer && styles.typeBadgeNoTimer]}>
                  {live && <View style={styles.liveDot} />}
                  {noTimer && <Ionicons name="alert-circle-outline" size={9} color="#fff" />}
                  <Text style={styles.badgeText}>{live ? 'LIVE' : ended ? 'ENDED' : noTimer ? 'NO TIMER' : item.selling_type === 'fast_flip' ? 'FLIP' : 'AUC'}</Text>
                </View>
              )}
              {live && item.end_time && <AuctionTimer endTime={item.end_time} />}
              {noTimer && (
                <View style={styles.noTimerBar}>
                  <Ionicons name="alert-circle-outline" size={9} color="#fff" />
                  <Text style={styles.timerDigitText}>No end time set</Text>
                </View>
              )}
              <View style={styles.cellOverlay}>
                <Text style={styles.cellPrice}>₱{item.price?.toLocaleString()}</Text>
                {item.selling_type === 'auction' && <Text style={styles.cellMeta}>{item.bids_count ?? 0} bids</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={!!selected} transparent animationType="fade" statusBarTranslucent>
        <TouchableWithoutFeedback onPress={() => setSelected(null)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.modalImageWrap}>
                  <Image source={{ uri: selected?.image_url }} style={styles.modalImage} />
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}><Ionicons name="close" size={20} color="#fff" /></TouchableOpacity>
                  {isLive(selected) && <View style={styles.modalLiveBadge}><View style={styles.liveDot} /><Text style={styles.badgeText}>LIVE</Text></View>}
                  {isEnded(selected) && <View style={[styles.modalLiveBadge, styles.typeBadgeEnded]}><Text style={styles.badgeText}>AUCTION ENDED</Text></View>}
                  {hasNoTimer(selected) && <View style={[styles.modalLiveBadge, styles.typeBadgeNoTimer]}><Ionicons name="alert-circle-outline" size={11} color="#fff" /><Text style={styles.badgeText}>NO TIMER</Text></View>}
                </View>
                <View style={styles.modalBody}>
                  <Text style={styles.modalTitle}>{selected?.title}</Text>
                  <Text style={styles.modalSeller}>{shopData?.full_name || shopData?.username || 'My Shop'}</Text>
                  {selected?.selling_type === 'auction' && selected?.end_time && <ModalCountdown endTime={selected.end_time} />}
                  {hasNoTimer(selected) && (
                    <View style={styles.noTimerWarning}>
                      <Ionicons name="alert-circle-outline" size={16} color="#B45309" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.noTimerWarningTitle}>No end time set</Text>
                        <Text style={styles.noTimerWarningDesc}>This auction has no duration. Edit the listing to add an end time.</Text>
                      </View>
                    </View>
                  )}
                  <View style={styles.modalStats}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>{selected?.selling_type === 'auction' ? 'Starting Bid' : 'Price'}</Text>
                      <Text style={styles.statValue}>₱{selected?.price?.toLocaleString()}</Text>
                    </View>
                    {selected?.selling_type === 'auction' && (
                      <View style={[styles.statBox, styles.statHighlight]}>
                        <Text style={[styles.statLabel, { color: '#FF6B35' }]}>{isEnded(selected) ? 'Final Bid' : 'Current Bid'}</Text>
                        <Text style={[styles.statValue, { color: '#FF6B35' }]}>₱{(selected?.current_bid ?? selected?.price)?.toLocaleString()}</Text>
                      </View>
                    )}
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Qty</Text>
                      <Text style={styles.statValue}>{selected?.quantity ?? 1}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.actionBtn, isEnded(selected) && { backgroundColor: '#6B7280' }]} activeOpacity={0.85} onPress={() => { setSelected(null); router.push(`/products/${selected?.id}`); }}>
                    <Text style={styles.actionBtnText}>{isEnded(selected) ? 'View Auction Results' : selected?.selling_type === 'auction' ? 'Place a Bid' : 'View Listing'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  navBtn: { padding: 4 },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111' },
  filterScrollContent: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  filterTab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', minWidth: 80 },
  filterTabActive: { backgroundColor: '#111', borderColor: '#111', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  filterLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#111' },
  filterLabelActive: { color: '#fff' },
  countBadge: { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignItems: 'center' },
  countBadgeActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  countText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#666' },
  countTextActive: { color: '#fff' },
  cell: { width: ITEM_SIZE, height: ITEM_SIZE, backgroundColor: '#F2F2F2', position: 'relative', overflow: 'hidden', marginBottom: 1.5 },
  cellImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  typeBadge: { position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(17,17,17,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 3 },
  typeBadgeLive: { backgroundColor: 'rgba(255,107,53,0.92)' },
  typeBadgeFlip: { backgroundColor: 'rgba(59,130,246,0.9)' },
  typeBadgeEnded: { backgroundColor: 'rgba(107,114,128,0.9)' },
  typeBadgeNoTimer: { backgroundColor: 'rgba(180,83,9,0.92)' },
  
  auctionTimerContainer: { position: 'absolute', bottom: 34, left: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', paddingVertical: 4, alignItems: 'center', justifyContent: 'center' },
  auctionHeader: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 2 },
  auctionHeaderText: { fontFamily: 'Unbounded_700Bold', fontSize: 7, color: '#fff', opacity: 0.8, letterSpacing: 0.5 },
  digitContainer: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  digitBox: { backgroundColor: '#333', borderRadius: 2, paddingHorizontal: 3, paddingVertical: 1, minWidth: 16, alignItems: 'center' },
  digitText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#fff' },
  separator: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold', paddingBottom: 1 },

  noTimerBar: { position: 'absolute', bottom: 34, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4, backgroundColor: 'rgba(180,83,9,0.88)' },
  timerDigitText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#fff', letterSpacing: 0.4 },
  
  noTimerWarning: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 10, padding: 12, marginBottom: 14 },
  noTimerWarningTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#92400E', marginBottom: 2 },
  noTimerWarningDesc: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#B45309', lineHeight: 16 },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#fff' },
  badgeText: { fontFamily: 'Unbounded_700Bold', fontSize: 8, color: '#fff', letterSpacing: 0.5 },
  cellOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 6, paddingVertical: 5 },
  cellPrice: { fontFamily: 'Unbounded_700Bold', fontSize: 11, color: '#fff' },
  cellMeta: { fontFamily: 'Inter_400Regular', fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  emptyFlex: { flex: 1 },
  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { textAlign: 'center', color: '#999', fontFamily: 'Inter_400Regular', fontSize: 14 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  modalImageWrap: { width: '100%', height: height * 0.38, position: 'relative' },
  modalImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  closeBtn: { position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  modalLiveBadge: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,107,53,0.92)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, gap: 4 },
  modalBody: { padding: 20, paddingBottom: 32 },
  modalTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 15, color: '#111', marginBottom: 4 },
  modalSeller: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#888', marginBottom: 12 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F7F7F7', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  countdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  countdownLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#111' },
  countdownValue: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111' },
  modalStats: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox: { flex: 1, backgroundColor: '#F7F7F7', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  statHighlight: { backgroundColor: '#FFF4EF' },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#888', marginBottom: 3 },
  statValue: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111' },
  actionBtn: { backgroundColor: '#111', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  actionBtnText: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#fff', letterSpacing: 0.3 },
});