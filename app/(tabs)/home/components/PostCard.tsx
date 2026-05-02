import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface PostCardProps {
  item: any;
  isLiked: boolean;
  onLike: (id: string) => void;
}

// 1. Remove "export" from the const definition
const PostCard = React.memo(({ item, isLiked, onLike }: PostCardProps) => {
  const router = useRouter();
  const rawType = (item.selling_type || '').trim().toLowerCase();
  const rawStatus = (item.status || '').trim().toLowerCase();

  const isAuction = rawType === 'auction';
  const isActive = rawStatus === 'active';
  const isSold = rawStatus === 'sold' || rawStatus === 'ended';
  const isScheduled = rawStatus === 'scheduled';

  let statusLabel = 'AVAILABLE';
  let statusStyle = styles.tagActive;

  if (isSold) {
    statusLabel = rawStatus.toUpperCase();
    statusStyle = styles.tagEnded;
  } else if (isScheduled) {
    statusLabel = 'UPCOMING';
    statusStyle = styles.tagScheduled;
  } else if (isAuction && isActive) {
    statusLabel = 'LIVE AUCTION';
    statusStyle = styles.tagLive;
  }

  const profile = item.profiles;
  const shop = profile?.shop_applications?.[0];
  const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'User';
  const shopDisplayLink = shop?.custom_link || (shop?.shop_slug ? `@${shop.shop_slug}` : '@tobie_user');

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}><Ionicons name="person" size={16} color="#94A3B8" /></View>
          )}
          <View>
            <Text style={styles.postUserName}>{fullName}</Text>
            <Text style={styles.shopLink}>{shopDisplayLink}</Text>
          </View>
        </View>
        <TouchableOpacity><Ionicons name="ellipsis-horizontal" size={20} color="#64748B" /></TouchableOpacity>
      </View>

      <View>
        <Image source={{ uri: item.image_url }} style={styles.postImage} resizeMode="cover" />
        <View style={[styles.statusTag, statusStyle]}>
          {(isAuction && isActive) && <View style={styles.liveDot} />}
          <Text style={styles.tagText}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={() => onLike(item.id)} activeOpacity={0.6}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={28} color={isLiked ? "#EF4444" : "#1A1A1A"} />
          </TouchableOpacity>
          <TouchableOpacity><Ionicons name="chatbubble-outline" size={24} color="#1A1A1A" /></TouchableOpacity>
          {isAuction && isActive ? (
            <TouchableOpacity onPress={() => router.push({ pathname: "/home/bidding", params: { itemId: item.id } })}>
              <MaterialCommunityIcons name="gavel" size={28} color="#1A1A1A" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity><Ionicons name="paper-plane-outline" size={24} color="#1A1A1A" /></TouchableOpacity>
          )}
        </View>
        <TouchableOpacity><Ionicons name="bookmark-outline" size={24} color="#1A1A1A" /></TouchableOpacity>
      </View>

      <View style={styles.postContent}>
        <Text style={styles.likesText}>{(Number(item.likes_count) || 0).toLocaleString()} likes</Text>
        <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.priceHighlight}>
          {isAuction ? 'Starting Bid ' : 'Price '}
          <Text style={styles.boldPrice}>₱{Number(item.price).toLocaleString()}</Text>
        </Text>
        <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </View>
  );
});

// 2. Add the default export here
export default PostCard;

const styles = StyleSheet.create({
  postCard: { marginBottom: 10, backgroundColor: '#FFF' },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarPlaceholder: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 34, height: 34, borderRadius: 17 },
  postUserName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A1A1A' },
  shopLink: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#3B82F6' },
  postImage: { width: width, height: width, backgroundColor: '#F8FAFC' },
  statusTag: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, gap: 4, zIndex: 10 },
  tagLive: { backgroundColor: '#EF4444' },
  tagActive: { backgroundColor: '#10B981' },
  tagEnded: { backgroundColor: '#64748B' },
  tagScheduled: { backgroundColor: '#F59E0B' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' },
  tagText: { color: '#FFF', fontFamily: 'Inter_700Bold', fontSize: 10 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  leftActions: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  postContent: { paddingHorizontal: 12, paddingBottom: 10 },
  likesText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A1A1A', marginBottom: 2 },
  productTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#1A1A1A', marginBottom: 2, textTransform: 'uppercase' },
  priceHighlight: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#64748B', marginBottom: 4 },
  boldPrice: { fontFamily: 'Unbounded_700Bold', color: '#1A1A1A', fontSize: 16 },
  dateText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#94A3B8', marginTop: 2 }
});