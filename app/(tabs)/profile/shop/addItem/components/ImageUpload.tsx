import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  image: string | null;
  onImageSelected: (uri: string) => void;
};

export default function ImageUpload({ image, onImageSelected }: Props) {
  const handlePress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.5,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) onImageSelected(result.assets[0].uri);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <View style={styles.badge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="cloud-upload-outline" size={32} color="#999" />
          <Text style={styles.placeholderText}>Upload Item Photo</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 180,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  placeholder: { alignItems: 'center', gap: 8 },
  placeholderText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#999' },
  imageContainer: { width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  badge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
});