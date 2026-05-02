import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    FlatList, KeyboardAvoidingView, Modal, Platform,
    SafeAreaView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';

import BidHistoryItem from '@/app/(tabs)/profile/shop/components/BidHistoryItem';
import AnimatedInput from '@/components/ui/AnimatedInput';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useBidding } from '@/hooks/useBidding';
import BiddingHeader from './components/BiddingHeader';

export default function BiddingScreen() {
    const { itemId } = useLocalSearchParams();
    const router = useRouter();
    
    const { 
        item, bids, loading, isOwner,
        modalVisible, setModalVisible,
        bidInput, setBidInput,
        isSubmitting, currentHighest, currentMinBid,
        highestBidder, handleOpenModal, submitBid, sellAuction 
    } = useBidding(itemId as string);

    if (loading || !item) return <LoadingOverlay message="LOADING..." />;

    const isSold = item?.status === 'sold';

    const handleSellPress = () => {
        if (!highestBidder) return;
        Alert.alert(
            "CONFIRM SALE",
            `Sell to ${highestBidder.profiles?.first_name} for ₱${highestBidder.amount.toLocaleString()}?`,
            [
                { text: "CANCEL", style: "cancel" },
                { text: "CONFIRM", onPress: sellAuction }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ 
                headerShown: true, 
                headerTitle: () => (
                    <Text style={styles.headerTitleText}>
                        {isSold ? 'AUCTION SOLD' : (isOwner ? 'MANAGE AUCTION' : 'PLACE A BID')}
                    </Text>
                ),
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
                    ListHeaderComponent={<BiddingHeader item={item} />}
                    keyExtractor={(bid) => bid.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item: bid, index }) => (
                        <BidHistoryItem 
                            item={{
                                ...bid,
                                bidder_name: bid.profiles ? `${bid.profiles.first_name} ${bid.profiles.last_name}` : 'Anonymous',
                                avatar_url: bid.profiles?.avatar_url
                            }} 
                            index={index} 
                            isTopBid={index === 0} 
                            diff={bids[index + 1] ? bid.amount - bids[index + 1].amount : 0} 
                        />
                    )}
                    ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>No bids yet.</Text></View>}
                />
            </SafeAreaView>

            {isOwner ? (
                <TouchableOpacity 
                    style={[styles.fab, styles.sellFab, (!highestBidder || isSubmitting || isSold) && { opacity: 0.5 }]} 
                    onPress={handleSellPress}
                    disabled={isSubmitting || !highestBidder || isSold}
                >
                    <Ionicons name={isSold ? "bag-check" : "checkmark-circle"} size={30} color="#FFF" />
                </TouchableOpacity>
            ) : (
                !isSold && (
                    <TouchableOpacity style={styles.fab} onPress={handleOpenModal}>
                        <Ionicons name="hammer-outline" size={26} color="#FFF" />
                    </TouchableOpacity>
                )
            )}

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
                                <Text style={styles.summaryValue}>₱{currentHighest.toLocaleString()}</Text>
                           </View>
                           <View style={[styles.summaryItem, { alignItems: 'flex-end' }]}>
                                <Text style={styles.summaryLabel}>Min. Required</Text>
                                <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                                    ₱{currentMinBid.toLocaleString()}
                                </Text>
                           </View>
                        </View>
                        <View style={styles.animatedInputContainer}>
                            <AnimatedInput 
                                placeholder="YOUR BID AMOUNT" 
                                value={bidInput} 
                                onChangeText={setBidInput} 
                                keyboardType="numeric" 
                                rightElement={<Text style={styles.currencySuffix}>₱</Text>} 
                            />
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
    listContent: { paddingBottom: 100 },
    emptyContainer: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#94A3B8' },
    fab: { position: 'absolute', bottom: 30, right: 16, width: 60, height: 60, borderRadius: 30, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', elevation: 5 },
    sellFab: { backgroundColor: '#10B981' },
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