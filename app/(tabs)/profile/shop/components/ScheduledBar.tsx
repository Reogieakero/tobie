import { formatCountdown, useStartsIn } from '@/hooks/useCountdown';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  startTime: string;
}

export default function ScheduledBar({ startTime }: Props) {
  const startsIn = useStartsIn(startTime);

  return (
    <View style={styles.container}>
      <Ionicons name="calendar-outline" size={9} color="#fff" />
      <Text style={styles.text}>
        {startsIn > 0 ? `STARTS IN ${formatCountdown(startsIn)}` : 'STARTING...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4, backgroundColor: 'rgba(17,17,17,0.88)' },
  text: { fontFamily: 'Inter_700Bold', fontSize: 9, color: '#fff' },
});