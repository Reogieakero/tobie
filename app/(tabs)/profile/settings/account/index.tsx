import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedInput from '@/components/ui/AnimatedInput';
import Button from '@/components/ui/Button';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useAccountInfo } from '@/hooks/useAccountInfo';

export default function AccountInfoScreen() {
  const { 
    formData, setFormData, city, loading, initialLoading, 
    handleUpdate, isPhoneValid, isZipValid, pickImage, uploading
  } = useAccountInfo();

  if (initialLoading) return <LoadingOverlay message="LOADING PROFILE" />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {loading && <LoadingOverlay message="SAVING" />}
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Info</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} disabled={uploading}>
              <View style={styles.avatarCircle}>
                {formData.avatarUrl ? (
                  <Image source={{ uri: formData.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={40} color="#aaa" />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="camera" size={16} color="#fff" />}
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoLabel}>Change Profile Photo</Text>
          </View>

          <View style={styles.form}>
            {/* Destructured Full Name */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <AnimatedInput 
                  placeholder="First Name" 
                  value={formData.firstName}
                  onChangeText={(t) => setFormData({...formData, firstName: t})}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AnimatedInput 
                  placeholder="Last Name" 
                  value={formData.lastName}
                  onChangeText={(t) => setFormData({...formData, lastName: t})}
                />
              </View>
            </View>

            <AnimatedInput 
              placeholder="Middle Name (Optional)" 
              value={formData.middleName}
              onChangeText={(t) => setFormData({...formData, middleName: t})}
            />

            {/* Email - Not changeable, auto-fetched */}
            <View pointerEvents="none" style={{ opacity: 0.7 }}>
              <AnimatedInput 
                placeholder="Email Address" 
                value={formData.email}
                onChangeText={() => {}}
                editable={false}
              />
            </View>

            {/* CP Number and Zip Code with validation */}
            <View style={styles.row}>
              <View style={{ flex: 2, marginRight: 12 }}>
                <AnimatedInput 
                  placeholder="CP Number" 
                  value={formData.phone} 
                  keyboardType="phone-pad" 
                  onChangeText={(t) => setFormData({ ...formData, phone: t })} 
                  rightElement={isPhoneValid(formData.phone) ? <Ionicons name="checkmark-circle" size={18} color="#4CAF50" /> : null}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AnimatedInput 
                  placeholder="Zip Code" 
                  value={formData.zipCode} 
                  keyboardType="number-pad" 
                  maxLength={4} 
                  onChangeText={(t) => setFormData({...formData, zipCode: t})} 
                />
                {city ? <Text style={styles.cityText}>{city}</Text> : null}
              </View>
            </View>

            {/* Bio Box using description design from apply.tsx */}
            <View style={styles.bioWrapper}>
              <Text style={styles.boxLabel}>Bio</Text>
              <TextInput
                style={styles.bioInput}
                value={formData.bio}
                onChangeText={(t) => setFormData({...formData, bio: t})}
                multiline
                maxLength={60}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#aaa"
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{formData.bio.length} / 60</Text>
            </View>

            {/* Button is now part of the form/scroll list */}
            <View style={styles.buttonContainer}>
              <Button 
                label="Save Changes" 
                variant="secondary" 
                onPress={handleUpdate}
                loading={loading}
              />
            </View>
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 16, color: '#111' },
  backButton: { padding: 4 },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, position: 'relative' },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { flex: 1, borderRadius: 45, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#111', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  changePhotoLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#FF6B35', marginTop: 12 },
  form: { gap: 22 },
  row: { flexDirection: 'row' },
  cityText: { fontSize: 10, color: '#4CAF50', marginTop: 4, fontFamily: 'Inter_600SemiBold' },
  boxLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#999', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 },
  bioWrapper: { marginTop: 10 },
  bioInput: { fontFamily: 'Inter_500Medium', fontSize: 14, backgroundColor: '#F9F9F9', borderRadius: 14, padding: 16, minHeight: 90, borderWidth: 1, borderColor: '#eee', color: '#111' },
  charCount: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#999', textAlign: 'right', marginTop: 4 },
  buttonContainer: { marginTop: 20 },
});