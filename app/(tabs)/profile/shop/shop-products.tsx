import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
const GRID_ITEM_SIZE = (width - 3) / 3;

type FilterType = 'all' | 'scheduled' | 'auction' | 'posted' | 'fast_flip';
type ViewLayout = 'grid' | 'list';

const FILTERS: { id: FilterType; label: string; icon: string }[] = [
  { id: 'all',       label: 'All',       icon: 'grid-outline'         },
  { id: 'scheduled', label: 'Scheduled', icon: 'calendar-outline'    },
  { id: 'auction',   label: 'Auction',   icon: 'hammer-outline'       },
  { id: 'posted',    label: 'Fixed',     icon: 'pricetag-outline'    },
  { id: 'fast_flip', label: 'Fast Flip', icon: 'flash-outline'       },
];

function getRemainingMs(endTime: string | null): number {
  if (!endTime) return 0;
  return Math.max(0, new Date(endTime).getTime() - Date.now());
}

function getStartsInMs(startTime: string | null): number {
  if (!startTime) return 0;
  return Math.max(0, new Date(startTime).getTime() - Date.now());
}

type Urgency = 'ended' | 'critical' | 'warning' | 'normal';

function getUrgency(ms: number): Urgency {
  if (ms <= 0)      return 'ended';
  if (ms < 60_000)  return 'critical';
  if (ms < 300_000) return 'warning';
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

function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  return `${String(s).padStart(2, '0')}s`;
}

