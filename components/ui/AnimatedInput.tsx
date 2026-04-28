import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, KeyboardTypeOptions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AnimatedInputProps {
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  rightElement?: React.ReactNode;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions; // Added this
  maxLength?: number; // Added this
}

export default function AnimatedInput({
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  error,
  rightElement,
  editable = true,
  keyboardType = 'default',
  maxLength,
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(!secureTextEntry);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    if (!editable) return;
    setIsFocused(true);
    Animated.timing(animatedWidth, { toValue: 1, duration: 400, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedWidth, { toValue: 0, duration: 300, useNativeDriver: false }).start();
  };

  return (
    <View style={{ width: '100%' }}>
      <View style={styles.inputWrapper}>
        <Text style={[styles.inputLabel, isFocused && { color: '#000' }, !!error && { color: '#E53935' }]}>
          {placeholder}
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={secureTextEntry ? !passwordVisible : false}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value}
            onChangeText={onChangeText}
            selectionColor="#000"
            autoCapitalize="none"
            editable={editable}
            keyboardType={keyboardType}
            maxLength={maxLength}
          />
          {secureTextEntry ? (
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.rightIcon}>
              <Ionicons name={passwordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color={isFocused ? '#000' : '#999'} />
            </TouchableOpacity>
          ) : (
            rightElement && <View style={styles.rightIcon}>{rightElement}</View>
          )}
        </View>
        <View style={[styles.baseLine, !!error && { backgroundColor: '#E53935' }]} />
        <Animated.View
          style={[
            styles.animatedLine,
            { width: animatedWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
            !!error && { backgroundColor: '#E53935' },
          ]}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: { width: '100%', height: 56, justifyContent: 'flex-end' },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  inputLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 2 },
  input: { flex: 1, fontFamily: 'Inter_500Medium', color: '#1A1A1A', fontSize: 16, paddingVertical: 6 },
  rightIcon: { paddingLeft: 10, paddingBottom: 6 },
  baseLine: { height: 1, backgroundColor: '#E2E2E2', width: '100%' },
  animatedLine: { height: 2, backgroundColor: '#000', position: 'absolute', bottom: 0, left: 0 },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#E53935', marginTop: 6 },
});