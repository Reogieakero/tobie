import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function ProfileHeader() {
  const [profile, setProfile] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    avatarUrl: null as string | null,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const scale = useSharedValue(0);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, middle_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setProfile({
            firstName: data.first_name || '',
            middleName: data.middle_name || '',
            lastName: data.last_name || '',
            avatarUrl: data.avatar_url || null,
          });
        }
      } catch (error) {
        console.error('Error fetching header profile:', error);
      }
    }
    fetchProfile();
  }, []);

  const openZoom = () => {
    setIsModalVisible(true);
    scale.value = withSpring(1, { damping: 15 });
  };

  const closeZoom = () => {
    scale.value = withTiming(0, { duration: 200 }, () => {
      // Logic handled via modal state to ensure clean unmount
    });
    setIsModalVisible(false);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const formatName = (name: string) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const displayName = [
    formatName(profile.firstName),
    formatName(profile.middleName),
    formatName(profile.lastName)
  ].filter(Boolean).join(' ') || 'Guest User';

  return (
    <View style={styles.container}>
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={openZoom} activeOpacity={0.9}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={36} color="#aaa" />
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName} numberOfLines={2}>{displayName}</Text>
      </View>

      {/* Zoom Overlay */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={closeZoom}>
          <Animated.View style={[styles.zoomContainer, animatedStyle]}>
            <View style={styles.largeAvatarRing}>
              {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.largeAvatar} />
              ) : (
                <View style={[styles.largeAvatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={80} color="#aaa" />
                </View>
              )}
            </View>
            <Text style={styles.zoomName}>{displayName}</Text>
          </Animated.View>
        </Pressable>
      </Modal>

      <View style={styles.statsContainer}>
        {[{ label: 'Listings', value: '0' }, { label: 'Followers', value: '0' }, { label: 'Following', value: '0' }].map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12 },
  avatarSection: { alignItems: 'center', marginRight: 20, width: 100 },
  avatarRing: { width: 86, height: 86, borderRadius: 43, padding: 3, borderWidth: 2.5, borderColor: '#FF6B35' },
  avatarInner: { flex: 1, borderRadius: 40, borderWidth: 2, borderColor: '#fff', overflow: 'hidden', backgroundColor: '#F0F0F0' },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  profileName: { fontFamily: 'Unbounded_700Bold', fontSize: 10, color: '#111', marginTop: 8, textAlign: 'center' },
  statsContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 10 },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: 'Unbounded_700Bold', fontSize: 16, color: '#111' },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#666', marginTop: 2 },
  
  // Overlay Styles
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  zoomContainer: { alignItems: 'center' },
  largeAvatarRing: { width: 220, height: 220, borderRadius: 110, borderWidth: 4, borderColor: '#FF6B35', padding: 5, backgroundColor: '#fff' },
  largeAvatar: { width: '100%', height: '100%', borderRadius: 105 },
  zoomName: { fontFamily: 'Unbounded_700Bold', color: '#fff', fontSize: 18, marginTop: 20 }
});