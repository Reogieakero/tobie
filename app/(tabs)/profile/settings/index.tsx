import { useAccountInfo } from '@/hooks/useAccountInfo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { canEdit, daysLeft } = useAccountInfo();

  const handleBack = () => router.push('/profile');

  const goToAccountInfo = () => {
    if (!canEdit) return;
    router.push('/profile/settings/account');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <SettingItem 
            icon={canEdit ? "person-outline" : "lock-closed-outline"} 
            label="Account Information" 
            onPress={goToAccountInfo}
            statusText={!canEdit ? `Locked (Available in ${daysLeft}d)` : undefined}
            disabled={!canEdit}
          />
          <SettingItem icon="notifications-outline" label="Notifications" />
          <SettingItem icon="shield-checkmark-outline" label="Privacy & Security" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support & Info</Text>
          <SettingItem icon="help-circle-outline" label="Help Center" />
          <SettingItem icon="document-text-outline" label="Terms of Service" />
          <SettingItem icon="information-circle-outline" label="About" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingItem({ icon, label, onPress, statusText, disabled }: any) {
  return (
    <TouchableOpacity 
      style={[styles.item, disabled && { opacity: 0.6 }]} 
      activeOpacity={0.7} 
      onPress={onPress}
    >
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={disabled ? "#FF6B35" : "#111"} />
        </View>
        <View>
          <Text style={styles.itemText}>{label}</Text>
          {statusText && <Text style={styles.statusText}>{statusText}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 16, color: '#111' },
  backButton: { padding: 4 },
  content: { paddingHorizontal: 16, paddingTop: 20 },
  section: { marginBottom: 24 },
  sectionLabel: { fontFamily: 'Unbounded_700Bold', fontSize: 12, color: '#8E8E93', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { width: 32, alignItems: 'flex-start' },
  itemText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#111' },
  statusText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#FF6B35', marginTop: 2 },
});