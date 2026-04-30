import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmOverlay({ count, onCancel, onConfirm }: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Delete {count} Items?</Text>
        <Text style={styles.sub}>This action cannot be undone.</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={onConfirm}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 1000, paddingHorizontal: 16 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  title: { fontFamily: 'Unbounded_700Bold', fontSize: 14, color: '#111', marginBottom: 4 },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#666', marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  deleteBtn: { flex: 1, backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#4B5563' },
  deleteText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#fff' },
});