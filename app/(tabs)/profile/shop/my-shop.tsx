import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MyShopProps {
  shopData: any;
}

export const MyShop = ({ shopData }: MyShopProps) => {
  const [showRevenue, setShowRevenue] = useState(true);
  const [isListPressed, setIsListPressed] = useState(false);

  const liveAuctions = [
    { id: '1', title: 'Vintage Rolex', bid: '₱45,000', time: '2m 45s' },
    { id: '2', title: 'Jordan 1 Retro', bid: '₱12,200', time: '14m 10s' },
    { id: '3', title: 'Sony A7III Body', bid: '₱68,000', time: '1h 05m' },
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerSection}>
        <View style={styles.shopIconContainer}>
          <LinearGradient colors={['#22C55E', '#16a34a']} style={styles.shopIcon}>
            <Ionicons name="storefront" size={26} color="#fff" />
          </LinearGradient>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={10} color="#fff" />
          </View>
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.shopName} numberOfLines={1}>{shopData?.shop_name || "Premium Store"}</Text>
          <Text style={styles.shopCategory}>{shopData?.category || "General Merchant"}</Text>
          <TouchableOpacity style={styles.linkContainer}>
            <Ionicons name="link-outline" size={13} color="#22C55E" />
            <Text style={styles.shopLink} numberOfLines={1}>{shopData?.custom_link || "shop.link/pro"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <LinearGradient
        colors={['#111', '#333']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.revenueCard}
      >
        <View style={{ flex: 1.5 }}>
          <View style={styles.revenueHeaderRow}>
            <Text style={styles.revenueLabel}>Total Revenue</Text>
            <TouchableOpacity onPress={() => setShowRevenue(!showRevenue)} hitSlop={10}>
              <Ionicons name={showRevenue ? "eye-outline" : "eye-off-outline"} size={16} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>
          <Text style={styles.revenueAmount}>{showRevenue ? "₱124,500.00" : "••••••••"}</Text>
        </View>
        <View style={styles.logoInfoContainer}>
          <Image source={require('../../../../assets/images/wolf-logo-no-bg.png')} style={styles.wolfLogo} />
          <Text style={styles.logoSubText}>This is your revenue</Text>
        </View>
      </LinearGradient>

      <View style={styles.proStatsGrid}>
        {[
          { label: 'Auction List', value: '08', icon: 'hammer-outline' },
          { label: 'Active', value: '12', icon: 'flash-outline' },
          { label: 'Sold', value: '84', icon: 'checkmark-circle-outline' },
        ].map((stat, i) => (
          <View key={i} style={[styles.proStatItem, i !== 0 && styles.statDivider]}>
            <View style={styles.proStatHeader}>
              <Ionicons name={stat.icon as any} size={14} color="#111" />
              <Text style={styles.proStatValue}>{stat.value}</Text>
            </View>
            <Text style={styles.proStatLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Live Bidding</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.auctionList}>
        {liveAuctions.map((item) => (
          <TouchableOpacity key={item.id} style={styles.auctionCard}>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.auctionTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.currentBidLabel}>Current Bid</Text>
            <Text style={styles.bidValue}>{item.bid}</Text>
            <View style={styles.timerRow}>
              <Ionicons name="time-outline" size={10} color="#EF4444" />
              <Text style={styles.timerText}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.analyticsBar}>
        <Text style={styles.analyticsText}>Track your shop's growth over time.</Text>
        <TouchableOpacity style={styles.analyticsButton}>
          <Text style={styles.analyticsButtonText}>Visual Analytics</Text>
          <Ionicons name="bar-chart" size={14} color="#111" />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Management</Text>
      </View>

      <View style={styles.actionGrid}>
        <TouchableOpacity 
          onPressIn={() => setIsListPressed(true)}
          onPressOut={() => setIsListPressed(false)}
          style={[styles.actionCard, isListPressed && { backgroundColor: '#111' }]}
        >
          <Ionicons name="add-circle" size={22} color={isListPressed ? "#fff" : "#111"} />
          <Text style={[styles.actionText, isListPressed && { color: '#fff' }]}>List Item</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="cube-outline" size={22} color="#111" />
          <Text style={styles.actionText}>Inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="megaphone-outline" size={22} color="#111" />
          <Text style={styles.actionText}>Promote</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="settings-outline" size={22} color="#111" />
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  dashboardContent: { padding: 16 },
  headerSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: -16 },
  shopIconContainer: { position: 'relative', marginRight: 8 },
  shopIcon: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  verifiedBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#3B82F6', borderRadius: 10, padding: 2, borderWidth: 2, borderColor: '#fff' },
  headerTextContainer: { flex: 1, justifyContent: 'center' },
  shopName: { fontFamily: 'Unbounded_700Bold', fontSize: 18, color: '#111' },
  shopCategory: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#666', marginTop: 1 },
  linkContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  shopLink: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#22C55E', textDecorationLine: 'underline' },
  revenueCard: { padding: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between' },
  revenueHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  revenueLabel: { color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_500Medium', fontSize: 11, textTransform: 'uppercase' },
  revenueAmount: { color: '#fff', fontFamily: 'Unbounded_700Bold', fontSize: 18, marginTop: 2 },
  logoInfoContainer: { alignItems: 'center', justifyContent: 'center' },
  wolfLogo: { width: 45, height: 45, resizeMode: 'contain' },
  logoSubText: { color: 'rgba(255,255,255,0.4)', fontSize: 8, fontFamily: 'Inter_400Regular', marginTop: 4, textAlign: 'center' },
  proStatsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, marginBottom: 24 },
  proStatItem: { alignItems: 'center', flex: 1 },
  statDivider: { borderLeftWidth: 1, borderColor: '#F3F4F6' },
  proStatHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  proStatValue: { fontFamily: 'Unbounded_700Bold', fontSize: 16, color: '#111' },
  proStatLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#888', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 12, color: '#111', textTransform: 'uppercase' },
  seeAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#22C55E' },
  auctionList: { marginBottom: 24, marginHorizontal: -4 },
  auctionCard: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 16, width: 140, marginRight: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  liveText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#EF4444' },
  auctionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#111', marginBottom: 4 },
  currentBidLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#888' },
  bidValue: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111', marginTop: 2 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  timerText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#EF4444' },
  analyticsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 24, paddingHorizontal: 4 },
  analyticsText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#666' },
  analyticsButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F3F4F6', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  analyticsButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#111' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48.5%', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 12 },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#111' }
});

export default MyShop;