import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileBio from './components/ProfileBio';
import ProfileGrid from './components/ProfileGrid';
import ProfileHeader from './components/ProfileHeader';
import ProfileListings from './components/ProfileListings';
import ProfileTabs from './components/ProfileTabs';

type Tab = 'listings' | 'bids' | 'won';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('listings');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Top Nav */}
      <View style={styles.topNav}>
        <Text style={styles.username}>Profile</Text>
        <View style={styles.navActions}>
          <TouchableOpacity style={styles.navBtn}>
            <Ionicons name="add-circle-outline" size={26} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn}>
            <Ionicons name="menu-outline" size={26} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

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
    // no borderBottom — clean header
  },
  username: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 16,
    color: '#111',
  },
  navActions: { flexDirection: 'row', gap: 8 },
  navBtn: { padding: 4 },
});