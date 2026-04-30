import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AnimatedInput from '@/components/ui/AnimatedInput';

type Props = {
  startTimeType: 'now' | 'future';
  endTimeType: 'specific' | 'duration';
  duration: string;
  scheduledStartDate: Date;
  scheduledEndDate: Date;
  onStartTimeTypeChange: (v: 'now' | 'future') => void;
  onEndTimeTypeChange: (v: 'specific' | 'duration') => void;
  onDurationChange: (v: string) => void;
  onStartDateChange: (d: Date) => void;
  onEndDateChange: (d: Date) => void;
};

const DURATIONS = ['5', '10', '60'];

export default function AuctionScheduler({
  startTimeType,
  endTimeType,
  duration,
  scheduledStartDate,
  scheduledEndDate,
  onStartTimeTypeChange,
  onEndTimeTypeChange,
  onDurationChange,
  onStartDateChange,
  onEndDateChange,
}: Props) {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const openAndroidPicker = (mode: 'start' | 'end') => {
    const currentValue = mode === 'start' ? scheduledStartDate : scheduledEndDate;
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
                if (mode === 'start') onStartDateChange(dateTime);
                else onEndDateChange(dateTime);
              }
            },
          });
        }
      },
      minimumDate: mode === 'end' ? scheduledStartDate : new Date(),
    });
  };

  const formatDate = (d: Date) =>
    d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* START TIME */}
      <Section label="START TIME">
        <View style={styles.grid}>
          <ToggleCard
            label="RIGHT NOW"
            active={startTimeType === 'now'}
            onPress={() => onStartTimeTypeChange('now')}
          />
          <ToggleCard
            label={startTimeType === 'future' ? formatDate(scheduledStartDate) : 'SCHEDULE START'}
            active={startTimeType === 'future'}
            onPress={() => {
              onStartTimeTypeChange('future');
              if (Platform.OS === 'android') openAndroidPicker('start');
              else setShowStartPicker(true);
            }}
          />
        </View>
        {Platform.OS === 'ios' && showStartPicker && (
          <IOSPicker
            value={scheduledStartDate}
            minimumDate={new Date()}
            onChange={(d) => onStartDateChange(d)}
            onDone={() => setShowStartPicker(false)}
          />
        )}
      </Section>

      {/* END TIME / DURATION */}
      <Section label="END TIME / DURATION">
        <View style={styles.grid}>
          <ToggleCard
            label="USE DURATION"
            active={endTimeType === 'duration'}
            onPress={() => onEndTimeTypeChange('duration')}
          />
          <ToggleCard
            label={endTimeType === 'specific' ? formatDate(scheduledEndDate) : 'PICK END TIME'}
            active={endTimeType === 'specific'}
            onPress={() => {
              onEndTimeTypeChange('specific');
              if (Platform.OS === 'android') openAndroidPicker('end');
              else setShowEndPicker(true);
            }}
          />
        </View>

        {endTimeType === 'duration' ? (
          <View style={{ marginTop: 12 }}>
            <View style={styles.grid}>
              {DURATIONS.map((mins) => (
                <ToggleCard
                  key={mins}
                  label={`${mins} MINS`}
                  active={duration === mins}
                  onPress={() => onDurationChange(mins)}
                />
              ))}
            </View>
            <View style={{ marginTop: 12 }}>
              <AnimatedInput
                placeholder="CUSTOM DURATION (MINUTES)"
                value={duration}
                keyboardType="numeric"
                onChangeText={onDurationChange}
              />
            </View>
          </View>
        ) : (
          Platform.OS === 'ios' &&
          showEndPicker && (
            <IOSPicker
              value={scheduledEndDate}
              minimumDate={scheduledStartDate}
              onChange={(d) => onEndDateChange(d)}
              onDone={() => setShowEndPicker(false)}
            />
          )
        )}
      </Section>
    </>
  );
}

// Sub-components local to this file
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ToggleCard({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.card, active && styles.cardActive]}
      onPress={onPress}
    >
      <Text style={[styles.cardText, active && styles.cardTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function IOSPicker({
  value,
  minimumDate,
  onChange,
  onDone,
}: {
  value: Date;
  minimumDate: Date;
  onChange: (d: Date) => void;
  onDone: () => void;
}) {
  return (
    <View style={styles.iosPickerWrap}>
      <DateTimePicker
        value={value}
        mode="datetime"
        display="spinner"
        minimumDate={minimumDate}
        onChange={(_, date) => { if (date) onChange(date); }}
      />
      <TouchableOpacity onPress={onDone} style={styles.doneBtn}>
        <Text style={styles.doneBtnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 32 },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  grid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  cardActive: { backgroundColor: '#111', borderColor: '#111' },
  cardText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#ADB5BD' },
  cardTextActive: { color: '#fff' },
  iosPickerWrap: { backgroundColor: '#f9f9f9', borderRadius: 12, marginTop: 8, paddingBottom: 8 },
  doneBtn: { alignItems: 'center', padding: 12 },
  doneBtnText: { color: '#007AFF', fontWeight: '600' },
});