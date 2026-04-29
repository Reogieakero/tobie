import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function ProfileBio() {
  const [bio, setBio] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBio() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('bio')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setBio(data.bio);
        }
      } catch (error) {
        console.error('Error fetching bio:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBio();
  }, []);

  return (
    <View style={styles.bioSection}>
      {loading ? (
        <ActivityIndicator size="small" color="#FF6B35" style={styles.loader} />
      ) : (
        <Text style={styles.bio}>
          {bio || "No bio added yet. Tell us about yourself!"}
        </Text>
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
    marginBottom: 12,
  },
  loader: {
    marginBottom: 12,
    alignSelf: 'flex-start'
  },
  actionRow: {
    flexDirection: 'row',
  },
  editBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 8,
  },
});