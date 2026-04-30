import { formatCountdown, getUrgency, useCountdown } from '@/hooks/useCountdown';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  endTime: string;
}

export default function ModalCountdown({ endTime }: Props) {
  const remaining = useCountdown(endTime);
  const urgency = getUrgency(remaining);
  const color =
    urgency === 'critical' ? '#DC2626' :
    urgency === 'warning'  ? '#D97706' :
    urgency === 'ended'    ? '#6B7280' : '#111';

  const timeStr = remaining <= 0 ? '—' : formatCountdown(remaining);

  return (
    <View style={[
      styles.row,
      urgency === 'critical' && { backgroundColor: '#FEF2F2' },
      urgency === 'warning'  && { backgroundColor: '#FFFBEB' },
    ]}>
      <View style={styles.left}>
        <Ionicons name="time-outline" size={14} color={color} />
        <Text style={[styles.label, { color }]}>
          {remaining <= 0 ? 'Auction ended' : 'Time remaining'}
        </Text>
      </View>
      <Text style={[styles.value, { color }]}>{timeStr}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F7F7F7', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#111' },
  value: { fontFamily: 'Unbounded_700Bold', fontSize: 13, color: '#111' },
});