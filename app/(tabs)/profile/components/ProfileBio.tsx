import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileBio() {
  const [bio, setBio] = useState<string | null>(null);
  const [shopLink, setShopLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch Bio from profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('bio')
          .eq('id', user.id)
          .single();

        if (profileData) setBio(profileData.bio);

        // 2. Check if shop is linked
        const { data: shopSettings } = await supabase
          .from('shops')
          .select('is_linked')
          .eq('owner_id', user.id)
          .single();

        // 3. If linked, fetch the custom link from applications
        if (shopSettings?.is_linked) {
          const { data: appData } = await supabase
            .from('shop_applications')
            .select('custom_link')
            .eq('user_id', user.id)
            .single();

          if (appData?.custom_link) {
            setShopLink(appData.custom_link);
          }
        }
      } catch (error) {
        console.error('Error fetching profile bio section:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, []);

  const handleLinkPress = () => {
    if (!shopLink) return;
    // Ensure the link has a protocol
    const url = shopLink.startsWith('http') ? shopLink : `https://${shopLink}`;
    Linking.openURL(url).catch(() => {
      console.error("Failed to open URL");
    });
  };

  return (
    <View style={styles.bioSection}>
      {loading ? (
        <ActivityIndicator size="small" color="#FF6B35" style={styles.loader} />
      ) : (
        <View>
          <Text style={styles.bio}>
            {bio || "No bio added yet. Tell us about yourself!"}
          </Text>

          {/* Shop Link displayed UNDER the bio */}
          {shopLink && (
            <TouchableOpacity 
              style={styles.linkContainer} 
              onPress={handleLinkPress}
              activeOpacity={0.7}
            >
              <Ionicons name="link-outline" size={16} color="#007AFF" />
              <Text style={styles.linkText} numberOfLines={1}>
                {shopLink}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.actionRow}>
        <Button
          label="Edit Profile"
          onPress={() => router.push('/profile/settings/account')}
          variant="primary"
          size="sm"
          style={styles.editBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bioSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bio: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8, // Reduced to bring link closer
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#007AFF', // Standard "Link" Blue
    marginLeft: 4,
  },
  loader: {
    marginBottom: 12,
    alignSelf: 'flex-start'
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  editBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 8,
    // Note: ensure your Button component handles background color properly 
    // for a "Secondary/Outline" look if variant="primary" is usually solid.
  },
});