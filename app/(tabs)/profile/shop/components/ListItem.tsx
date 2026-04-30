import { isActuallyScheduled, isEnded, isLive } from '@/hooks/useItemStatus';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuctionTimer from './AuctionTimer';

interface Props {
  item: any;
  selectionMode: boolean;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export default function ListItem({ item, selectionMode, isSelected, onPress, onLongPress }: Props) {
  const scheduled = isActuallyScheduled(item);
  const ended     = isEnded(item);
  const live      = isLive(item);

  return (
    <TouchableOpacity
      style={[styles.row, ended && { opacity: 0.6 }, isSelected && styles.rowSelected]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image_url }} style={styles.image} />
        {live && <AuctionTimer endTime={item.end_time} isList />}
      </View>
      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.meta}>
            {item.selling_type === 'auction' ? `${item.bids_count ?? 0} bids` : `Qty: ${item.quantity ?? 1}`}
          </Text>
        </View>
        <View style={styles.priceInfo}>
          <Text style={styles.price}>₱{item.price?.toLocaleString()}</Text>
          {selectionMode ? (
            <View style={[styles.selectCircle, isSelected && styles.selectCircleActive]}>
              {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
          ) : (
            <View style={[
              styles.typeBadge,
              live && styles.badgeLive,
              scheduled && styles.badgeScheduled,
              ended && styles.badgeEnded,
            ]}>
              <Text style={[styles.badgeText, (live || scheduled || ended) && { color: '#fff' }]}>
                {live ? 'LIVE' : scheduled ? 'SCHED' : ended ? 'ENDED' : item.selling_type.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#F2F2F2' },
  rowSelected: { backgroundColor: '#F9FAFB' },
  imageContainer: { width: 50, height: 50, borderRadius: 8, overflow: 'hidden', backgroundColor: '#F9F9F9' },
  image: { width: '100%', height: '100%' },
  content: { flex: 1, flexDirection: 'row', marginLeft: 12, alignItems: 'center', justifyContent: 'space-between' },
  mainInfo: { flex: 1, justifyContent: 'center' },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#111', marginBottom: 2 },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#999' },
  priceInfo: { alignItems: 'flex-end', justifyContent: 'center', minWidth: 80, gap: 4 },
  price: { fontFamily: 'Unbounded_700Bold', fontSize: 12, color: '#111' },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#F2F2F2' },
  badgeText: { fontFamily: 'Unbounded_700Bold', fontSize: 7, color: '#111' },
  badgeLive: { backgroundColor: 'rgba(255,107,53,0.92)' },
  badgeScheduled: { backgroundColor: 'rgba(17,17,17,0.9)' },
  badgeEnded: { backgroundColor: 'rgba(107,114,128,0.9)' },
  selectCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#ccc', backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  selectCircleActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
});