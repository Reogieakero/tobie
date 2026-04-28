import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MOCK_PRODUCTS = [
  { id: '1', name: 'Leather Messenger Bag', price: 250, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400' },
  { id: '2', name: 'Quartz Minimalist Watch', price: 180, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
];

export default function ProductsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse Products</Text>
      </View>
      <FlatList
        data={MOCK_PRODUCTS}
        numColumns={2}
        contentContainerStyle={{ padding: 15 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>${item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontFamily: 'Unbounded_700Bold', fontSize: 22, color: '#1A1A1A' },
  card: { flex: 1, margin: 5, backgroundColor: '#fff', borderRadius: 16, padding: 10, borderWidth: 1, borderColor: '#EFEFEF' },
  image: { width: '100%', height: 120, borderRadius: 12, marginBottom: 10 },
  name: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#1A1A1A' },
  price: { fontFamily: 'Unbounded_700Bold', fontSize: 14, color: '#1A1A1A', marginTop: 4 }
});