import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function QuantityProductModal({ visible, item, onClose }: any) {
  if (!item) return null;

  const isAuction = item.selling_type === 'auction';

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PRODUCT DETAILS</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.mainContent}>
          {item.image_url && (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: item.image_url }} style={styles.heroImage} />
            </View>
          )}

          <View style={styles.detailsPane}>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>{isAuction ? 'CURRENT BID' : 'PRICE'}</Text>
                <Text style={styles.price}>₱{Number(item.price || 0).toLocaleString()}</Text>
              </View>
              <View style={[styles.statusBadge, { borderColor: item.displayStatus === 'ended' ? '#EF4444' : '#10B981' }]}>
                <Text style={[styles.statusText, { color: item.displayStatus === 'ended' ? '#EF4444' : '#10B981' }]}>
                  {item.displayStatus}
                </Text>
              </View>
            </View>

            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>TYPE</Text>
                <Text style={styles.metricValue}>{item.selling_type?.replace('_', ' ')}</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>STOCK</Text>
                <Text style={styles.metricValue}>{item.quantity || '1'}</Text>
              </View>
              {isAuction && item.target_bid && (
                <>
                  <View style={styles.verticalDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>TARGET</Text>
                    <Text style={[styles.metricValue, { color: '#3B82F6' }]}>₱{item.target_bid.toLocaleString()}</Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.descSection}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.description} numberOfLines={4}>
                {item.description || "No description provided."}
              </Text>
            </View>

            {isAuction && (
              <View style={styles.auctionFooter}>
                <View style={styles.startingBidRow}>
                  <Ionicons name="trending-up" size={14} color="#94A3B8" />
                  <Text style={styles.startingBidLabel}>Starting Bid:</Text>
                  <Text style={styles.startingBidValue}>₱{Number(item.starting_bid || item.price).toLocaleString()}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  closeButton: { width: 40, alignItems: 'flex-start' },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 11, letterSpacing: 1.5 },
  mainContent: { flex: 1 },
  imageWrapper: { width: '100%', height: '45%' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  detailsPane: { flex: 1, padding: 16 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12
  },
  priceLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#94A3B8', marginBottom: 2 },
  price: { fontFamily: 'Unbounded_700Bold', fontSize: 26, color: '#111' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 2, borderWidth: 1, marginBottom: 4 },
  statusText: { fontFamily: 'Unbounded_700Bold', fontSize: 8, textTransform: 'uppercase' },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#111', lineHeight: 24, marginBottom: 16 },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 16
  },
  metricItem: { flex: 1 },
  metricLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#94A3B8', marginBottom: 2 },
  metricValue: { fontFamily: 'Unbounded_700Bold', fontSize: 10, color: '#1E293B', textTransform: 'uppercase' },
  verticalDivider: { width: 1, height: 16, backgroundColor: '#E2E8F0', marginHorizontal: 8 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },
  descSection: { flex: 1 },
  sectionLabel: { fontFamily: 'Unbounded_700Bold', fontSize: 11, color: '#111', marginBottom: 8, textTransform: 'uppercase' },
  description: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#475569', lineHeight: 22 },
  auctionFooter: { paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  startingBidRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  startingBidLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#64748B' },
  startingBidValue: { fontFamily: 'Unbounded_700Bold', fontSize: 12, color: '#111' }
});