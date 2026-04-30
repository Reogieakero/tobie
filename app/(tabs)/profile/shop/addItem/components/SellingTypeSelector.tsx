import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type SellingType = 'auction' | 'posted' | 'fast_flip';

const TYPES: { id: SellingType; label: string; icon: any }[] = [
  { id: 'auction', label: 'Auction', icon: 'hammer-outline' },
  { id: 'posted', label: 'Fixed Price', icon: 'pricetag-outline' },
  { id: 'fast_flip', label: 'Fast Flip', icon: 'flash-outline' },
];

type Props = {
  value: SellingType;
  onChange: (type: SellingType) => void;
};

export default function SellingTypeSelector({ value, onChange }: Props) {
  return (
    <View style={styles.grid}>
      {TYPES.map(({ id, label, icon }) => {
        const active = value === id;
        return (
          <TouchableOpacity
            key={id}
            style={[styles.card, active && styles.cardActive]}
            onPress={() => onChange(id)}
          >
            <Ionicons name={icon} size={20} color={active ? '#fff' : '#999'} />
            <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  card: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  cardActive: { backgroundColor: '#000', borderColor: '#000' },
  text: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#ADB5BD' },
  textActive: { color: '#fff' },
});