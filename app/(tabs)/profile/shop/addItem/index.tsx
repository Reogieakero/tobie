import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

import AnimatedInput from '@/components/ui/AnimatedInput';
import Button from '@/components/ui/Button';
import { useAddItemForm } from '@/hooks/useAddItemForm';
import { showToast } from '@/lib/toast';

import AuctionScheduler from './components/AuctionScheduler';
import ImageUpload from './components/ImageUpload';
import IssuesSection from './components/IssuesSection';
import PricingFields from './components/PricingFields';
import SellingTypeSelector from './components/SellingTypeSelector';

export default function AddItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const form = useAddItemForm(id);

  const handlePost = async () => {
    if (!form.formData.title || !form.formData.price) {
      showToast('Required', 'Please fill in title and price', 'danger');
      return;
    }
    setLoading(true);
    const success = await form.submitForm();
    setLoading(false);
    if (success) router.replace('/(tabs)/profile/shop');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'EDIT ITEM' : 'LIST NEW ITEM'}</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Section label="ITEM IMAGE">
            <ImageUpload image={form.image} onImageSelected={form.setImage} />
          </Section>

          <Section label="SELECT SELLING TYPE">
            <SellingTypeSelector value={form.sellingType} onChange={form.setSellingType} />
          </Section>

          {form.sellingType === 'auction' && (
            <AuctionScheduler
              startTimeType={form.startTimeType}
              endTimeType={form.endTimeType}
              duration={form.duration}
              scheduledStartDate={form.scheduledStartDate}
              scheduledEndDate={form.scheduledEndDate}
              onStartTimeTypeChange={form.setStartTimeType}
              onEndTimeTypeChange={form.setEndTimeType}
              onDurationChange={form.setDuration}
              onStartDateChange={form.setScheduledStartDate}
              onEndDateChange={form.setScheduledEndDate}
            />
          )}

          <View style={styles.form}>
            <AnimatedInput
              placeholder="ITEM TITLE"
              value={form.formData.title}
              onChangeText={(t) => form.setFormData({ ...form.formData, title: t })}
            />
            <PricingFields
              sellingType={form.sellingType}
              formData={form.formData}
              fieldValidation={form.fieldValidation}
              errors={form.errors}
              onChange={(patch) => form.setFormData({ ...form.formData, ...patch })}
            />
            <AnimatedInput
              placeholder="DESCRIPTION"
              value={form.formData.description}
              onChangeText={(t) => form.setFormData({ ...form.formData, description: t })}
            />
            <IssuesSection
              issues={form.issues}
              onAdd={form.handleAddIssue}
              onUpdate={form.handleUpdateIssue}
              onRemove={form.handleRemoveIssue}
            />

            <View style={styles.toggleContainer}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.toggleLabel}>POST TO PROFILE GRID</Text>
                <Text style={styles.toggleSubtext}>Show this item on your public profile</Text>
              </View>
              <Switch
                trackColor={{ false: '#E2E2E2', true: '#111' }}
                thumbColor="#fff"
                onValueChange={form.setPostToProfile}
                value={form.postToProfile}
              />
            </View>

            <Button
              label={isEditing ? 'UPDATE ITEM' : (form.sellingType === 'auction' ? 'POST AUCTION' : 'POST LISTING')}
              variant="secondary"
              size="lg"
              loading={loading}
              onPress={handlePost}
              icon={<Ionicons name={isEditing ? 'save' : 'checkmark-circle'} size={20} color="#fff" />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 16, color: '#111' },
  navBtn: { padding: 4 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 60 },
  sectionContainer: { marginBottom: 32 },
  sectionLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 1.2 },
  form: { gap: 24 },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  toggleLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 1.2 },
  toggleSubtext: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#666' },
});