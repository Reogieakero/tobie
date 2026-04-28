import { supabase } from '@/lib/supabase';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Unbounded_700Bold, Unbounded_800ExtraBold, useFonts } from '@expo-google-fonts/unbounded';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;

// ─── Mock data (replace with Supabase queries later) ───────────────────────
const LIVE_AUCTIONS = [
  { id: '1', title: 'Rolex Submariner 2023', category: 'Watches', currentBid: 12500, endsIn: '2h 14m', bids: 23, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' },
  { id: '2', title: 'Air Jordan 1 OG Chicago', category: 'Sneakers', currentBid: 3800, endsIn: '45m', bids: 41, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { id: '3', title: 'Hermès Birkin 35 Togo', category: 'Bags', currentBid: 28000, endsIn: '5h 02m', bids: 9, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
];

const ENDING_SOON = [
  { id: '4', title: 'Vintage Leica M3', currentBid: 4200, endsIn: '12m', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80' },
  { id: '5', title: 'Pokémon 1st Ed. Charizard', currentBid: 9100, endsIn: '28m', image: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=300&q=80' },
  { id: '6', title: 'Fender Stratocaster \'62', currentBid: 6750, endsIn: '38m', image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&q=80' },
];

const CATEGORIES = [
  { id: 'watches', label: 'Watches', icon: 'time-outline' },
  { id: 'sneakers', label: 'Sneakers', icon: 'footsteps-outline' },
  { id: 'bags', label: 'Bags', icon: 'bag-outline' },
  { id: 'art', label: 'Art', icon: 'color-palette-outline' },
  { id: 'cards', label: 'Cards', icon: 'card-outline' },
];
// ───────────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('watches');

  let [fontsLoaded] = useFonts({
    Unbounded_800ExtraBold,
    Unbounded_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there';
      setUserName(name);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  };

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/sign-in');
  }

  if (!fontsLoaded) return null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{userName} 👋</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="search-outline" size={22} color="#1A1A1A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Live Banner ── */}
        <View style={styles.liveBanner}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBannerText}>23 auctions ending today</Text>
          <Ionicons name="chevron-forward" size={14} color="#fff" />
        </View>

        {/* ── Categories ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, activeCategory === cat.id && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Ionicons name={cat.icon as any} size={14} color={activeCategory === cat.id ? '#fff' : '#666'} />
              <Text style={[styles.categoryLabel, activeCategory === cat.id && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Live Auctions ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Auctions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
          {LIVE_AUCTIONS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.auctionCard} activeOpacity={0.92}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.liveBadge}>
                <View style={styles.liveBadgeDot} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.bidLabel}>Current Bid</Text>
                    <Text style={styles.bidAmount}>${item.currentBid.toLocaleString()}</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <View style={styles.metaRow}>
                      <Ionicons name="time-outline" size={11} color="#888" />
                      <Text style={styles.metaText}>{item.endsIn}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="flame-outline" size={11} color="#888" />
                      <Text style={styles.metaText}>{item.bids} bids</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.bidBtn}>
                  <Text style={styles.bidBtnText}>Place Bid</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Ending Soon ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ending Soon</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.endingSoonList}>
          {ENDING_SOON.map((item, idx) => (
            <TouchableOpacity key={item.id} style={[styles.smallCard, idx < ENDING_SOON.length - 1 && styles.smallCardBorder]} activeOpacity={0.85}>
              <Image source={{ uri: item.image }} style={styles.smallCardImage} />
              <View style={styles.smallCardBody}>
                <Text style={styles.smallCardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.smallCardBid}>${item.currentBid.toLocaleString()}</Text>
              </View>
              <View style={styles.smallCardRight}>
                <View style={styles.urgentBadge}>
                  <Ionicons name="time-outline" size={10} color="#E53935" />
                  <Text style={styles.urgentText}>{item.endsIn}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CCC" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  scrollContent: { paddingBottom: 24 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  greeting: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#999' },
  userName: { fontFamily: 'Unbounded_700Bold', fontSize: 18, color: '#1A1A1A', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },

  // Live banner
  liveBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', marginHorizontal: 20, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, gap: 8, marginBottom: 20 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  liveBannerText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: '#fff' },

  // Categories
  categoriesRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: 'transparent' },
  categoryChipActive: { backgroundColor: '#1A1A1A' },
  categoryLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#666' },
  categoryLabelActive: { color: '#fff' },

  // Section headers
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 14 },
  sectionTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 15, color: '#1A1A1A' },
  seeAll: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#999' },

  // Auction cards
  cardsRow: { paddingHorizontal: 20, gap: 14 },
  auctionCard: { width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#EFEFEF' },
  cardImage: { width: '100%', height: 180, backgroundColor: '#F0F0F0' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  liveBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  liveBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#fff', letterSpacing: 0.5 },
  cardBody: { padding: 14, gap: 6 },
  cardCategory: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.8 },
  cardTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#1A1A1A', lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 },
  bidLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#AAA' },
  bidAmount: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 16, color: '#1A1A1A' },
  cardMeta: { gap: 3, alignItems: 'flex-end' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#888' },
  bidBtn: { marginTop: 10, backgroundColor: '#1A1A1A', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  bidBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#fff' },

  // Ending soon
  endingSoonList: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EFEFEF', overflow: 'hidden' },
  smallCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, gap: 12 },
  smallCardBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  smallCardImage: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#F0F0F0' },
  smallCardBody: { flex: 1, gap: 3 },
  smallCardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1A1A1A' },
  smallCardBid: { fontFamily: 'Unbounded_700Bold', fontSize: 12, color: '#1A1A1A' },
  smallCardRight: { alignItems: 'flex-end', gap: 6 },
  urgentBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FEF2F2', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  urgentText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#E53935' },
});