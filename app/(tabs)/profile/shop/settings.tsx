import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const SettingsScreen = () => {
  const router = useRouter();
  const [isVacationMode, setIsVacationMode] = useState(false);

  const SettingItem = ({ icon, title, subtitle, onPress, type = 'link' }: any) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={onPress} 
      disabled={type === 'switch'}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={22} color="#111" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'link' && <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />}
      {type === 'switch' && (
        <Switch
          value={isVacationMode}
          onValueChange={setIsVacationMode}
          trackColor={{ false: '#F1F5F9', true: '#111' }}
          thumbColor="#fff"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFF' },
          headerTitleAlign: 'center',
          headerTitle: () => <Text style={styles.headerTitle}>SHOP SETTINGS</Text>,
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
        <Text style={styles.sectionLabel}>General</Text>
        <SettingItem 
            icon="storefront-outline" 
            title="Shop Profile" 
            subtitle="Edit name, bio, and cover photo" 
            onPress={() => router.push('/(tabs)/profile/shop/edit-profile')} // Add this
        />
        <SettingItem 
          icon="notifications-outline" 
          title="Push Notifications" 
          subtitle="Sales, bids, and message alerts" 
        />

        <View style={styles.divider} />
        
        <Text style={styles.sectionLabel}>Operations</Text>
        <SettingItem 
          icon="airplane-outline" 
          title="Vacation Mode" 
          subtitle="Temporarily hide your listings" 
          type="switch"
        />
        <SettingItem 
          icon="card-outline" 
          title="Payments" 
          subtitle="Manage bank accounts and payouts" 
        />
        <SettingItem 
          icon="location-outline" 
          title="Pickup Address" 
          subtitle="Where couriers collect items" 
        />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Support</Text>
        <SettingItem 
          icon="help-circle-outline" 
          title="Help Center" 
        />
        <SettingItem 
          icon="trash-outline" 
          title="Delete Shop" 
          onPress={() => {}}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 12, letterSpacing: 1.5 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },
  sectionLabel: { 
    fontFamily: 'Unbounded_700Bold', 
    fontSize: 10, 
    color: '#94A3B8', 
    marginBottom: 8, 
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
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
  settingTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#111' },
  settingSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#64748B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
});

export default SettingsScreen;