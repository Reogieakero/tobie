import { useProfileGrid } from '@/hooks/useProfileGrid';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = (width - 3) / 3;

export default function ProfileGrid() {
  const { items, loading, selected, setSelected } = useProfileGrid();

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.grid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.cell}
            activeOpacity={0.85}
            onPress={() => setSelected(item)}
          >
            <Image source={{ uri: item.image_url }} style={styles.image} />
            {item.status === 'active' && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            <View style={styles.overlay}>
              <Text style={styles.bidAmount}>${item.price}</Text>
              <Text style={styles.bidMeta}>
                {item.selling_type === 'auction' ? 'Bids' : 'Fixed'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

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
                  {selected?.status === 'active' && (
                    <View style={styles.modalLiveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalTitle}>{selected?.title}</Text>
                  <Text style={styles.modalDescription}>{selected?.description}</Text>
                  <View style={styles.modalStats}>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxLabel}>Starting</Text>
                      <Text style={styles.statBoxValue}>${selected?.price}</Text>
                    </View>
                    <View style={[styles.statBox, styles.statBoxHighlight]}>
                      <Text style={[styles.statBoxLabel, { color: '#FF6B35' }]}>Target</Text>
                      <Text style={[styles.statBoxValue, { color: '#FF6B35' }]}>
                        {selected?.target_bid ? `$${selected.target_bid}` : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxLabel}>Qty</Text>
                      <Text style={styles.statBoxValue}>{selected?.quantity}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.bidBtn} activeOpacity={0.85}>
                    <Text style={styles.bidBtnText}>View Listing</Text>
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
  loaderContainer: { padding: 50, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 1.5 },
  cell: { width: ITEM_SIZE, height: ITEM_SIZE, backgroundColor: '#F2F2F2', position: 'relative', overflow: 'hidden' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  liveBadge: { position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,107,53,0.92)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 3 },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#fff' },
  liveText: { fontSize: 8, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 6, paddingVertical: 5 },
  bidAmount: { fontSize: 11, fontWeight: '700', color: '#fff' },
  bidMeta: { fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  modalImageWrap: { width: '100%', height: height * 0.38, position: 'relative' },
  modalImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  closeBtn: { position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  modalLiveBadge: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,107,53,0.92)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, gap: 4 },
  modalBody: { padding: 20, paddingBottom: 32 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 4 },
  modalDescription: { fontSize: 13, color: '#666', marginBottom: 16 },
  modalStats: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statBox: { flex: 1, backgroundColor: '#F7F7F7', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  statBoxHighlight: { backgroundColor: '#FFF4EF' },
  statBoxLabel: { fontSize: 10, color: '#888', marginBottom: 3 },
  statBoxValue: { fontSize: 13, fontWeight: '700', color: '#111' },
  bidBtn: { backgroundColor: '#111', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  bidBtnText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
});