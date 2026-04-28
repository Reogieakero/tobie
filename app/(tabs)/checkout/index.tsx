import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CheckoutScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Order Summary</Text>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.body}>Subtotal</Text>
          <Text style={styles.body}>$0.00</Text>
        </View>
        <TouchableOpacity style={styles.payBtn}>
          <Text style={styles.payBtnText}>Complete Purchase</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontFamily: 'Unbounded_700Bold', fontSize: 22, color: '#1A1A1A' },
  content: { padding: 20, backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  body: { fontFamily: 'Inter_400Regular', color: '#666' },
  payBtn: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, alignItems: 'center' },
  payBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold' }
});