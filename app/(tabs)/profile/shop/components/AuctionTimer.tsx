import { getUrgency, useCountdown } from '@/hooks/useCountdown';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  endTime: string;
  isList?: boolean;
}

export default function AuctionTimer({ endTime, isList }: Props) {
  const remaining = useCountdown(endTime);
  const urgency = getUrgency(remaining);
  if (urgency === 'ended') return null;

  const totalSec = Math.floor(remaining / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');

  return (
    <View style={[styles.container, isList && styles.listContainer]}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={10} color="#fff" />
        <Text style={styles.headerText}>ENDS IN</Text>
      </View>
      <View style={styles.digitContainer}>
        <View style={styles.digitBox}><Text style={styles.digitText}>{h}</Text></View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.digitBox}><Text style={styles.digitText}>{m}</Text></View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.digitBox}><Text style={styles.digitText}>{s}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', paddingVertical: 4, alignItems: 'center' },
  listContainer: { bottom: 0, paddingVertical: 2 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 2 },
  headerText: { fontFamily: 'Unbounded_700Bold', fontSize: 7, color: '#fff', opacity: 0.8 },
  digitContainer: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  digitBox: { backgroundColor: '#333', borderRadius: 2, paddingHorizontal: 3, paddingVertical: 1, minWidth: 16, alignItems: 'center' },
  digitText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#fff' },
  separator: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold' },
});