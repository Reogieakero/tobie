import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLogout } from '../../../hooks/useLogout';
import ProfileBio from './components/ProfileBio';
import ProfileGrid from './components/ProfileGrid';
import ProfileHeader from './components/ProfileHeader';
import ProfileListings from './components/ProfileListings';
import ProfileTabs from './components/ProfileTabs';

type Tab = 'listings' | 'bids' | 'won';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [menuVisible, setMenuVisible] = useState(false);
  const { logout } = useLogout();

  const toggleMenu = () => setMenuVisible(!menuVisible);

  const handleLogout = () => {
    toggleMenu();
    logout();
  };

  const goToShop = () => {
    router.push('/profile/shop');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topNav}>
        <Text style={styles.username}>Profile</Text>
        <View style={styles.navActions}>
          <TouchableOpacity style={styles.navBtn} onPress={goToShop}>
            <Ionicons name="storefront-outline" size={24} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={toggleMenu}>
            <Ionicons name="menu-outline" size={26} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.modalOverlay}>
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.menuItem} onPress={toggleMenu}>
                <Ionicons name="settings-outline" size={20} color="#111" />
                <Text style={styles.menuText}>Settings</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                <Text style={[styles.menuText, { color: '#FF3B30' }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[2]}
      >
        <ProfileHeader />
        <ProfileBio />
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'listings' && <ProfileGrid />}
        {activeTab === 'bids'     && <ProfileListings type="bids" />}
        {activeTab === 'won'      && <ProfileListings type="won" />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  username: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 16,
    color: '#111',
  },
  navActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  navBtn: { padding: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
  },
  dropdown: {
    marginTop: 45,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    width: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 12,
  },
});