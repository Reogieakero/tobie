import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Unbounded_800ExtraBold, useFonts } from '@expo-google-fonts/unbounded';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const RESEND_COOLDOWN = 60;

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<Array<TextInput | null>>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  let [fontsLoaded] = useFonts({ Unbounded_800ExtraBold, Inter_400Regular, Inter_600SemiBold });

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInput = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  async function handleVerify() {
    if (!email) { Alert.alert('Error', 'No email found for verification.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email as string,
      token: code.join(''),
      type: 'signup',
    });

    if (error) {
      Alert.alert('Verification Failed', error.message);
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } else {
      // Sign out after verification so user must sign in with their credentials
      await supabase.auth.signOut();
      Alert.alert(
        '✓ Email Verified!',
        'Your account is ready. Please sign in to continue.',
        [{ text: 'Sign In', onPress: () => router.replace('/sign-in') }]
      );
    }
    setLoading(false);
  }

  async function handleResend() {
    if (!email || cooldown > 0) return;
    setResending(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email: email as string });
    setResending(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
      startCooldown();
      Alert.alert('Code Sent', `A new verification code was sent to ${email}`);
    }
  }

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.emailText}>{email}</Text>
        </Text>
        <View style={styles.codeContainer}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              style={[styles.codeInput, digit ? styles.activeInput : null]}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(text) => handleInput(text, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
            />
          ))}
        </View>
        <Button
          label={loading ? 'Verifying...' : 'Verify Code'}
          onPress={handleVerify}
          variant="secondary"
          disabled={loading || code.some((d) => !d)}
        />
        <View style={styles.resendContainer}>
          <Text style={styles.resendLabel}>Didn't receive a code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={cooldown > 0 || resending}>
            <Text style={[styles.resendLink, (cooldown > 0 || resending) && styles.resendDisabled]}>
              {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', paddingHorizontal: 24 },
  backButton: { marginTop: 60, width: 40, height: 40, justifyContent: 'center' },
  content: { flex: 1, paddingTop: 40 },
  title: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 28, color: '#1A1A1A', marginBottom: 12 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#888', lineHeight: 24, marginBottom: 40 },
  emailText: { color: '#000', fontFamily: 'Inter_600SemiBold' },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  codeInput: {
    width: (width - 48 - 50) / 6,
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Unbounded_800ExtraBold',
    color: '#1A1A1A',
  },
  activeInput: { borderColor: '#000', borderWidth: 2 },
  resendContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  resendLabel: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#999' },
  resendLink: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#000' },
  resendDisabled: { color: '#BBB' },
});