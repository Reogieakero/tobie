import { isActuallyScheduled, isEnded, isLive } from '@/hooks/useItemStatus';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import ModalCountdown from './ModalCountdown';
import ModalScheduledRow from './ModalScheduledRow';

const { height } = Dimensions.get('window');

interface Props {
  item: any | null;
  shopData: any;
  onClose: () => void;
}

export default function ProductModal({ item, shopData, onClose }: Props) {
  const router = useRouter();
  const scheduled = isActuallyScheduled(item);
  const live      = isLive(item);
  const ended     = isEnded(item);

  return (
    <Modal visible={!!item} transparent animationType="fade" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.imageWrap}>
                <Image source={{ uri: item?.image_url }} style={styles.image} />
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
                {scheduled && (
                  <View style={[styles.liveBadge, styles.scheduledBadge]}>
                    <Ionicons name="calendar-outline" size={11} color="#fff" />
                    <Text style={styles.badgeText}>SCHEDULED</Text>
                  </View>
                )}
                {live  && <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.badgeText}>LIVE</Text></View>}
                {ended && <View style={[styles.liveBadge, styles.endedBadge]}><Text style={styles.badgeText}>AUCTION ENDED</Text></View>}
              </View>
              <View style={styles.body}>
                <View style={styles.headerRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{item?.title}</Text>
                    <Text style={styles.seller}>{shopData?.full_name || 'My Shop'}</Text>
                  </View>
                  {item?.selling_type === 'auction' && (
                    <View style={[styles.bidderBadge, (!item?.bids_count || item.bids_count === 0) && styles.noBidderBadge]}>
                      <Ionicons
                        name={(!item?.bids_count || item.bids_count === 0) ? 'people-outline' : 'people'}
                        size={12}
                        color={(!item?.bids_count || item.bids_count === 0) ? '#6B7280' : '#111'}
                      />
                      <Text style={[styles.bidderText, (!item?.bids_count || item.bids_count === 0) && styles.noBidderText]}>
                        {(!item?.bids_count || item.bids_count === 0) ? 'No bidders' : `${item.bids_count} Bidders`}
                      </Text>
                    </View>
                  )}
                </View>
                {scheduled && item?.start_time && <ModalScheduledRow startTime={item.start_time} />}
                {live && item?.end_time && <ModalCountdown endTime={item.end_time} />}
                <View style={styles.stats}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>{item?.selling_type === 'auction' ? 'Starting Bid' : 'Price'}</Text>
                    <Text style={styles.statValue}>₱{item?.price?.toLocaleString()}</Text>
                  </View>
                  {item?.selling_type === 'auction' && !scheduled && (
                    <View style={[styles.statBox, styles.statHighlight]}>
                      <Text style={[styles.statLabel, { color: '#FF6B35' }]}>{ended ? 'Final Bid' : 'Current Bid'}</Text>
                      <Text style={[styles.statValue, { color: '#FF6B35' }]}>₱{(item?.current_bid ?? item?.price)?.toLocaleString()}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.actions}>
                  {(live || ended) && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { flex: 1, backgroundColor: '#F3F4F6' }]}
                      onPress={() => { onClose(); router.push(`/products/${item.id}/bidders`); }}
                    >
                      <Text style={[styles.actionBtnText, { color: '#111' }]}>View Bidders</Text>
                    </TouchableOpacity>
                  )}
                  {!ended && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { flex: 1, backgroundColor: '#111' }]}
                      onPress={() => { onClose(); router.push({ pathname: '/(tabs)/profile/shop/addItem', params: { id: item.id } }); }}
                    >
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  imageWrap: { width: '100%', height: height * 0.38, position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  closeBtn: { position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  liveBadge: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,107,53,0.92)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, gap: 4 },
  scheduledBadge: { backgroundColor: 'rgba(17,17,17,0.92)' },
  endedBadge: { backgroundColor: 'rgba(107,114,128,0.9)' },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#fff' },
  badgeText: { fontFamily: 'Unbounded_700Bold', fontSize: 8, color: '#fff', letterSpacing: 0.5 },
  body: { padding: 20, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 10 },
  title: { fontFamily: 'Unbounded_700Bold', fontSize: 15, color: '#111', marginBottom: 2 },
  seller: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#888' },
  bidderBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  noBidderBadge: { backgroundColor: '#F9FAFB', borderColor: '#F3F4F6' },
  bidderText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#111' },
  noBidderText: { color: '#6B7280', fontFamily: 'Inter_500Medium' },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox: { flex: 1, backgroundColor: '#F7F7F7', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  statHighlight: { backgroundColor: '#FFF4EF' },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#888', marginBottom: 3 },
  statValue: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111' },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { backgroundColor: '#111', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  actionBtnText: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#fff', letterSpacing: 0.3 },
});