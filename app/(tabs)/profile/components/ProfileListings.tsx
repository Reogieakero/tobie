import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

type Props = { type: 'bids' | 'won' };
type DisplayMode = 'list' | 'grid';

const { width, height } = Dimensions.get('window');
const GRID_ITEM = (width - 3) / 2; // 2-column grid for bids/won

const MOCK_BIDS = [
  { id: '1', title: 'Nike Air Jordan 1 Retro High OG',  yourBid: 240,  topBid: 310,  status: 'outbid',  endsIn: '2h',  image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
  { id: '2', title: 'Sony WH-1000XM5 Headphones',       yourBid: 180,  topBid: 180,  status: 'leading', endsIn: '5h',  image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop' },
  { id: '3', title: 'Vintage Polaroid OneStep Camera',   yourBid: 95,   topBid: 95,   status: 'leading', endsIn: '11h', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop' },
  { id: '4', title: 'Apple MacBook Pro 14" M3',          yourBid: 1200, topBid: 1450, status: 'outbid',  endsIn: '18h', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop' },
  { id: '5', title: "Levi's 501 Original 1980s",         yourBid: 75,   topBid: 75,   status: 'leading', endsIn: '1d',  image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&h=400&fit=crop' },
  { id: '6', title: 'Rolex Submariner Date',             yourBid: 550,  topBid: 620,  status: 'outbid',  endsIn: '1d',  image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' },
];

const MOCK_WON = [
  { id: '1', title: 'Adidas Yeezy Boost 350 V2',        finalPrice: 420,  date: 'Apr 26, 2026', status: 'awaiting_payment', image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop' },
  { id: '2', title: 'Fujifilm X100VI Camera',            finalPrice: 1100, date: 'Apr 25, 2026', status: 'awaiting_payment', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop' },
  { id: '3', title: 'Supreme Box Logo Hoodie FW23',      finalPrice: 285,  date: 'Apr 22, 2026', status: 'completed',        image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&h=400&fit=crop' },
  { id: '4', title: 'Dyson Airwrap Complete',            finalPrice: 390,  date: 'Apr 18, 2026', status: 'completed',        image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop' },
  { id: '5', title: 'LEGO Technic Bugatti Chiron',       finalPrice: 145,  date: 'Apr 10, 2026', status: 'completed',        image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop' },
  { id: '6', title: 'Bose QuietComfort Ultra Earbuds',   finalPrice: 210,  date: 'Apr 3, 2026',  status: 'completed',        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop' },
];

export default function ProfileListings({ type }: Props) {
  const [mode, setMode] = useState<DisplayMode>('list');
  const [selectedBid, setSelectedBid] = useState<typeof MOCK_BIDS[0] | null>(null);
  const [selectedWon, setSelectedWon] = useState<typeof MOCK_WON[0] | null>(null);

  const data = type === 'bids' ? MOCK_BIDS : MOCK_WON;

  return (
    <>
      {/* Display mode toggle */}
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

      {/* List mode */}
      {mode === 'list' && (
        <View style={styles.container}>
          {type === 'bids'
            ? MOCK_BIDS.map((item) => {
                const isLeading = item.status === 'leading';
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.row}
                    activeOpacity={0.75}
                    onPress={() => setSelectedBid(item)}
                  >
                    <Image source={{ uri: item.image }} style={styles.thumb} />
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.rowMeta}>Your bid: <Text style={styles.bold}>${item.yourBid}</Text></Text>
                      <Text style={styles.rowMeta}>Top bid: <Text style={styles.bold}>${item.topBid}</Text></Text>
                    </View>
                    <View style={styles.rowRight}>
                      <View style={[styles.statusBadge, isLeading ? styles.leading : styles.outbid]}>
                        <Text style={styles.statusText}>{isLeading ? '🟢 Leading' : '🔴 Outbid'}</Text>
                      </View>
                      <Text style={styles.endsIn}>Ends {item.endsIn}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            : MOCK_WON.map((item) => {
                const isPending = item.status === 'awaiting_payment';
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.row}
                    activeOpacity={0.75}
                    onPress={() => setSelectedWon(item)}
                  >
                    <Image source={{ uri: item.image }} style={styles.thumb} />
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.rowMeta}>Final: <Text style={styles.bold}>${item.finalPrice}</Text></Text>
                      <Text style={styles.rowMeta}>{item.date}</Text>
                    </View>
                    <View style={styles.rowRight}>
                      {isPending ? (
                        <View style={styles.payBtn}>
                          <Text style={styles.payBtnText}>Pay Now</Text>
                        </View>
                      ) : (
                        <View style={styles.completedBadge}>
                          <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                          <Text style={styles.completedText}>Done</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
        </View>
      )}

      {/* Grid mode */}
      {mode === 'grid' && (
        <View style={styles.grid}>
          {type === 'bids'
            ? MOCK_BIDS.map((item) => {
                const isLeading = item.status === 'leading';
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.gridCell}
                    activeOpacity={0.85}
                    onPress={() => setSelectedBid(item)}
                  >
                    <Image source={{ uri: item.image }} style={styles.gridImage} />
                    <View style={[styles.gridBadge, isLeading ? styles.leading : styles.outbid]}>
                      <Text style={styles.statusText}>{isLeading ? '🟢' : '🔴'}</Text>
                    </View>
                    <View style={styles.gridOverlay}>
                      <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.gridMeta}>${item.yourBid} · {item.endsIn}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            : MOCK_WON.map((item) => {
                const isPending = item.status === 'awaiting_payment';
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.gridCell}
                    activeOpacity={0.85}
                    onPress={() => setSelectedWon(item)}
                  >
                    <Image source={{ uri: item.image }} style={styles.gridImage} />
                    {isPending && (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>Pay</Text>
                      </View>
                    )}
                    <View style={styles.gridOverlay}>
                      <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.gridMeta}>${item.finalPrice} · {item.date}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
        </View>
      )}

      {/* Bid detail modal */}
      <Modal visible={!!selectedBid} transparent animationType="fade" statusBarTranslucent>
        <TouchableWithoutFeedback onPress={() => setSelectedBid(null)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.modalImageWrap}>
                  <Image source={{ uri: selectedBid?.image }} style={styles.modalImage} />
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedBid(null)}>
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                  <View style={[styles.modalStatusBadge, selectedBid?.status === 'leading' ? styles.leading : styles.outbid]}>
                    <Text style={styles.statusText}>{selectedBid?.status === 'leading' ? '🟢 Leading' : '🔴 Outbid'}</Text>
                  </View>
                </View>
                <View style={styles.modalBody}>
                  <Text style={styles.modalTitle}>{selectedBid?.title}</Text>
                  <View style={styles.modalStats}>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxLabel}>Your Bid</Text>
                      <Text style={styles.statBoxValue}>${selectedBid?.yourBid}</Text>
                    </View>
                    <View style={[styles.statBox, styles.statBoxHighlight]}>
                      <Text style={[styles.statBoxLabel, { color: '#FF6B35' }]}>Top Bid</Text>
                      <Text style={[styles.statBoxValue, { color: '#FF6B35' }]}>${selectedBid?.topBid}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxLabel}>Ends In</Text>
                      <Text style={styles.statBoxValue}>{selectedBid?.endsIn}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>Raise Bid</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Won detail modal */}
      <Modal visible={!!selectedWon} transparent animationType="fade" statusBarTranslucent>
        <TouchableWithoutFeedback onPress={() => setSelectedWon(null)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.modalImageWrap}>
                  <Image source={{ uri: selectedWon?.image }} style={styles.modalImage} />
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedWon(null)}>
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                  <View style={styles.wonBadge}>
                    <Ionicons name="trophy" size={12} color="#fff" />
                    <Text style={styles.wonBadgeText}>Won</Text>
                  </View>
                </View>
                <View style={styles.modalBody}>
                  <Text style={styles.modalTitle}>{selectedWon?.title}</Text>
                  <View style={styles.modalStats}>
                    <View style={[styles.statBox, styles.statBoxHighlight]}>
                      <Text style={[styles.statBoxLabel, { color: '#FF6B35' }]}>Final Price</Text>
                      <Text style={[styles.statBoxValue, { color: '#FF6B35' }]}>${selectedWon?.finalPrice}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxLabel}>Date</Text>
                      <Text style={styles.statBoxValue} numberOfLines={1}>{selectedWon?.date}</Text>
                    </View>
                  </View>
                  {selectedWon?.status === 'awaiting_payment' ? (
                    <TouchableOpacity style={styles.actionBtn}>
                      <Text style={styles.actionBtnText}>Pay Now</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.completedRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                      <Text style={styles.completedLabel}>Order completed</Text>
                    </View>
                  )}
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
  toggleBtn: {
    padding: 7,
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: '#F2F2F2',
  },

  // List
  container: { flex: 1, backgroundColor: '#fff' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
    flexShrink: 0,
  },
  rowInfo: { flex: 1, gap: 3 },
  rowTitle: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#111' },
  rowMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#777' },
  bold: { fontFamily: 'Inter_500Medium', color: '#333' },
  rowRight: { alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  leading: { backgroundColor: '#F0FDF4' },
  outbid: { backgroundColor: '#FFF1F1' },
  statusText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  endsIn: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#999' },
  payBtn: { backgroundColor: '#FF6B35', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  payBtnText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#fff' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  completedText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#22C55E' },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 1.5 },
  gridCell: {
    width: GRID_ITEM,
    height: GRID_ITEM,
    backgroundColor: '#F2F2F2',
    position: 'relative',
    overflow: 'hidden',
  },
  gridImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  gridBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingText: { fontFamily: 'Unbounded_700Bold', fontSize: 9, color: '#fff' },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.48)',
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  gridTitle: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#fff' },
  gridMeta: { fontFamily: 'Inter_400Regular', fontSize: 9, color: 'rgba(255,255,255,0.75)', marginTop: 1 },

  // Modal shared
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  modalImageWrap: { width: '100%', height: height * 0.36, position: 'relative' },
  modalImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  closeBtn: {
    position: 'absolute', top: 14, right: 14,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalStatusBadge: {
    position: 'absolute', top: 14, left: 14,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
  },
  wonBadge: {
    position: 'absolute', top: 14, left: 14,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
  },
  wonBadgeText: { fontFamily: 'Unbounded_700Bold', fontSize: 9, color: '#fff' },
  modalBody: { padding: 20, paddingBottom: 32 },
  modalTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 14, color: '#111', marginBottom: 16 },
  modalStats: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#F7F7F7', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  statBoxHighlight: { backgroundColor: '#FFF4EF' },
  statBoxLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#888', marginBottom: 3 },
  statBoxValue: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111' },
  actionBtn: { backgroundColor: '#111', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  actionBtnText: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#fff', letterSpacing: 0.3 },
  completedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  completedLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#22C55E' },
});