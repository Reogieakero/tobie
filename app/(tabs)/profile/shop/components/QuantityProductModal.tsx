import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function QuantityProductModal({ visible, item, onClose }: any) {
  if (!item) return null;

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

        <ScrollView showsVerticalScrollIndicator={false}>
          {item.image_url && <Image source={{ uri: item.image_url }} style={styles.heroImage} />}
          
          <View style={styles.content}>
            {/* TikTok Style: Price first, then Title */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₱{Number(item.price || 0).toLocaleString()}</Text>
              <View style={styles.statusBadge}>
                 <Text style={[styles.statusText, { color: item.displayStatus === 'ended' ? '#EF4444' : '#10B981' }]}>
                   ● {item.displayStatus}
                 </Text>
              </View>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.selling_type?.replace('_', ' ')}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Stock: {item.quantity || '1'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>{item.description || "No description provided."}</Text>
            
            {item.target_bid && (
               <View style={styles.targetBidContainer}>
                 <Text style={styles.targetBidLabel}>Target Bid</Text>
                 <Text style={styles.targetBidValue}>₱{item.target_bid.toLocaleString()}</Text>
               </View>
            )}
          </View>
        </ScrollView>
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
    paddingHorizontal: 16, // 16px Gutter
    height: 56,
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  closeButton: { width: 40, alignItems: 'flex-start' },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 11, letterSpacing: 1 },
  heroImage: { width: '100%', height: 400, resizeMode: 'cover' },
  
  content: { 
    padding: 16, // Consistent 16px Gutter
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  price: { 
    fontFamily: 'Unbounded_700Bold', 
    fontSize: 24, 
    color: '#111' 
  },
  statusBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    textTransform: 'uppercase'
  },
  title: { 
    fontFamily: 'Inter_600SemiBold', 
    fontSize: 16, 
    color: '#111',
    lineHeight: 22,
    marginBottom: 12
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4
  },
  tagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#475569',
    textTransform: 'uppercase'
  },
  divider: { 
    height: 1, 
    backgroundColor: '#F1F5F9', 
    marginVertical: 16 
  },
  sectionLabel: { 
    fontFamily: 'Inter_700Bold', 
    fontSize: 14, 
    color: '#1E293B', 
    marginBottom: 8 
  },
  description: { 
    fontFamily: 'Inter_400Regular', 
    fontSize: 15, 
    color: '#475569', 
    lineHeight: 24 
  },
  targetBidContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  targetBidLabel: {
    color: '#94A3B8',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12
  },
  targetBidValue: {
    color: '#FFF',
    fontFamily: 'Unbounded_700Bold',
    fontSize: 16
  }
});