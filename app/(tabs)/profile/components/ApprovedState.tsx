import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ApprovedStateProps {
  shopData: any;
}

export const ApprovedState = ({ shopData }: ApprovedStateProps) => {
  return (
    <ScrollView contentContainerStyle={styles.dashboardContent}>
      <View style={styles.shopHeader}>
        <View style={styles.shopIcon}>
          <Ionicons name="storefront" size={30} color="#fff" />
        </View>
        <Text style={styles.shopName}>{shopData?.shop_name}</Text>
        <Text style={styles.shopCategory}>{shopData?.category}</Text>
        <View style={styles.approvedBadge}>
          <Ionicons name="checkmark-circle" size={13} color="#22C55E" />
          <Text style={styles.approvedText}>Verified Seller</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>0</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>0</Text>
          <Text style={styles.statLabel}>Sold</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>₱0</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.mainActionBtn} activeOpacity={0.85}>
        <Ionicons name="add-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.mainActionText}>LIST NEW ITEM</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ApprovedState;

const styles = StyleSheet.create({
  dashboardContent: { padding: 20, alignItems: 'center' },
  shopHeader: { alignItems: 'center', marginVertical: 28 },
  shopIcon: { width: 68, height: 68, borderRadius: 18, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  shopName: { fontFamily: 'Unbounded_700Bold', fontSize: 18, color: '#111', marginBottom: 4 },
  shopCategory: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#888', marginBottom: 10 },
  approvedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  approvedText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#22C55E' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 28, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#F8F8F8', padding: 16, borderRadius: 14, alignItems: 'center' },
  statNum: { fontFamily: 'Unbounded_700Bold', fontSize: 16, color: '#111' },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#888', textTransform: 'uppercase', marginTop: 4, letterSpacing: 0.5 },
  mainActionBtn: { backgroundColor: '#111', width: '100%', padding: 18, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  mainActionText: { color: '#fff', fontFamily: 'Unbounded_700Bold', fontSize: 12, letterSpacing: 1 },
});