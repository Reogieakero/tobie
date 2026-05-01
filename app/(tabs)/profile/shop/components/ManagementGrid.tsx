import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const ManagementGrid = () => {
  const router = useRouter();
  const [isListPressed, setIsListPressed] = useState(false);

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Management</Text>
      </View>

      <View style={styles.actionGrid}>
        <TouchableOpacity
          onPressIn={() => setIsListPressed(true)}
          onPressOut={() => setIsListPressed(false)}
          onPress={() => router.push('/profile/shop/addItem')}
          style={[styles.actionCard, isListPressed && { backgroundColor: '#111' }]}
        >
          <Ionicons name="add-circle" size={22} color={isListPressed ? '#fff' : '#111'} />
          <Text style={[styles.actionText, isListPressed && { color: '#fff' }]}>List Item</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/profile/shop/inventory')}
            >
            <Ionicons name="cube-outline" size={22} color="#111" />
            <Text style={styles.actionText}>Inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="megaphone-outline" size={22} color="#111" />
          <Text style={styles.actionText}>Promote</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="settings-outline" size={22} color="#111" />
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 12, color: '#111', textTransform: 'uppercase' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48.5%', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 12 },
  actionText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#111' },
});

export default ManagementGrid;