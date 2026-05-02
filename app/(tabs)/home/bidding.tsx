import BidHistoryItem from '@/app/(tabs)/profile/shop/components/BidHistoryItem';
import AnimatedInput from '@/components/ui/AnimatedInput';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function BiddingScreen() {
    const { itemId } = useLocalSearchParams();
    const router = useRouter();

    const [item, setItem] = useState<any>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [modalVisible, setModalVisible] = useState(false);
    const [bidInput, setBidInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchBids = async () => {
        const { data, error } = await supabase
            .from('bids')
            .select(`
                *,
                profiles:bidder_id (
                    first_name,
                    last_name,
                    avatar_url
                )
            `)
            .eq('item_id', itemId)
            .order('amount', { ascending: false });

        if (!error && data) setBids(data);
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const { data: itemData, error: itemError } = await supabase
                    .from('items')
                    .select(`*`)
                    .eq('id', itemId)
                    .single();

                if (itemError) throw itemError;
                setItem(itemData);
                await fetchBids();
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (itemId) {
            fetchInitialData();
            const subscription = supabase
                .channel(`realtime:bids:${itemId}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'bids',
                    filter: `item_id=eq.${itemId}` 
                }, () => fetchBids())
                .subscribe();

            return () => { supabase.removeChannel(subscription); };
        }
    }, [itemId]);

    useEffect(() => {
        if (!item?.end_time) return;
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(item.end_time).getTime() - now;
            if (distance < 0) {
                setTimeLeft('ENDED');
                clearInterval(timer);
                return;
            }
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        }, 1000);
        return () => clearInterval(timer);
    }, [item]);

    const getCurrentHighest = () => bids.length > 0 ? bids[0].amount : item?.price || 0;
    const getCurrentMinBid = () => Number(getCurrentHighest()) + Number(item?.min_increment || 0);

    const handleOpenModal = () => {
        setBidInput(getCurrentMinBid().toString());
        setModalVisible(true);
    };

    const submitBid = async () => {
        const amount = parseFloat(bidInput);
        const minRequired = getCurrentMinBid();
        if (isNaN(amount) || amount < minRequired) {
            showToast("INVALID BID", `Minimum bid is ₱${minRequired.toLocaleString()}`, "danger");
            return;
        }

        try {
            setIsSubmitting(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('bids')
                .insert([{ 
                    item_id: itemId, 
                    bidder_id: user.id, 
                    amount: amount 
                }]);

            if (error) throw error;
            setModalVisible(false);
            showToast("BID PLACED", `Successfully bid ₱${amount.toLocaleString()}`, "success");
        } catch (error: any) {
            showToast("ERROR", error.message, "danger");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.fixedHeader}>
            <View style={styles.imageWrapper}>
                <Image source={{ uri: item.image_url }} style={styles.heroImage} resizeMode="cover" />
                <View style={styles.timerOverlay}>
                    <Text style={styles.timerLabel}>ENDS IN</Text>
                    <Text style={styles.timerValue}>{timeLeft}</Text>
                </View>
            </View>
            <View style={styles.detailsContainer}>
                <View style={styles.titleRow}>
                    <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.badgeLive}><View style={styles.liveDot} /><Text style={styles.badgeTextLive}>LIVE</Text></View>
                </View>
                <View style={styles.statsRow}>
                    <View style={styles.startingBidContainer}>
                        <Text style={styles.statLabel}>Starting bid: </Text>
                        <Text style={styles.statValueMain}>₱{Number(item.price).toLocaleString()}</Text>
                    </View>
                    {item.min_increment && (
                        <View style={styles.incrementBadge}>
                            <Text style={styles.incrementText}>+₱{Number(item.min_increment).toLocaleString()} MIN</Text>
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.historyHeader}><Text style={styles.historyTitle}>BID HISTORY</Text></View>
        </View>
    );

    if (loading) return <LoadingOverlay message="LOADING..." />;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ 
                headerShown: true, 
                headerStyle: { backgroundColor: '#FFF' },
                headerTitle: () => <Text style={styles.headerTitleText}>PLACE A BID</Text>,
                headerTitleAlign: 'center',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
                        <Ionicons name="arrow-back" size={24} color="#111" />
                    </TouchableOpacity>
                ),
            }} />

            <SafeAreaView style={{ flex: 1 }}>
                <FlatList
                    data={bids}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item: bid, index }) => {
                        const profile = bid.profiles;
                        const bidderName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Anonymous Bidder';
                        
                        return (
                            <BidHistoryItem 
                                item={{
                                    ...bid,
                                    bidder_name: bidderName || 'Anonymous Bidder',
                                    avatar_url: profile?.avatar_url
                                }} 
                                index={index} 
                                isTopBid={index === 0} 
                                diff={bids[index + 1] ? bid.amount - bids[index + 1].amount : 0} 
                            />
                        );
                    }}
                    keyExtractor={(bid) => bid.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>No bids yet.</Text></View>}
                />
            </SafeAreaView>

            <TouchableOpacity style={styles.fab} onPress={handleOpenModal}>
                <Ionicons name="hammer-outline" size={26} color="#FFF" />
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>PLACE YOUR BID</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalPriceSummary}>
                           <View style={styles.summaryItem}>
                               <Text style={styles.summaryLabel}>Current Bid</Text>
                               <Text style={styles.summaryValue}>₱{getCurrentHighest().toLocaleString()}</Text>
                           </View>
                           <View style={[styles.summaryItem, { alignItems: 'flex-end' }]}>
                               <Text style={styles.summaryLabel}>Min. Required</Text>
                               <Text style={[styles.summaryValue, { color: '#10B981' }]}>₱{getCurrentMinBid().toLocaleString()}</Text>
                           </View>
                        </View>
                        <View style={styles.animatedInputContainer}>
                            <AnimatedInput placeholder="YOUR BID AMOUNT" value={bidInput} onChangeText={setBidInput} keyboardType="numeric" rightElement={<Text style={styles.currencySuffix}>₱</Text>} />
                        </View>
                        <TouchableOpacity style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} onPress={submitBid} disabled={isSubmitting}>
                            <Text style={styles.submitBtnText}>{isSubmitting ? 'PLACING...' : 'CONFIRM BID'}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    headerTitleText: { fontFamily: 'Unbounded_700Bold', fontSize: 11, letterSpacing: 2 },
    navBtn: { marginLeft: 16 },
    fixedHeader: { backgroundColor: '#FFF' },
    imageWrapper: { width: width, height: width * 0.7 },
    heroImage: { width: '100%', height: '100%' },
    timerOverlay: { position: 'absolute', bottom: 12, right: 16, backgroundColor: 'rgba(185, 28, 28, 0.9)', padding: 8, borderRadius: 8, flexDirection: 'row', gap: 6 },
    timerLabel: { fontSize: 9, color: '#FFF', opacity: 0.8 },
    timerValue: { fontSize: 12, fontWeight: '700', color: '#FFF' },
    detailsContainer: { padding: 16 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    productTitle: { flex: 1, fontSize: 20, fontWeight: '700' },
    badgeLive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 6, borderRadius: 6 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444', marginRight: 6 },
    badgeTextLive: { color: '#EF4444', fontWeight: '700', fontSize: 10 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    startingBidContainer: { flexDirection: 'row', alignItems: 'baseline' },
    statLabel: { fontSize: 13, color: '#64748B' },
    statValueMain: { fontFamily: 'Unbounded_700Bold', fontSize: 18 },
    incrementBadge: { backgroundColor: '#F1F5F9', padding: 6, borderRadius: 6 },
    incrementText: { fontSize: 10, fontWeight: '700', color: '#475569' },
    historyHeader: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F8FAFC', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9' },
    historyTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 10, color: '#64748B' },
    listContent: { paddingBottom: 100 },
    emptyContainer: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#94A3B8' },
    fab: { position: 'absolute', bottom: 30, right: 16, width: 60, height: 60, borderRadius: 30, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', elevation: 5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 16 },
    modalPriceSummary: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
    summaryItem: { flex: 1 },
    summaryLabel: { fontSize: 10, color: '#64748B', fontWeight: '600', marginBottom: 4 },
    summaryValue: { fontFamily: 'Unbounded_700Bold', fontSize: 14, color: '#111' },
    animatedInputContainer: { marginBottom: 30 },
    currencySuffix: { fontSize: 18, fontWeight: '700', color: '#111' },
    submitBtn: { backgroundColor: '#111', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14, letterSpacing: 1 }
});