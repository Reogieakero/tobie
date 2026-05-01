import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TIPS = [
  {
    id: '1',
    title: 'High-Quality Photos',
    description: 'Items with at least 4 clear photos from different angles sell 3x faster. Use natural lighting.',
    icon: 'camera-outline',
  },
  {
    id: '2',
    title: 'Detailed Descriptions',
    description: 'Mention any wear, tear, or unique features to build trust and reduce return requests.',
    icon: 'document-text-outline',
  },
  {
    id: '3',
    title: 'Fair Pricing',
    description: 'Research similar items to ensure your price is competitive. Consider shipping costs.',
    icon: 'pricetag-outline',
  },
  {
    id: '4',
    title: 'Fast Shipping',
    description: 'Shipping within 24 hours improves your seller rating and increases repeat customers.',
    icon: 'rocket-outline',
  },
  {
    id: '5',
    title: 'Keywords & Tags',
    description: 'Use relevant keywords in your title so buyers can find your items easily in search.',
    icon: 'search-outline',
  },
  {
    id: '6',
    title: 'Responsive Communication',
    description: 'Answer buyer questions quickly. Friendly service often leads to a successful sale.',
    icon: 'chatbubbles-outline',
  },
  {
    id: '7',
    title: 'Secure Packaging',
    description: 'Wrap items carefully to prevent damage. A good unboxing experience earns 5-star reviews.',
    icon: 'shield-checkmark-outline',
  },
];

const TipScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFF' },
          headerTitleAlign: 'center',
          headerTitle: () => <Text style={styles.headerTitle}>TIPS</Text>,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#111" />
            </TouchableOpacity>
          ),
          headerRight: () => <View style={{ width: 24 }} />,
          headerLeftContainerStyle: { paddingLeft: 16 },
          headerRightContainerStyle: { paddingRight: 16 },
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {TIPS.map((tip) => (
          <View key={tip.id} style={styles.tipRow}>
            <View style={styles.iconWrapper}>
              <Ionicons name={tip.icon as any} size={22} color="#111" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 12, letterSpacing: 1.5 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginRight: 16,
  },
  textContainer: { flex: 1 },
  tipTitle: { 
    fontFamily: 'Inter_600SemiBold', 
    fontSize: 14, 
    color: '#111', 
    marginBottom: 4 
  },
  tipDescription: { 
    fontFamily: 'Inter_400Regular', 
    fontSize: 13, 
    color: '#64748B', 
    lineHeight: 20 
  },
});

export default TipScreen;