import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Unbounded_800ExtraBold, useFonts } from '@expo-google-fonts/unbounded';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  let [fontsLoaded] = useFonts({ Unbounded_800ExtraBold, Inter_400Regular, Inter_600SemiBold });

  const handleInput = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) inputs.current[index + 1]?.focus();
  };

  async function handleVerify() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email: email as string, token: code.join(''), type: 'signup' });
      if (error) {
        showToast("Invalid Code", error.message, "danger");
        setCode(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      } else {
        await supabase.auth.signOut();
        showToast("Verified", "Please sign in.", "success");
        router.replace('/sign-in');
      }
    } catch (e) {
      showToast("Error", "Something went wrong.", "danger");
    } finally {
      setLoading(false);
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
        <Text style={styles.subtitle}>Sent code to <Text style={styles.emailText}>{email}</Text></Text>
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
            />
          ))}
        </View>
        <Button label={loading ? 'Verifying...' : 'Verify Code'} onPress={handleVerify} variant="secondary" disabled={loading || code.some(d => !d)} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', paddingHorizontal: 24 },
  backButton: { marginTop: 60, width: 40, height: 40, justifyContent: 'center' },
  content: { flex: 1, paddingTop: 40 },
  title: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 28, color: '#1A1A1A', marginBottom: 12 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#888', marginBottom: 40 },
  emailText: { color: '#000', fontFamily: 'Inter_600SemiBold' },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  codeInput: { width: (width - 48 - 50) / 6, height: 60, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E2E2', textAlign: 'center', fontSize: 24, fontFamily: 'Unbounded_800ExtraBold' },
  activeInput: { borderColor: '#000', borderWidth: 2 },
});