function formatScheduledDate(startTime: string): string {
  const d = new Date(startTime);
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function AuctionTimer({ endTime, isList }: { endTime: string, isList?: boolean }) {
  const remaining = useCountdown(endTime);
  const urgency = getUrgency(remaining);
  if (urgency === 'ended') return null;

  const totalSec = Math.floor(remaining / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');

  return (
    <View style={[styles.auctionTimerContainer, isList && styles.listTimerContainer]}>
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

function ScheduledBar({ startTime }: { startTime: string }) {
  const [startsIn, setStartsIn] = useState(() => getStartsInMs(startTime));
  useEffect(() => {
    const tick = () => setStartsIn(getStartsInMs(startTime));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  return (
    <View style={styles.scheduledBar}>
      <Ionicons name="calendar-outline" size={9} color="#fff" />
      <Text style={styles.scheduledBarText}>
        {startsIn > 0 ? `STARTS IN ${formatCountdown(startsIn)}` : 'STARTING...'}
      </Text>
    </View>
  );
}

function ModalCountdown({ endTime }: { endTime: string }) {
  const remaining = useCountdown(endTime);
  const urgency = getUrgency(remaining);
  const color =
    urgency === 'critical' ? '#DC2626' :
    urgency === 'warning'  ? '#D97706' :
    urgency === 'ended'    ? '#6B7280' : '#111';

  const timeStr = remaining <= 0 ? '—' : formatCountdown(remaining);

  return (
    <View style={[
      styles.countdownRow,
      urgency === 'critical' && { backgroundColor: '#FEF2F2' },
      urgency === 'warning'  && { backgroundColor: '#FFFBEB' },
    ]}>
      <View style={styles.countdownLeft}>
        <Ionicons name="time-outline" size={14} color={color} />
        <Text style={[styles.countdownLabel, { color }]}>
          {remaining <= 0 ? 'Auction ended' : 'Time remaining'}
        </Text>
      </View>
      <Text style={[styles.countdownValue, { color }]}>{timeStr}</Text>
    </View>
  );
}

function ModalScheduledRow({ startTime }: { startTime: string }) {
  const [startsIn, setStartsIn] = useState(() => getStartsInMs(startTime));
  useEffect(() => {
    const tick = () => setStartsIn(getStartsInMs(startTime));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  return (
    <View style={styles.scheduledModalRow}>
      <View style={styles.countdownLeft}>
        <Ionicons name="calendar-outline" size={14} color="#111" />
        <Text style={styles.countdownLabel}>Starts</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.countdownValue, { fontSize: 12 }]}>
          {formatScheduledDate(startTime)}
        </Text>
        {startsIn > 0 && (
          <Text style={styles.startsInSub}>in {formatCountdown(startsIn)}</Text>
        )}
      </View>
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
  const [managingId, setManagingId] = useState<string | null>(null);
  const [layout, setLayout] = useState<ViewLayout>('grid');

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
              if (payload.new.status === 'active' || payload.new.status === 'scheduled') {
                setItems((prev) => [payload.new, ...prev]);
              }
            } else if (payload.eventType === 'UPDATE') {
              setItems((prev) =>
                prev
                  .map((i) => (i.id === payload.new.id ? payload.new : i))
                  .filter((i) => i.status === 'active' || i.status === 'scheduled')
              );
            } else if (payload.eventType === 'DELETE') {
              setItems((prev) => prev.filter((i) => i.id !== payload.old.id));
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
      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', userId).single();

      const { data: products } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'scheduled'])
        .order('created_at', { ascending: false });

      setShopData(profile);
      setItems(products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to remove this listing?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            const { error } = await supabase.from('items').delete().eq('id', itemId);
            if (error) Alert.alert("Error", error.message);
            setManagingId(null);
          } 
        }
      ]
    );
  };

  const isActuallyScheduled = (item: any) => {
    return item?.status === 'scheduled' && getStartsInMs(item.start_time) > 0;
  };

  const isActuallyLive = (item: any) => {
    if (item?.status === 'active') return true;
    return item?.status === 'scheduled' && getStartsInMs(item.start_time) <= 0;
  };

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    if (activeFilter === 'scheduled') return items.filter((i) => isActuallyScheduled(i));
    return items.filter((i) => i.selling_type === activeFilter && isActuallyLive(i));
  }, [items, activeFilter, tick]);

  const counts = useMemo(() => ({
    all:       items.length,
    scheduled: items.filter((i) => isActuallyScheduled(i)).length,
    auction:   items.filter((i) => i.selling_type === 'auction'    && isActuallyLive(i)).length,
    posted:     items.filter((i) => i.selling_type === 'posted'     && isActuallyLive(i)).length,
    fast_flip: items.filter((i) => i.selling_type === 'fast_flip'  && isActuallyLive(i)).length,
  }), [items, tick]);

  const isLive      = (item: any) => item?.selling_type === 'auction' && item?.end_time && getRemainingMs(item.end_time) > 0 && isActuallyLive(item);
  const isEnded     = (item: any) => item?.selling_type === 'auction' && item?.end_time && getRemainingMs(item.end_time) <= 0 && isActuallyLive(item);
  const hasNoTimer  = (item: any) => item?.selling_type === 'auction' && !item?.end_time && isActuallyLive(item);

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
        <TouchableOpacity 
          style={styles.navBtn}
          onPress={() => setLayout(layout === 'grid' ? 'list' : 'grid')}
        >
          <Ionicons name={layout === 'grid' ? 'list-outline' : 'grid-outline'} size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {FILTERS.map((f) => {
            const active = activeFilter === f.id;
            const count = counts[f.id];
            return (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterTab,
                  active && styles.filterTabActive,
                ]}
                onPress={() => setActiveFilter(f.id)}
                activeOpacity={0.75}
              >
                <Ionicons name={f.icon as any} size={14} color={active ? '#fff' : '#111'} />
                <Text style={[
                  styles.filterLabel,
                  active && styles.filterLabelActive,
                ]}>
                  {f.label}
                </Text>
                {count > 0 && (
                  <View style={[
                    styles.countBadge,
                    active && styles.countBadgeActive,
                  ]}>
                    <Text style={[
                      styles.countText,
                      active && styles.countTextActive,
                    ]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        key={layout}
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={layout === 'grid' ? 3 : 1}
        showsVerticalScrollIndicator={false}
        extraData={[tick, managingId, layout]}
        contentContainerStyle={filteredItems.length === 0 ? styles.emptyFlex : (layout === 'list' ? { paddingHorizontal: 16 } : undefined)}
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
        renderItem={({ item, index }) => {
          const scheduled = isActuallyScheduled(item);
          const ended  = isEnded(item);
          const live   = isLive(item);
          const noTimer = hasNoTimer(item);
          const isManaging = managingId === item.id;

          if (layout === 'list') {
            return (
              <TouchableOpacity
                style={[styles.listItemRow, ended && { opacity: 0.6 }]}
                onPress={() => setSelected(item)}
                onLongPress={() => setManagingId(item.id)}
              >
                <View style={styles.listImageContainerSmall}>
                  <Image source={{ uri: item.image_url }} style={styles.listImage} />
                  {live && <AuctionTimer endTime={item.end_time} isList />}
                </View>
                
                <View style={styles.listContentRow}>
                  <View style={styles.listMainInfo}>
                    <Text style={styles.listTitleRow} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.listMetaRow}>
                        {item.selling_type === 'auction' ? `${item.bids_count ?? 0} bids` : `Qty: ${item.quantity ?? 1}`}
                    </Text>
                  </View>

                  <View style={styles.listPriceInfo}>
                    <Text style={styles.listPriceRow}>₱{item.price?.toLocaleString()}</Text>
                    <View style={[
                        styles.typeBadgeSmall,
                        live && styles.typeBadgeLive,
                        scheduled && styles.typeBadgeScheduled,
                        ended && styles.typeBadgeEnded
                    ]}>
                        <Text style={[styles.badgeTextSmall, (live || scheduled || ended) && { color: '#fff' }]}>
                        {live ? 'LIVE' : scheduled ? 'SCHED' : ended ? 'ENDED' : item.selling_type.toUpperCase()}
                        </Text>
                    </View>
                  </View>
                </View>

                {isManaging && (
                  <View style={styles.adminOverlayListRow}>
                    {!ended && (
                        <TouchableOpacity style={styles.adminBtnSmall} onPress={() => { setManagingId(null); router.push({ pathname: '/(tabs)/profile/shop/addItem', params: { id: item.id } }); }}>
                        <Ionicons name="create" size={18} color="#fff" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.adminBtnSmall, styles.adminBtnDelete]} onPress={() => handleDelete(item.id)}>
                      <Ionicons name="trash" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.adminCloseSmall} onPress={() => setManagingId(null)}>
                        <Ionicons name="close" size={20} color="#111" />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              style={[
                styles.cell,
                { marginLeft: index % 3 === 1 ? 1.5 : 0, marginRight: index % 3 === 1 ? 1.5 : 0 },
                ended && { opacity: 0.55 },
                scheduled && styles.cellScheduled,
              ]}
              activeOpacity={0.85}
              onPress={() => {
                if (isManaging) setManagingId(null);
                else setSelected(item);
              }}
              onLongPress={() => setManagingId(item.id)}
            >
              <Image source={{ uri: item.image_url }} style={styles.cellImage} />

              {scheduled && <View style={styles.scheduledOverlayTint} />}

              {scheduled ? (
                <View style={[styles.typeBadge, styles.typeBadgeScheduled]}>
                  <Ionicons name="calendar-outline" size={9} color="#fff" />
                  <Text style={styles.badgeText}>SCHED</Text>
                </View>
              ) : (item.selling_type !== 'posted' || ended) ? (
                <View style={[
                  styles.typeBadge,
                  item.selling_type === 'fast_flip' && styles.typeBadgeFlip,
                  live   && styles.typeBadgeLive,
                  ended  && styles.typeBadgeEnded,
                  noTimer && styles.typeBadgeNoTimer,
                ]}>
                  {live    && <View style={styles.liveDot} />}
                  {noTimer && <Ionicons name="alert-circle-outline" size={9} color="#fff" />}
                  <Text style={styles.badgeText}>
                    {live ? 'LIVE' : ended ? 'ENDED' : noTimer ? 'NO TIMER' : item.selling_type === 'fast_flip' ? 'FLIP' : 'AUC'}
                  </Text>
                </View>
              ) : null}

              {scheduled && item.start_time && <ScheduledBar startTime={item.start_time} />}
              {live && item.end_time && <AuctionTimer endTime={item.end_time} />}
              
              <View style={styles.cellOverlay}>
                <Text style={styles.cellPrice}>₱{item.price?.toLocaleString()}</Text>
                {item.selling_type === 'auction' && !scheduled && (
                  <Text style={styles.cellMeta}>{item.bids_count ?? 0} bids</Text>
                )}
              </View>

              {isManaging && (
                <View style={styles.adminOverlay}>
                  {!ended && (
                    <TouchableOpacity style={styles.adminBtn} onPress={() => { setManagingId(null); router.push({ pathname: '/(tabs)/profile/shop/addItem', params: { id: item.id } }); }}>
                        <Ionicons name="create" size={22} color="#fff" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.adminBtn, styles.adminBtnDelete]} onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash" size={22} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adminClose} onPress={() => setManagingId(null)}>
                    <Ionicons name="close-circle" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
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
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>

                  {isActuallyScheduled(selected) && (
                    <View style={[styles.modalLiveBadge, styles.modalScheduledBadge]}>
                      <Ionicons name="calendar-outline" size={11} color="#fff" />
                      <Text style={styles.badgeText}>SCHEDULED</Text>
                    </View>
                  )}
                  {isLive(selected)      && <View style={styles.modalLiveBadge}><View style={styles.liveDot} /><Text style={styles.badgeText}>LIVE</Text></View>}
                  {isEnded(selected)     && <View style={[styles.modalLiveBadge, styles.typeBadgeEnded]}><Text style={styles.badgeText}>AUCTION ENDED</Text></View>}
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalTitle}>{selected?.title}</Text>
                  <Text style={styles.modalSeller}>{shopData?.full_name || 'My Shop'}</Text>

                  {isActuallyScheduled(selected) && selected?.start_time && (
                    <ModalScheduledRow startTime={selected.start_time} />
                  )}

                  {isLive(selected) && selected?.end_time && (
                    <ModalCountdown endTime={selected.end_time} />
                  )}

                  <View style={styles.modalStats}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>{selected?.selling_type === 'auction' ? 'Starting Bid' : 'Price'}</Text>
                      <Text style={styles.statValue}>₱{selected?.price?.toLocaleString()}</Text>
                    </View>
                    {selected?.selling_type === 'auction' && !isActuallyScheduled(selected) && (
                      <View style={[styles.statBox, styles.statHighlight]}>
                        <Text style={[styles.statLabel, { color: '#FF6B35' }]}>{isEnded(selected) ? 'Final Bid' : 'Current Bid'}</Text>
                        <Text style={[styles.statValue, { color: '#FF6B35' }]}>₱{(selected?.current_bid ?? selected?.price)?.toLocaleString()}</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity style={[styles.actionBtn, isEnded(selected) && { backgroundColor: '#6B7280' }]} onPress={() => { setSelected(null); router.push(`/products/${selected?.id}`); }}>
                    <Text style={styles.actionBtnText}>View Listing</Text>
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
  filterTab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  filterTabActive: { backgroundColor: '#111', borderColor: '#111' },
  filterLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#111' },
  filterLabelActive: { color: '#fff' },
  countBadge: { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  countBadgeActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  countText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#666' },
  countTextActive: { color: '#fff' },
  cell: { width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE, backgroundColor: '#F2F2F2', position: 'relative', overflow: 'hidden', marginBottom: 1.5 },
  cellScheduled: { borderWidth: 2, borderColor: '#111' },
  cellImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  scheduledOverlayTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.05)' },
  typeBadge: { position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(17,17,17,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 3 },
  typeBadgeLive: { backgroundColor: 'rgba(255,107,53,0.92)' },
  typeBadgeFlip: { backgroundColor: 'rgba(59,130,246,0.9)' },
  typeBadgeEnded: { backgroundColor: 'rgba(107,114,128,0.9)' },
  typeBadgeNoTimer: { backgroundColor: 'rgba(180,83,9,0.92)' },
  typeBadgeScheduled: { backgroundColor: 'rgba(17,17,17,0.9)' },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#fff' },
  badgeText: { fontFamily: 'Unbounded_700Bold', fontSize: 8, color: '#fff', letterSpacing: 0.5 },
  auctionTimerContainer: { position: 'absolute', bottom: 34, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', paddingVertical: 4, alignItems: 'center' },
  listTimerContainer: { bottom: 0, paddingVertical: 2 },
  auctionHeader: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 2 },
  auctionHeaderText: { fontFamily: 'Unbounded_700Bold', fontSize: 7, color: '#fff', opacity: 0.8 },
  digitContainer: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  digitBox: { backgroundColor: '#333', borderRadius: 2, paddingHorizontal: 3, paddingVertical: 1, minWidth: 16, alignItems: 'center' },
  digitText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#fff' },
  separator: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold' },
  scheduledBar: { position: 'absolute', bottom: 34, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4, backgroundColor: 'rgba(17,17,17,0.88)' },
  scheduledBarText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#fff' },
  cellOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 6, paddingVertical: 5 },
  cellPrice: { fontFamily: 'Unbounded_700Bold', fontSize: 11, color: '#fff' },
  cellMeta: { fontFamily: 'Inter_400Regular', fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  adminOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15 },
  adminBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
  adminBtnDelete: { backgroundColor: '#EF4444' },
  adminClose: { position: 'absolute', top: 5, right: 5 },
  
  // NEW LIST ROW STYLES (TABLE STYLE)
  listItemRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#fff', 
    paddingVertical: 10, 
    paddingHorizontal: 4,
    borderBottomWidth: 1, 
    borderBottomColor: '#F2F2F2' 
  },
  listImageContainerSmall: { width: 50, height: 50, borderRadius: 6, overflow: 'hidden', backgroundColor: '#F9F9F9' },
  listImage: { width: '100%', height: '100%' },
  listContentRow: { 
    flex: 1, 
    flexDirection: 'row', 
    marginLeft: 12, 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  listMainInfo: { flex: 1, justifyContent: 'center' },
  listTitleRow: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#111', marginBottom: 2 },
  listMetaRow: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#999' },
  listPriceInfo: { alignItems: 'flex-end', justifyContent: 'center', minWidth: 80 },
  listPriceRow: { fontFamily: 'Unbounded_700Bold', fontSize: 12, color: '#111', marginBottom: 4 },
  
  // ADMIN OVERLAY FOR TABLE ROW
  adminOverlayListRow: { 
    position: 'absolute', 
    right: 0, 
    top: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    paddingLeft: 15, 
    paddingRight: 5 
  },
  adminBtnSmall: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
  adminCloseSmall: { padding: 4, marginLeft: 4 },

  typeBadgeSmall: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#F2F2F2' },
  badgeTextSmall: { fontFamily: 'Unbounded_700Bold', fontSize: 7, color: '#111' },
  emptyFlex: { flex: 1 },
  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { textAlign: 'center', color: '#999', fontFamily: 'Inter_400Regular', fontSize: 14 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  modalImageWrap: { width: '100%', height: height * 0.38, position: 'relative' },
  modalImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  closeBtn: { position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  modalLiveBadge: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,107,53,0.92)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, gap: 4 },
  modalScheduledBadge: { backgroundColor: 'rgba(17,17,17,0.92)' },
  modalBody: { padding: 20, paddingBottom: 32 },
  modalTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 15, color: '#111', marginBottom: 4 },
  modalSeller: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#888', marginBottom: 12 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F7F7F7', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  countdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  countdownLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#111' },
  countdownValue: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111' },
  scheduledModalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F7F7F7', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  startsInSub: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#666', marginTop: 2 },
  modalStats: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox: { flex: 1, backgroundColor: '#F7F7F7', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  statHighlight: { backgroundColor: '#FFF4EF' },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#888', marginBottom: 3 },
  statValue: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111' },
  actionBtn: { backgroundColor: '#111', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  actionBtnText: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#fff', letterSpacing: 0.3 },
});