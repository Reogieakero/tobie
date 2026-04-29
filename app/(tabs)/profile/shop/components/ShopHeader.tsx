import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShopHeaderProps {
  shopName?: string;
  category?: string;
  customLink?: string;
}

export const ShopHeader = ({ shopName, category, customLink }: ShopHeaderProps) => {
  return (
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
        <Text style={styles.shopName} numberOfLines={1}>{shopName || 'Premium Store'}</Text>
        <Text style={styles.shopCategory}>{category || 'General Merchant'}</Text>
        <TouchableOpacity style={styles.linkContainer}>
          <Ionicons name="link-outline" size={13} color="#22C55E" />
          <Text style={styles.shopLink} numberOfLines={1}>{customLink || 'shop.link/pro'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: -16 },
  shopIconContainer: { position: 'relative', marginRight: 8 },
  shopIcon: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  verifiedBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#3B82F6', borderRadius: 10, padding: 2, borderWidth: 2, borderColor: '#fff' },
  headerTextContainer: { flex: 1, justifyContent: 'center' },
  shopName: { fontFamily: 'Unbounded_700Bold', fontSize: 18, color: '#111' },
  shopCategory: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#666', marginTop: 1 },
  linkContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  shopLink: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#22C55E', textDecorationLine: 'underline' },
});

export default ShopHeader;