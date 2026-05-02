import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function BiddingHeader({ item }: { item: any }) {
    const [timeLeft, setTimeLeft] = useState<string>('');

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

    return (
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
}

const styles = StyleSheet.create({
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
});