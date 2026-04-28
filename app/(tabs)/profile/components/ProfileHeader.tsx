import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STATS = [
  { label: 'Listings', value: '128' },
  { label: 'Followers', value: '4.2K' },
  { label: 'Following', value: '310' },
];

export default function ProfileHeader() {
  return (
    <View style={styles.container}>
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={36} color="#aaa" />
            </View>
          </View>
        </View>
        <Text style={styles.profileName}>Jordan Reeves</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        {STATS.map((stat) => (
          <TouchableOpacity key={stat.label} style={styles.statItem} activeOpacity={0.7}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    // no border — removed divider
  },
  avatarSection: {
    alignItems: 'center',
    marginRight: 20,
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    padding: 3,
    borderWidth: 2.5,
    borderColor: '#FF6B35',
  },
  avatarInner: {
    flex: 1,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 12,
    color: '#111',
    marginTop: 6,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Unbounded_700Bold',
    fontSize: 16,
    color: '#111',
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});