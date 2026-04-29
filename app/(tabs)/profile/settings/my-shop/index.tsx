import { useShopSettings } from '@/hooks/useShopSettings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyShopSettingsScreen() {
  const { isLinked, shopName, loading, updating, toggleShopLink } = useShopSettings();

  const handleBack = () => router.push('/profile/settings');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Shop Settings</Text>
        <View style={{ width: 32 }}>
            {updating && <ActivityIndicator size="small" color="#111" />}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Shop Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Shop Information</Text>
          <View style={styles.item}>
             <View style={styles.itemLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name="storefront-outline" size={22} color="#111" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.itemText}>Shop Name</Text>
                    <Text style={styles.itemDescription}>
                        {loading ? "Loading..." : (shopName || "Untitled Shop")}
                    </Text>
                </View>
             </View>
          </View>
        </View>

        {/* Shop Visibility Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Shop Visibility</Text>
          
          <View style={[styles.item, loading && { opacity: 0.5 }]}>
            <View style={styles.itemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="link-outline" size={22} color="#111" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemText}>Link to Profile</Text>
                <Text style={styles.itemDescription}>
                  Toggle to show or hide your shop on your personal profile page
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#D1D1D6", true: "#34C759" }}
              thumbColor={Platform.OS === 'ios' ? undefined : "#fff"}
              ios_backgroundColor="#D1D1D6"
              onValueChange={toggleShopLink}
              value={isLinked}
              disabled={loading || updating}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 10 
  },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 16, color: '#111' },
  backButton: { padding: 4 },
  content: { paddingHorizontal: 16, paddingTop: 20 },
  section: { marginBottom: 32 },
  sectionLabel: { 
    fontFamily: 'Unbounded_700Bold', 
    fontSize: 11, 
    color: '#8E8E93', 
    marginBottom: 16, 
    textTransform: 'uppercase', 
    letterSpacing: 1 
  },
  item: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F2F2F7' 
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  iconContainer: { width: 24, alignItems: 'center' },
  itemText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#111' },
  itemDescription: { 
    fontFamily: 'Inter_400Regular', 
    fontSize: 12, 
    color: '#8E8E93', 
    marginTop: 2,
    lineHeight: 16 
  },
});