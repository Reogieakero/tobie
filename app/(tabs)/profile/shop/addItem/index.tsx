import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Custom UI components
import AnimatedInput from '@/components/ui/AnimatedInput';
import Button from '@/components/ui/Button';

type SellingType = 'auction' | 'posted' | 'fast_flip';

export default function AddItemScreen() {
  const router = useRouter();
  const [sellingType, setSellingType] = useState<SellingType>('auction');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [postToProfile, setPostToProfile] = useState(true);
  
  // State for form data and dynamic issues list
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '', 
    minIncrement: '',
    targetBid: '',
  });
  const [issues, setIssues] = useState<string[]>(['']);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Logic to handle multiple issues
  const handleAddIssue = () => setIssues([...issues, '']);
  const handleRemoveIssue = (index: number) => {
    const newIssues = issues.filter((_, i) => i !== index);
    setIssues(newIssues.length ? newIssues : ['']);
  };
  const handleUpdateIssue = (text: string, index: number) => {
    const newIssues = [...issues];
    newIssues[index] = text;
    setIssues(newIssues);
  };

  const handlePost = () => {
    setLoading(true);
    // Submit logic (formData + issues + image)
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header: Exact match to shop.tsx topNav */}
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>LIST NEW ITEM</Text>
          <View style={styles.navActions}><View style={{ width: 32 }} /></View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Upload */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>ITEM IMAGE</Text>
            <TouchableOpacity style={styles.imageUploadCard} onPress={pickImage} activeOpacity={0.8}>
              {image ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.selectedImage} />
                  <View style={styles.imageBadge}><Ionicons name="camera" size={16} color="#fff" /></View>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="cloud-upload-outline" size={32} color="#999" />
                  <Text style={styles.imagePlaceholderText}>Upload Item Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Selling Type Selector */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>SELECT SELLING TYPE</Text>
            <View style={styles.typeGrid}>
              {['auction', 'posted', 'fast_flip'].map((id) => (
                <TouchableOpacity
                  key={id}
                  style={[styles.typeCard, sellingType === id && styles.typeCardActive]}
                  onPress={() => setSellingType(id as SellingType)}
                >
                  <Ionicons 
                    name={id === 'auction' ? 'hammer-outline' : id === 'posted' ? 'pricetag-outline' : 'flash-outline'} 
                    size={20} 
                    color={sellingType === id ? '#fff' : '#999'} 
                  />
                  <Text style={[styles.typeText, sellingType === id && styles.typeTextActive]}>
                    {id === 'auction' ? 'Auction' : id === 'posted' ? 'Fixed Price' : 'Fast Flip'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <AnimatedInput
              placeholder="ITEM TITLE"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <View style={styles.pricingGrid}>
              <View style={{ flex: 1 }}>
                <AnimatedInput
                  placeholder={sellingType === 'auction' ? 'STARTING BID (₱)' : 'PRICE (₱)'}
                  value={formData.price}
                  keyboardType="numeric"
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                />
              </View>
              {sellingType === 'auction' && (
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <AnimatedInput
                    placeholder="TARGET BID (₱)"
                    value={formData.targetBid}
                    keyboardType="numeric"
                    onChangeText={(text) => setFormData({ ...formData, targetBid: text })}
                  />
                </View>
              )}
            </View>

            {sellingType === 'auction' && (
               <AnimatedInput
                placeholder="MINIMUM BID INCREMENT (₱)"
                value={formData.minIncrement}
                keyboardType="numeric"
                onChangeText={(text) => setFormData({ ...formData, minIncrement: text })}
              />
            )}

            <AnimatedInput
              placeholder="DESCRIPTION"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />

            {/* Dynamic Issues Section */}
            <View style={styles.dynamicSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>ISSUES / DISCLOSURES</Text>
                <TouchableOpacity onPress={handleAddIssue} style={styles.addBtn}>
                  <Ionicons name="add-circle-outline" size={22} color="#111" />
                </TouchableOpacity>
              </View>
              
              {issues.map((issue, index) => (
                <View key={index} style={styles.issueRow}>
                  <View style={{ flex: 1 }}>
                    <AnimatedInput
                      placeholder={`ISSUE ${index + 1}`}
                      value={issue}
                      onChangeText={(text) => handleUpdateIssue(text, index)}
                    />
                  </View>
                  {issues.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveIssue(index)} style={styles.removeBtn}>
                      <Ionicons name="close-outline" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.toggleContainer}>
              <View style={styles.toggleTextContent}>
                <Text style={styles.toggleLabel}>POST TO PROFILE GRID</Text>
                <Text style={styles.toggleSubtext}>Show this item on your public profile</Text>
              </View>
              <Switch
                trackColor={{ false: '#E2E2E2', true: '#111' }}
                thumbColor="#fff"
                ios_backgroundColor="#E2E2E2"
                onValueChange={setPostToProfile}
                value={postToProfile}
              />
            </View>

            <Button
              label={sellingType === 'auction' ? 'POST AUCTION' : 'POST LISTING'}
              variant="secondary"
              size="lg"
              loading={loading}
              onPress={handlePost}
              icon={<Ionicons name={sellingType === 'auction' ? "hammer" : "checkmark-circle"} size={20} color="#fff" />}
              iconPosition="right"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 16, color: '#111' },
  navBtn: { padding: 4 },
  navActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  scrollContent: { padding: 24, paddingBottom: 60 },
  sectionContainer: { marginBottom: 32 },
  sectionLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 1.2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addBtn: { padding: 4 },
  imageUploadCard: { height: 180, backgroundColor: '#F9FAFB', borderRadius: 16, borderWidth: 1, borderColor: '#E2E2E2', borderStyle: 'dashed', overflow: 'hidden', marginTop: 12 },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  imagePlaceholderText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#999' },
  imageContainer: { flex: 1 },
  selectedImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },
  typeGrid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  typeCard: { flex: 1, backgroundColor: '#F9FAFB', paddingVertical: 16, borderRadius: 14, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E2E2E2' },
  typeCardActive: { backgroundColor: '#000', borderColor: '#000' },
  typeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#999' },
  typeTextActive: { color: '#fff' },
  form: { gap: 24 },
  pricingGrid: { flexDirection: 'row', alignItems: 'flex-end' },
  dynamicSection: { marginTop: 8 },
  issueRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  removeBtn: { paddingBottom: 8, paddingLeft: 10 },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  toggleTextContent: { flex: 1, gap: 4 },
  toggleLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 1.2 },
  toggleSubtext: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#666' },
});