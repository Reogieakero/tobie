import AnimatedInput from '@/components/ui/AnimatedInput';
import Button from '@/components/ui/Button';
import LegalModal from '@/components/ui/LegalModal';
import { useApplyForm } from '@/hooks/useApplyForm';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform, ScrollView, StatusBar,
    StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = ['Collectibles', 'Art', 'Tech', 'Fashion', 'Home & Living', 'Vintage'];

export default function ApplyFormScreen() {
  const router = useRouter();
  const { 
    formData, setFormData, touched, setTouched, agreed, setAgreed, 
    userEmail, city, loading, handleSubmit, isPhoneValid, isZipValid, isNameValid 
  } = useApplyForm();

  const [showPicker, setShowPicker] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const isFormValid = isPhoneValid(formData.phone) && formData.category && 
                      isNameValid(formData.shopName) && isZipValid(formData.zipCode) && agreed && city;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={24} color="#111" /></TouchableOpacity>
        <Text style={styles.headerTitle}>APPLICATION</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
            <View style={styles.formHeader}>
              <Text style={styles.title}>Shop Details</Text>
              <Text style={styles.subtitle}>Applying as: <Text style={styles.emailHighlight}>{userEmail}</Text></Text>
            </View>

            <AnimatedInput
              placeholder="Shop Name"
              value={formData.shopName}
              onChangeText={(text) => setFormData({ ...formData, shopName: text })}
              rightElement={isNameValid(formData.shopName) ? <Ionicons name="checkmark-circle" size={18} color="#4CAF50" /> : null}
            />

            <TouchableOpacity style={{ marginVertical: 20 }} onPress={() => setShowPicker(true)}>
              <View pointerEvents="none">
                <AnimatedInput 
                  placeholder="Primary Category" 
                  value={formData.category} 
                  editable={false} 
                  onChangeText={() => {}}
                  rightElement={formData.category ? <Ionicons name="checkmark-circle" size={18} color="#4CAF50" /> : <Ionicons name="chevron-down" size={18} color="#aaa" />} 
                />
              </View>
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={{ flex: 2, marginRight: 12 }}>
                <AnimatedInput 
                  placeholder="Phone" 
                  value={formData.phone} 
                  keyboardType="phone-pad" 
                  error={touched.phone && !isPhoneValid(formData.phone) ? "Invalid PH format" : undefined}
                  onChangeText={(text) => {
                    setFormData({ ...formData, phone: text });
                    if (text.length > 5) setTouched({ ...touched, phone: true });
                  }} 
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
                  rightElement={isZipValid(formData.zipCode) && city ? <Ionicons name="checkmark-circle" size={18} color="#4CAF50" /> : null}
                />
                {city ? <Text style={styles.cityText}>{city}</Text> : null}
              </View>
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.boxLabel}>Shop Description</Text>
              <TextInput
                style={styles.descriptionBox}
                multiline
                placeholder="What makes your shop unique?"
                placeholderTextColor="#aaa"
                value={formData.description}
                onChangeText={(t) => setFormData({...formData, description: t})}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.checkboxContainer} activeOpacity={0.7} onPress={() => setAgreed(!agreed)}>
              <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the <Text style={styles.linkText} onPress={() => setShowLegal(true)}>Terms of Service</Text>.
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Button 
                label={loading ? "Submitting..." : "Submit Application"} 
                variant="secondary"
                onPress={handleSubmit} 
                disabled={!isFormValid || loading} 
              />
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      <Modal visible={showPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select Category</Text>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.categoryItem} onPress={() => {
                  setFormData({ ...formData, category: item });
                  setShowPicker(false);
                }}>
                  <Text style={[styles.categoryText, formData.category === item && styles.categoryTextActive]}>{item}</Text>
                  {formData.category === item && <Ionicons name="checkmark" size={20} color="#000" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <LegalModal visible={showLegal} type="terms" onClose={() => setShowLegal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  scrollContent: { padding: 16, flexGrow: 1 },
  formHeader: { marginBottom: 20 },
  title: { fontFamily: 'Unbounded_700Bold', fontSize: 24, color: '#111' },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#777', marginTop: 4 },
  emailHighlight: { fontFamily: 'Inter_600SemiBold', color: '#111' },
  row: { flexDirection: 'row' },
  cityText: { fontSize: 10, color: '#4CAF50', marginTop: 4, fontFamily: 'Inter_600SemiBold' },
  boxLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#aaa', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  descriptionBox: { fontFamily: 'Inter_500Medium', fontSize: 14, backgroundColor: '#F9F9F9', borderRadius: 14, padding: 16, minHeight: 100, borderWidth: 1, borderColor: '#eee', color: '#111' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 30 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: '#eee', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#000', borderColor: '#000' },
  checkboxText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#777' },
  linkText: { color: '#111', fontFamily: 'Inter_600SemiBold', textDecorationLine: 'underline' },
  footer: { marginTop: 40, paddingBottom: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '50%' },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#eee', borderRadius: 2, marginBottom: 12 },
  modalTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 16 },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  categoryText: { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#666' },
  categoryTextActive: { color: '#000', fontFamily: 'Inter_600SemiBold' },
});