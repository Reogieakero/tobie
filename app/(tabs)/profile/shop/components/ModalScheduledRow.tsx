import { formatCountdown, formatScheduledDate, useStartsIn } from '@/hooks/useCountdown';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  startTime: string;
}

export default function ModalScheduledRow({ startTime }: Props) {
  const startsIn = useStartsIn(startTime);

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Ionicons name="calendar-outline" size={14} color="#111" />
        <Text style={styles.label}>Starts</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.value}>{formatScheduledDate(startTime)}</Text>
        {startsIn > 0 && (
          <Text style={styles.sub}>in {formatCountdown(startsIn)}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F7F7F7', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#111' },
  value: { fontFamily: 'Unbounded_700Bold', fontSize: 12, color: '#111' },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#666', marginTop: 2 },
});