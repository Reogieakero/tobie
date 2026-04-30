import { useProfileListings } from '@/hooks/useProfileListings';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

type Props = { type: 'bids' | 'won' };
type DisplayMode = 'list' | 'grid';

const { width, height } = Dimensions.get('window');
const GRID_ITEM = (width - 3) / 2;

export default function ProfileListings({ type }: Props) {
  const [mode, setMode] = useState<DisplayMode>('list');
  const [selected, setSelected] = useState<any | null>(null);
  const { items, loading } = useProfileListings(type);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#FF6B35" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.toggleBar}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'list' && styles.toggleActive]}
          onPress={() => setMode('list')}
        >
          <Ionicons name="list-outline" size={18} color={mode === 'list' ? '#111' : '#AAA'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'grid' && styles.toggleActive]}
          onPress={() => setMode('grid')}
        >
          <Ionicons name="grid-outline" size={18} color={mode === 'grid' ? '#111' : '#AAA'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={mode === 'grid' ? styles.grid : styles.listContainer}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={mode === 'list' ? styles.row : styles.gridCell}
              activeOpacity={0.8}
              onPress={() => setSelected(item)}
            >
              <Image 
                source={{ uri: item.image_url }} 
                style={mode === 'list' ? styles.thumb : styles.gridImage} 
              />
              
              {mode === 'list' ? (
                <>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.rowMeta}>
                      {item.selling_type === 'auction' ? 'Starting Price: ' : 'Price: '}
                      <Text style={styles.bold}>₱{item.price}</Text>
                    </Text>
                  </View>
                  <View style={styles.rowRight}>
                    <View style={[styles.statusBadge, item.status === 'active' ? styles.leading : styles.outbid]}>
                      <Text style={styles.statusText}>
                        {item.status === 'active' ? '🟢 Active' : '⚪ Ended'}
                      </Text>
                    </View>
                    {item.selling_type === 'auction' && (
                      <Text style={styles.typeTag}>Auction</Text>
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.gridOverlay}>
                  <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.gridMeta}>₱{item.price}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
                </View>
                <View style={styles.modalBody}>
                  <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalTitle}>{selected?.title}</Text>
                    {selected?.selling_type === 'auction' && (
                       <View style={styles.auctionLabel}><Text style={styles.auctionLabelText}>AUCTION</Text></View>
                    )}
                  </View>
                  
                  <Text style={styles.modalDesc}>{selected?.description}</Text>
                  
                  <View style={styles.priceContainer}>
                    <View>
                      <Text style={styles.priceLabel}>
                        {selected?.selling_type === 'auction' ? 'Starting Bid' : 'Fixed Price'}
                      </Text>
                      <Text style={styles.priceValue}>₱{selected?.price}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>
                      {selected?.selling_type === 'auction' ? 'Go to Auction' : 'View Details'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { padding: 40, alignItems: 'center' },
  toggleBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  toggleBtn: { padding: 7, borderRadius: 8 },
  toggleActive: { backgroundColor: '#F2F2F2' },
  listContainer: { flex: 1, backgroundColor: '#fff' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  thumb: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#F2F2F2' },
  rowInfo: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 13, fontWeight: '600', color: '#111' },
  rowMeta: { fontSize: 11, color: '#777' },
  bold: { fontWeight: '600', color: '#333' },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  leading: { backgroundColor: '#F0FDF4' },
  outbid: { backgroundColor: '#F2F2F2' },
  statusText: { fontSize: 10, fontWeight: '600' },
  typeTag: { fontSize: 9, color: '#AAA', textTransform: 'uppercase', letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 1.5 },
  gridCell: { width: GRID_ITEM, height: GRID_ITEM, backgroundColor: '#F2F2F2', position: 'relative' },
  gridImage: { width: '100%', height: '100%' },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  gridTitle: { fontSize: 11, fontWeight: '500', color: '#fff' },
  gridMeta: { fontSize: 10, color: '#FF6B35', fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  modalImageWrap: { width: '100%', height: height * 0.35, position: 'relative' },
  modalImage: { width: '100%', height: '100%' },
  closeBtn: {
    position: 'absolute', top: 14, right: 14,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBody: { padding: 20, paddingBottom: 34 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  auctionLabel: { backgroundColor: '#FFF0EA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  auctionLabelText: { fontSize: 10, fontWeight: '800', color: '#FF6B35' },
  modalDesc: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 20 },
  priceContainer: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 12, marginBottom: 20 },
  priceLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  priceValue: { fontSize: 16, fontWeight: '700', color: '#111' },
  actionBtn: { backgroundColor: '#111', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});