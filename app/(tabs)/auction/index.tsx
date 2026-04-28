import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AuctionScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Bids</Text>
      </View>
      <ScrollView contentContainerStyle={styles.centered}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You haven't placed any bids yet.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontFamily: 'Unbounded_700Bold', fontSize: 22, color: '#1A1A1A' },
  centered: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { padding: 40, opacity: 0.5 },
  emptyText: { fontFamily: 'Inter_400Regular', textAlign: 'center' }
});