import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PendingStateProps {
  shopData: any;
}

const DetailRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={16} color="#888" />
    <View style={styles.detailText}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

export const PendingState = ({ shopData }: PendingStateProps) => {
  return (
    <View style={styles.content}>
      <View style={styles.pendingIconCircle}>
        <Ionicons name="time-outline" size={40} color="#888" />
      </View>
      <Text style={styles.title}>Application Sent</Text>
      <Text style={styles.description}>
        Your shop application is currently under review. We'll notify you once our team has verified your details.
      </Text>

      <View style={styles.pendingBadge}>
        <View style={styles.pendingDot} />
        <Text style={styles.pendingText}>WAITING FOR APPROVAL</Text>
      </View>

      {shopData && (
        <View style={styles.detailCard}>
          <DetailRow icon="storefront-outline" label="Shop Name" value={shopData.shop_name} />
          <DetailRow icon="pricetag-outline" label="Category" value={shopData.category} />
          <DetailRow icon="location-outline" label="City" value={shopData.city} />
        </View>
      )}
    </View>
  );
};

export default PendingState;

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  pendingIconCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontFamily: 'Unbounded_700Bold', fontSize: 20, color: '#111', textAlign: 'center', marginBottom: 12 },
  description: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F8F8F8', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, borderWidth: 1, borderColor: '#EBEBEB', marginBottom: 24 },
  pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' },
  pendingText: { fontFamily: 'Unbounded_700Bold', fontSize: 11, color: '#888', letterSpacing: 0.8 },
  detailCard: { width: '100%', backgroundColor: '#FAFAFA', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', padding: 16, gap: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailText: { flex: 1 },
  detailLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#AAA' },
  detailValue: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#111', marginTop: 1 },
});