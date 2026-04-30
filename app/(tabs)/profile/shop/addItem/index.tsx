import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
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

import AnimatedInput from '@/components/ui/AnimatedInput';
import Button from '@/components/ui/Button';
import { useAddItemForm } from '@/hooks/useAddItemForm';
import { showToast } from '@/lib/toast';

// Wraps an input with an optional inline validation indicator
const ValidatedField = ({
  children,
  isValid,
  hasValue,
  error,
}: {
  children: React.ReactNode;
  isValid: boolean;
  hasValue: boolean;
  error?: string;
}) => (
  <View style={{ flex: 1 }}>
    <View style={validStyles.row}>
      <View style={{ flex: 1 }}>{children}</View>
      {hasValue && (
        <View style={validStyles.iconWrap}>
          {isValid ? (
            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
          ) : (
            <Ionicons name="close-circle" size={20} color="#EF4444" />
          )}
        </View>
      )}
    </View>
    {hasValue && !isValid && error ? (
      <Text style={validStyles.errorText}>{error}</Text>
    ) : null}
  </View>
);

const validStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  iconWrap: { paddingBottom: 10, paddingLeft: 8 },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 2,
  },
});

export default function AddItemScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const form = useAddItemForm();

  const handlePost = async () => {
    if (!form.formData.title || !form.formData.price) {
      showToast('Required', 'Please fill in title and price', 'danger');
      return;
    }
    setLoading(true);
    const success = await form.submitForm();
    setLoading(false);
    if (success) router.replace('/(tabs)/profile');
  };

  const openAndroidPicker = (mode: 'start' | 'end') => {
    const currentValue = mode === 'start' ? form.scheduledStartDate : form.scheduledEndDate;

    DateTimePickerAndroid.open({
      value: currentValue,
      mode: 'date',
      onChange: (event, date) => {
        if (event.type === 'set' && date) {
          DateTimePickerAndroid.open({
            value: date,
            mode: 'time',
            is24Hour: false,
            onChange: (tEvent, dateTime) => {
              if (tEvent.type === 'set' && dateTime) {
                if (mode === 'start') form.setScheduledStartDate(dateTime);
                else form.setScheduledEndDate(dateTime);
              }
            },
          });
        }
      },
      minimumDate: mode === 'end' ? form.scheduledStartDate : new Date(),
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/(tabs)/profile/shop')}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>LIST NEW ITEM</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Section label="ITEM IMAGE">
            <TouchableOpacity
              style={styles.imageUploadCard}
              onPress={async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  quality: 0.5,
                  allowsEditing: true,
                  aspect: [1, 1],
                });
                if (!result.canceled) form.setImage(result.assets[0].uri);
              }}
              activeOpacity={0.8}
            >
              {form.image ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: form.image }} style={styles.selectedImage} />
                  <View style={styles.imageBadge}>
                    <Ionicons name="camera" size={16} color="#fff" />
                  </View>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="cloud-upload-outline" size={32} color="#999" />
                  <Text style={styles.imagePlaceholderText}>Upload Item Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </Section>

          <Section label="SELECT SELLING TYPE">
            <View style={styles.typeGrid}>
              {['auction', 'posted', 'fast_flip'].map((id) => (
                <TouchableOpacity
                  key={id}
                  style={[styles.typeCard, form.sellingType === id && styles.typeCardActive]}
                  onPress={() => form.setSellingType(id as any)}
                >
                  <Ionicons
                    name={
                      id === 'auction'
                        ? 'hammer-outline'
                        : id === 'posted'
                        ? 'pricetag-outline'
                        : 'flash-outline'
                    }
                    size={20}
                    color={form.sellingType === id ? '#fff' : '#999'}
                  />
                  <Text style={[styles.typeText, form.sellingType === id && styles.typeTextActive]}>
                    {id === 'auction' ? 'Auction' : id === 'posted' ? 'Fixed Price' : 'Fast Flip'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          {form.sellingType === 'auction' && (
            <>
              <Section label="START TIME">
                <View style={styles.typeGrid}>
                  <TouchableOpacity
                    style={[styles.durationCard, form.startTimeType === 'now' && styles.durationCardActive]}
                    onPress={() => form.setStartTimeType('now')}
                  >
                    <Text style={[styles.typeText, form.startTimeType === 'now' && styles.typeTextActive]}>
                      RIGHT NOW
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.durationCard, form.startTimeType === 'future' && styles.durationCardActive]}
                    onPress={() => {
                      form.setStartTimeType('future');
                      if (Platform.OS === 'android') openAndroidPicker('start');
                      else setShowStartPicker(true);
                    }}
                  >
                    <Text style={[styles.typeText, form.startTimeType === 'future' && styles.typeTextActive]}>
                      {form.startTimeType === 'future'
                        ? form.scheduledStartDate.toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'SCHEDULE START'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {Platform.OS === 'ios' && showStartPicker && (
                  <View style={styles.iosPickerWrap}>
                    <DateTimePicker
                      value={form.scheduledStartDate}
                      mode="datetime"
                      display="spinner"
                      minimumDate={new Date()}
                      onChange={(event, date) => {
                        if (date) form.setScheduledStartDate(date);
                      }}
                    />
                    <TouchableOpacity onPress={() => setShowStartPicker(false)} style={styles.doneBtn}>
                      <Text style={styles.doneBtnText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Section>

              <Section label="END TIME / DURATION">
                <View style={styles.typeGrid}>
                  <TouchableOpacity
                    style={[styles.durationCard, form.endTimeType === 'duration' && styles.durationCardActive]}
                    onPress={() => form.setEndTimeType('duration')}
                  >
                    <Text style={[styles.typeText, form.endTimeType === 'duration' && styles.typeTextActive]}>
                      USE DURATION
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.durationCard, form.endTimeType === 'specific' && styles.durationCardActive]}
                    onPress={() => {
                      form.setEndTimeType('specific');
                      if (Platform.OS === 'android') openAndroidPicker('end');
                      else setShowEndPicker(true);
                    }}
                  >
                    <Text style={[styles.typeText, form.endTimeType === 'specific' && styles.typeTextActive]}>
                      {form.endTimeType === 'specific'
                        ? form.scheduledEndDate.toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'PICK END TIME'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {form.endTimeType === 'duration' ? (
                  <View style={{ marginTop: 12 }}>
                    <View style={styles.typeGrid}>
                      {['5', '10', '60'].map((mins) => (
                        <TouchableOpacity
                          key={mins}
                          style={[styles.durationCard, form.duration === mins && styles.durationCardActive]}
                          onPress={() => form.setDuration(mins)}
                        >
                          <Text style={[styles.typeText, form.duration === mins && styles.typeTextActive]}>
                            {mins} MINS
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={{ marginTop: 12 }}>
                      <AnimatedInput
                        placeholder="CUSTOM DURATION (MINUTES)"
                        value={form.duration}
                        keyboardType="numeric"
                        onChangeText={(t) => form.setDuration(t)}
                      />
                    </View>
                  </View>
                ) : (
                  Platform.OS === 'ios' &&
                  showEndPicker && (
                    <View style={styles.iosPickerWrap}>
                      <DateTimePicker
                        value={form.scheduledEndDate}
                        mode="datetime"
                        display="spinner"
                        minimumDate={form.scheduledStartDate}
                        onChange={(event, date) => {
                          if (date) form.setScheduledEndDate(date);
                        }}
                      />
                      <TouchableOpacity onPress={() => setShowEndPicker(false)} style={styles.doneBtn}>
                        <Text style={styles.doneBtnText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  )
                )}
              </Section>
            </>
          )}

          <View style={styles.form}>
            <AnimatedInput
              placeholder="ITEM TITLE"
              value={form.formData.title}
              onChangeText={(t) => form.setFormData({ ...form.formData, title: t })}
            />

            {/* Pricing row with validation indicators */}
            <View style={styles.pricingGrid}>
              <ValidatedField
                isValid={form.fieldValidation.price}
                hasValue={form.formData.price.trim() !== ''}
                error={form.errors.price}
              >
                <AnimatedInput
                  placeholder={form.sellingType === 'auction' ? 'STARTING BID (₱)' : 'PRICE (₱)'}
                  value={form.formData.price}
                  keyboardType="numeric"
                  onChangeText={(t) => form.setFormData({ ...form.formData, price: t })}
                />
              </ValidatedField>

              {form.sellingType === 'auction' && (
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <ValidatedField
                    isValid={form.fieldValidation.targetBid}
                    hasValue={form.formData.targetBid.trim() !== ''}
                    error={form.errors.targetBid}
                  >
                    <AnimatedInput
                      placeholder="TARGET BID (₱)"
                      value={form.formData.targetBid}
                      keyboardType="numeric"
                      onChangeText={(t) => form.setFormData({ ...form.formData, targetBid: t })}
                    />
                  </ValidatedField>
                </View>
              )}
            </View>

            {/* Quantity + Min Increment row */}
            <View style={styles.pricingGrid}>
              <View style={{ flex: 1 }}>
                <AnimatedInput
                  placeholder="QUANTITY"
                  value={form.formData.quantity}
                  keyboardType="numeric"
                  onChangeText={(t) => form.setFormData({ ...form.formData, quantity: t })}
                />
              </View>
              {form.sellingType === 'auction' && (
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <ValidatedField
                    isValid={form.fieldValidation.minIncrement}
                    hasValue={form.formData.minIncrement.trim() !== ''}
                    error={form.errors.minIncrement}
                  >
                    <AnimatedInput
                      placeholder="MIN BID INCREMENT (₱)"
                      value={form.formData.minIncrement}
                      keyboardType="numeric"
                      onChangeText={(t) => form.setFormData({ ...form.formData, minIncrement: t })}
                    />
                  </ValidatedField>
                </View>
              )}
            </View>

            <AnimatedInput
              placeholder="DESCRIPTION"
              value={form.formData.description}
              onChangeText={(t) => form.setFormData({ ...form.formData, description: t })}
            />

            <View style={styles.dynamicSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>ISSUES / DISCLOSURES</Text>
                <TouchableOpacity onPress={form.handleAddIssue}>
                  <Ionicons name="add-circle-outline" size={22} color="#111" />
                </TouchableOpacity>
              </View>
              {form.issues.map((issue, index) => (
                <View key={index} style={styles.issueRow}>
                  <View style={{ flex: 1 }}>
                    <AnimatedInput
                      placeholder={`ISSUE ${index + 1}`}
                      value={issue}
                      onChangeText={(t) => form.handleUpdateIssue(t, index)}
                    />
                  </View>
                  {form.issues.length > 1 && (
                    <TouchableOpacity onPress={() => form.handleRemoveIssue(index)} style={styles.removeBtn}>
                      <Ionicons name="close-outline" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

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
              label={form.sellingType === 'auction' ? 'POST AUCTION' : 'POST LISTING'}
              variant="secondary"
              size="lg"
              loading={loading}
              onPress={handlePost}
              icon={
                <Ionicons
                  name={form.sellingType === 'auction' ? 'hammer' : 'checkmark-circle'}
                  size={20}
                  color="#fff"
                />
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const Section = ({ label, children }: any) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionLabel}>{label}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: { fontFamily: 'Unbounded_700Bold', fontSize: 16, color: '#111' },
  navBtn: { padding: 4 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 60 },
  sectionContainer: { marginBottom: 32 },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageUploadCard: {
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
  imagePlaceholder: { alignItems: 'center', gap: 8 },
  imagePlaceholderText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#999' },
  imageContainer: { width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' },
  selectedImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  typeGrid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  typeCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  typeCardActive: { backgroundColor: '#000', borderColor: '#000' },
  durationCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  durationCardActive: { backgroundColor: '#111', borderColor: '#111' },
  typeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#ADB5BD' },
  typeTextActive: { color: '#fff' },
  form: { gap: 24 },
  pricingGrid: { flexDirection: 'row', alignItems: 'flex-start' },
  dynamicSection: { marginTop: 8 },
  issueRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  removeBtn: { paddingBottom: 8, paddingLeft: 10 },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  toggleLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  toggleSubtext: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#666' },
  iosPickerWrap: { backgroundColor: '#f9f9f9', borderRadius: 12, marginTop: 8, paddingBottom: 8 },
  doneBtn: { alignItems: 'center', padding: 12 },
  doneBtnText: { color: '#007AFF', fontWeight: '600' },
});