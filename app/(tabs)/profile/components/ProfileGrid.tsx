import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = (width - 3) / 3;

type Listing = {
  id: string;
  currentBid: number;
  bidsCount: number;
  endsIn: string;
  isLive: boolean;
  image: string;
  title: string;
  startingBid: number;
  seller: string;
};

const MOCK_LISTINGS: Listing[] = [
  { id: '1',  title: 'Nike Air Jordan 1 Retro',      startingBid: 150, currentBid: 240, bidsCount: 8,  endsIn: '2h',  isLive: true,  seller: '@sneakerhead_ph', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop' },
  { id: '2',  title: 'Rolex Submariner Watch',        startingBid: 400, currentBid: 580, bidsCount: 14, endsIn: '5h',  isLive: true,  seller: '@luxury_finds',   image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop' },
  { id: '3',  title: 'Chanel No. 5 Perfume Set',      startingBid: 80,  currentBid: 120, bidsCount: 3,  endsIn: '11h', isLive: true,  seller: '@beauty_vault',   image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=600&fit=crop' },
  { id: '4',  title: 'Adidas Ultraboost 22',          startingBid: 200, currentBid: 375, bidsCount: 9,  endsIn: '18h', isLive: false, seller: '@sport_drops',    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=600&fit=crop' },
  { id: '5',  title: 'Polaroid Now+ Camera',          startingBid: 60,  currentBid: 99,  bidsCount: 2,  endsIn: '22h', isLive: false, seller: '@retro_gear',     image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop' },
  { id: '6',  title: 'White Leather Sneakers',        startingBid: 300, currentBid: 650, bidsCount: 21, endsIn: '1d',  isLive: false, seller: '@clean_kicks',    image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=600&fit=crop' },
  { id: '7',  title: 'Vintage Sunglasses',            startingBid: 250, currentBid: 430, bidsCount: 6,  endsIn: '1d',  isLive: false, seller: '@style_archive',  image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop' },
  { id: '8',  title: 'Dior Sauvage EDT 100ml',        startingBid: 100, currentBid: 185, bidsCount: 4,  endsIn: '2d',  isLive: false, seller: '@fragrance_hub',  image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=600&fit=crop' },
  { id: '9',  title: 'Smart Watch Series 9',          startingBid: 200, currentBid: 310, bidsCount: 11, endsIn: '2d',  isLive: false, seller: '@tech_deals_ph',  image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop' },
  { id: '10', title: 'Chunky Platform Sneakers',      startingBid: 500, currentBid: 720, bidsCount: 17, endsIn: '3d',  isLive: false, seller: '@hype_closet',    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=600&fit=crop' },
  { id: '11', title: 'Sony WH-1000XM5 Headphones',   startingBid: 30,  currentBid: 55,  bidsCount: 1,  endsIn: '3d',  isLive: false, seller: '@audio_finds',    image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop' },
  { id: '12', title: 'Classic White Sneakers',        startingBid: 300, currentBid: 490, bidsCount: 13, endsIn: '4d',  isLive: false, seller: '@sneaker_vault',  image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&fit=crop' },
];

export default function ProfileGrid() {
  const [selected, setSelected] = useState<Listing | null>(null);

  return (
    <>
      <View style={styles.grid}>
        {MOCK_LISTINGS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.cell}
            activeOpacity={0.85}
            onPress={() => setSelected(item)}
          >
            <Image source={{ uri: item.image }} style={styles.image} />

            {item.isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}

            <View style={styles.overlay}>
              <Text style={styles.bidAmount}>${item.currentBid}</Text>
              <Text style={styles.bidMeta}>{item.bidsCount} bids · {item.endsIn}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Detail Modal */}
      <Modal visible={!!selected} transparent animationType="fade" statusBarTranslucent>
        <TouchableWithoutFeedback onPress={() => setSelected(null)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                {/* Image */}
                <View style={styles.modalImageWrap}>
                  <Image source={{ uri: selected?.image }} style={styles.modalImage} />

                  {/* Close button */}
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>

                  {/* Live badge */}
                  {selected?.isLive && (
                    <View style={styles.modalLiveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.modalBody}>
                  <Text style={styles.modalTitle}>{selected?.title}</Text>
                  <Text style={styles.modalSeller}>{selected?.seller}</Text>

                  <View style={styles.modalStats}>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxLabel}>Starting Bid</Text>
                      <Text style={styles.statBoxValue}>${selected?.startingBid}</Text>
                    </View>
                    <View style={[styles.statBox, styles.statBoxHighlight]}>
                      <Text style={[styles.statBoxLabel, { color: '#FF6B35' }]}>Current Bid</Text>
                      <Text style={[styles.statBoxValue, { color: '#FF6B35' }]}>${selected?.currentBid}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxLabel}>Bids</Text>
                      <Text style={styles.statBoxValue}>{selected?.bidsCount}</Text>
                    </View>
                  </View>

                  <View style={styles.modalMeta}>
                    <Ionicons name="time-outline" size={14} color="#888" />
                    <Text style={styles.modalMetaText}>Ends in {selected?.endsIn}</Text>
                  </View>

                  <TouchableOpacity style={styles.bidBtn} activeOpacity={0.85}>
                    <Text style={styles.bidBtnText}>Place a Bid</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1.5,
  },
  cell: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: '#F2F2F2',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  liveBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,53,0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fff',
  },
  liveText: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 8,
    color: '#fff',
    letterSpacing: 0.5,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  bidAmount: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 11,
    color: '#fff',
  },
  bidMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalImageWrap: {
    width: '100%',
    height: height * 0.38,
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLiveBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,53,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  modalBody: {
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 15,
    color: '#111',
    marginBottom: 4,
  },
  modalSeller: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#888',
    marginBottom: 16,
  },
  modalStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statBoxHighlight: {
    backgroundColor: '#FFF4EF',
  },
  statBoxLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#888',
    marginBottom: 3,
  },
  statBoxValue: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 13,
    color: '#111',
  },
  modalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 18,
  },
  modalMetaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#888',
  },
  bidBtn: {
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  bidBtnText: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 13,
    color: '#fff',
    letterSpacing: 0.3,
  },
});