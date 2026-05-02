import BidHistoryItem from '@/app/(tabs)/profile/shop/components/BidHistoryItem';
import { useAuctionLogs } from '@/hooks/useAuctionLogs';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function AuctionLogsScreen() {
    const router = useRouter();
    const { id, title } = useLocalSearchParams();
    const { 
        bids, itemDetails, loading, timeLeft, 
        refresh, isOwner, sellAuction, isSubmitting 
    } = useAuctionLogs(id as string);

    const highestBidder = bids.length > 0 ? bids[0] : null;

    const handleSellPress = () => {
        if (!highestBidder) return;
        Alert.alert(
            "CONFIRM SALE",
            `Sell to ${highestBidder.profiles.first_name} for ₱${highestBidder.amount.toLocaleString()}?`,
            [
                { text: "CANCEL", style: "cancel" },
                { text: "CONFIRM", onPress: sellAuction }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen 
                options={{
                    headerShown: true,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: '#FFF' },
                    headerTitleAlign: 'center',
                    headerTitle: () => <Text style={styles.headerTitle}>LIVE ACTIVITY</Text>,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
                            <Ionicons name="arrow-back" size={24} color="#111" />
                        </TouchableOpacity>
                    ),
                }} 
            />

            <View style={styles.fixedHeader}>
                <View style={styles.imageWrapper}>
                    {itemDetails?.image_url ? (
                        <Image source={{ uri: itemDetails.image_url }} style={styles.heroImage} />
                    ) : (
                        <View style={styles.imagePlaceholder}><Ionicons name="image-outline" size={60} color="#E2E8F0" /></View>
                    )}
                    
                    <View style={styles.floatingOverlay}>
                        <StatBlock label="STARTING" value={`₱${Number(itemDetails?.price || 0).toLocaleString()}`} />
                        <View style={styles.vDivider} />
                        <StatBlock label="TARGET" value={`₱${Number(itemDetails?.target_bid || 0).toLocaleString()}`} color="#10B981" />
                        <View style={styles.vDivider} />
                        <StatBlock label="REMAINING" value={timeLeft || '--:--:--'} color="#F59E0B" flex={1.5} />
                    </View>
                </View>

                <View style={styles.titleArea}>
                    <View style={styles.liveIndicator}>
                        <View style={styles.dot} /><Text style={styles.liveText}>LIVE ACTIVITY</Text>
                    </View>
                    <Text style={styles.itemTitle}>{title || itemDetails?.title || "Auction Item"}</Text>
                </View>

                <View style={styles.historyHeader}>
                    <Text style={styles.historyTitle}>BID HISTORY</Text>
                </View>
            </View>

            <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
                <FlatList
                    data={bids}
                    renderItem={({ item, index }) => (
                        <BidHistoryItem 
                            item={item} 
                            index={index} 
                            isTopBid={index === 0} 
                            diff={bids[index + 1] ? item.amount - bids[index + 1].amount : 0} 
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshing={loading}
                    onRefresh={refresh}
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>

            {isOwner ? (
                <TouchableOpacity 
                    style={[styles.fab, styles.sellFab, (!highestBidder || isSubmitting) && { opacity: 0.5 }]} 
                    onPress={handleSellPress}
                    disabled={isSubmitting || !highestBidder}
                >
                    <Ionicons name="checkmark-circle" size={32} color="#FFF" />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity 
                    style={styles.fab} 
                    onPress={() => router.push({ pathname: '/home/bidding', params: { itemId: id } })}
                >
                    <Ionicons name="hammer-outline" size={26} color="#FFF" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const StatBlock = ({ label, value, color = '#FFF', flex = 1 }: any) => (
    <View style={{ flex }}>
        <Text style={styles.overlayLabel}>{label}</Text>
        <Text numberOfLines={1} style={[styles.overlayValue, { color }]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 11, color: '#111', letterSpacing: 2 },
    navBtn: { marginLeft: 16 },
    fixedHeader: { backgroundColor: '#FFF', zIndex: 10 },
    imageWrapper: { width: width, height: width * 0.65, backgroundColor: '#F8FAFC', position: 'relative' },
    heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    floatingOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(0, 0, 0, 0.8)', paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
    vDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },
    overlayLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 8, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, marginBottom: 2 },
    overlayValue: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#FFF' },
    titleArea: { paddingHorizontal: 16, paddingVertical: 16 },
    itemTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 22, color: '#1E293B' },
    liveIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444', marginRight: 6 },
    liveText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#EF4444', letterSpacing: 1 },
    historyHeader: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F8FAFC', borderTopWidth: 1, borderTopColor: '#F1F5F9', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    historyTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 10, color: '#64748B', letterSpacing: 1 },
    listContent: { paddingBottom: 100 },
    fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', elevation: 8 },
    sellFab: { backgroundColor: '#10B981' }
});