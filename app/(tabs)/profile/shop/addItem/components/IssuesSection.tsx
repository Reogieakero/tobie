import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AnimatedInput from '@/components/ui/AnimatedInput';

type Props = {
  issues: string[];
  onAdd: () => void;
  onUpdate: (text: string, index: number) => void;
  onRemove: (index: number) => void;
};

export default function IssuesSection({ issues, onAdd, onUpdate, onRemove }: Props) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>ISSUES / DISCLOSURES</Text>
        <TouchableOpacity onPress={onAdd}>
          <Ionicons name="add-circle-outline" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      {issues.map((issue, index) => (
        <View key={index} style={styles.row}>
          <View style={{ flex: 1 }}>
            <AnimatedInput
              placeholder={`ISSUE ${index + 1}`}
              value={issue}
              onChangeText={(t) => onUpdate(t, index)}
            />
          </View>
          {issues.length > 1 && (
            <TouchableOpacity onPress={() => onRemove(index)} style={styles.removeBtn}>
              <Ionicons name="close-outline" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  removeBtn: { paddingBottom: 8, paddingLeft: 10 },
});