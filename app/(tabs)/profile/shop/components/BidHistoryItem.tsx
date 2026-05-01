import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function BidHistoryItem({ item, index, isTopBid, diff }: any) {
  const fullName = item.profiles ? `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() : 'Anonymous Bidder';
  const profileImage = item.profiles?.avatar_url ? { uri: item.profiles.avatar_url } : require('@/assets/images/wolf-logo-no-bg.png');

  return (
    <View style={[styles.bidRow, isTopBid && styles.topBidRow]}>
      <View style={styles.profileContainer}>
        <Image source={profileImage} style={styles.avatarImage} />
        <View style={[styles.rankOverlay, isTopBid && styles.topRankOverlay]}>
          <Text style={styles.rankTextSmall}>{isTopBid ? '★' : index + 1}</Text>
        </View>
      </View>
      <View style={styles.bidInfo}>
        <Text style={styles.bidderName}>{fullName}</Text>
        <Text style={styles.bidTime}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
      <View style={styles.amountWrapper}>
        {diff > 0 && (
          <View style={styles.diffContainer}>
            <Ionicons name="caret-up" size={10} color={isTopBid ? "#10B981" : "#EF4444"} />
            <Text style={[styles.diffText, !isTopBid && { color: '#EF4444' }]}>+{diff.toLocaleString()}</Text>
          </View>
        )}
        <Text style={[styles.amountText, isTopBid ? styles.topAmountText : styles.lowerAmountText]}>
          ₱{Number(item.amount).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bidRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  topBidRow: { backgroundColor: '#F0FDF4' },
  profileContainer: { position: 'relative', marginRight: 12 },
  avatarImage: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9' },
  rankOverlay: { position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#94A3B8', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFF' },
  topRankOverlay: { backgroundColor: '#10B981' },
  rankTextSmall: { fontFamily: 'Unbounded_700Bold', fontSize: 7, color: '#FFF' },
  bidInfo: { flex: 1 },
  bidderName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1E293B' },
  bidTime: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#94A3B8' },
  amountWrapper: { flexDirection: 'row', alignItems: 'center' },
  diffContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  diffText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#10B981', marginLeft: 2 },
  amountText: { fontFamily: 'Unbounded_700Bold', fontSize: 14, color: '#1E293B' },
  topAmountText: { color: '#10B981' },
  lowerAmountText: { color: '#EF4444' },
});