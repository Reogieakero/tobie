import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../../../components/ui/Button';

export default function ProfileBio() {
  return (
    <View style={styles.bioSection}>
      <Text style={styles.bio}>
        🏆 Verified seller · 4.9★ · 312 auctions{'\n'}
        Sneakers · Vintage · Electronics{'\n'}
        📦 Ships same day
      </Text>

      <View style={styles.actionRow}>
        <Button
          label="Edit Profile"
          onPress={() => {}}
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