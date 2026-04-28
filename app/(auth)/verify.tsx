import Button from '@/components/ui/Button';
import { useVerify } from '@/hooks/useVerify'; // Ensure path is correct
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Unbounded_800ExtraBold, useFonts } from '@expo-google-fonts/unbounded';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { code, loading, resending, timer, inputs, handleInput, handleVerify, handleResend } = useVerify(email);

  let [fontsLoaded] = useFonts({ Unbounded_800ExtraBold, Inter_400Regular, Inter_600SemiBold });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.staticBackground} pointerEvents="none">
        <View style={styles.ring1} /><View style={styles.ring2} /><View style={styles.ring3} />
        <View style={styles.blob1} /><View style={styles.blob2} />
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <View style={styles.logoHeader}>
          <Image 
            source={require('@/assets/images/wolf-logo-no-bg.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

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

        <Button 
          label={loading ? 'Verifying...' : 'Verify Code'} 
          onPress={handleVerify} 
          variant="secondary" 
          disabled={loading || code.some(d => !d)} 
        />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resending || timer > 0}>
            <Text style={[styles.resendLink, (resending || timer > 0) && { color: '#BBB' }]}>
              {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  staticBackground: { ...StyleSheet.absoluteFillObject, zIndex: -1 },
  ring1: { position: 'absolute', width: 420, height: 420, borderRadius: 210, borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)', top: -130, right: -110 },
  ring2: { position: 'absolute', width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', bottom: 60, left: -70 },
  ring3: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)', top: height * 0.38, right: -40 },
  blob1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.03)', bottom: 140, right: 10 },
  blob2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(0,0,0,0.025)', top: 60, left: -30 },
  backButton: { marginTop: 50, marginLeft: 16, width: 40, height: 40, justifyContent: 'center', zIndex: 10 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  logoHeader: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 100, height: 100 },
  title: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 28, color: '#1A1A1A', marginBottom: 12 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#888', marginBottom: 40 },
  emailText: { color: '#000', fontFamily: 'Inter_600SemiBold' },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  codeInput: { 
    width: (width - 32 - 50) / 6, 
    height: 60, 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E2E2E2', 
    textAlign: 'center', 
    fontSize: 24, 
    fontFamily: 'Unbounded_800ExtraBold' 
  },
  activeInput: { borderColor: '#000', borderWidth: 2 },
  resendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  resendText: { fontFamily: 'Inter_400Regular', color: '#888', fontSize: 14 },
  resendLink: { fontFamily: 'Inter_600SemiBold', color: '#000', fontSize: 14 },
});