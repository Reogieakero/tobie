import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const RevenueCard = () => {
  const [showRevenue, setShowRevenue] = useState(true);

  return (
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
            <Ionicons name={showRevenue ? 'eye-outline' : 'eye-off-outline'} size={16} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>
        <Text style={styles.revenueAmount}>{showRevenue ? '₱124,500.00' : '••••••••'}</Text>
      </View>
      <View style={styles.logoInfoContainer}>
        <Image source={require('../../../../../assets/images/wolf-logo-no-bg.png')} style={styles.wolfLogo} />
        <Text style={styles.logoSubText}>This is your revenue</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  revenueCard: { padding: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between' },
  revenueHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  revenueLabel: { color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_500Medium', fontSize: 11, textTransform: 'uppercase' },
  revenueAmount: { color: '#fff', fontFamily: 'Unbounded_700Bold', fontSize: 18, marginTop: 2 },
  logoInfoContainer: { alignItems: 'center', justifyContent: 'center' },
  wolfLogo: { width: 45, height: 45, resizeMode: 'contain' },
  logoSubText: { color: 'rgba(255,255,255,0.4)', fontSize: 8, fontFamily: 'Inter_400Regular', marginTop: 4, textAlign: 'center' },
});

export default RevenueCard;