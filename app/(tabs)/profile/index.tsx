import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar} />
        <Text style={styles.name}>Account Settings</Text>
      </View>
      
      <View style={styles.menu}>
        {['Personal Info', 'Order History', 'Payment Methods', 'Support'].map((item) => (
          <TouchableOpacity key={item} style={styles.menuItem}>
            <Text style={styles.menuText}>{item}</Text>
            <Ionicons name="chevron-forward" size={18} color="#CCC" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', paddingTop: 80 },
  profileHeader: { alignItems: 'center', marginBottom: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0E0E0', marginBottom: 15 },
  name: { fontFamily: 'Unbounded_700Bold', fontSize: 20 },
  menu: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  menuText: { fontFamily: 'Inter_500Medium', fontSize: 15 }
});