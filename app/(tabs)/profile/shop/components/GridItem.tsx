import { hasNoTimer, isActuallyScheduled, isEnded, isLive } from '@/hooks/useItemStatus';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuctionTimer from './AuctionTimer';
import ScheduledBar from './ScheduledBar';

const { width } = Dimensions.get('window');
const GUTTER = 16;
const COLUMN_COUNT = 3;
export const GRID_ITEM_SIZE = (width - (GUTTER * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

interface Props {
  item: any;
  selectionMode: boolean;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export default function GridItem({ item, selectionMode, isSelected, onPress, onLongPress }: Props) {
  const scheduled = isActuallyScheduled(item);
  const ended     = isEnded(item);
  const live      = isLive(item);
  const noTimer   = hasNoTimer(item);

  return (
    <TouchableOpacity
      style={[styles.cell, ended && { opacity: 0.55 }, isSelected && styles.cellSelected]}
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Image source={{ uri: item.image_url }} style={styles.image} />
      {selectionMode && (
        <View style={styles.selectionOverlay}>
          <View style={[styles.selectCircle, isSelected && styles.selectCircleActive]}>
            {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
          </View>
        </View>
      )}
      {scheduled && <View style={styles.scheduledTint} />}
      {scheduled ? (
        <View style={[styles.badge, styles.badgeScheduled]}>
          <Ionicons name="calendar-outline" size={9} color="#fff" />
          <Text style={styles.badgeText}>SCHED</Text>
        </View>
      ) : (item.selling_type !== 'posted' || ended) ? (
        <View style={[
          styles.badge,
          item.selling_type === 'fast_flip' && styles.badgeFlip,
          live   && styles.badgeLive,
          ended  && styles.badgeEnded,
          noTimer && styles.badgeNoTimer,
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
      <View style={styles.overlay}>
        <Text style={styles.price} numberOfLines={1}>₱{item.price?.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: { width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE, backgroundColor: '#F2F2F2', position: 'relative', overflow: 'hidden' },
  cellSelected: { opacity: 0.8 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  selectionOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)', padding: 8, alignItems: 'flex-end' },
  selectCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#fff', backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  selectCircleActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  scheduledTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.4)' },
  badge: { position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(17,17,17,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 3 },
  badgeLive: { backgroundColor: 'rgba(255,107,53,0.92)' },
  badgeFlip: { backgroundColor: 'rgba(59,130,246,0.9)' },
  badgeEnded: { backgroundColor: 'rgba(107,114,128,0.9)' },
  badgeNoTimer: { backgroundColor: 'rgba(180,83,9,0.92)' },
  badgeScheduled: { backgroundColor: 'rgba(17,17,17,0.9)' },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#fff' },
  badgeText: { fontFamily: 'Unbounded_700Bold', fontSize: 8, color: '#fff', letterSpacing: 0.5 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 6, paddingVertical: 5 },
  price: { fontFamily: 'Unbounded_700Bold', fontSize: 10, color: '#fff' },
});