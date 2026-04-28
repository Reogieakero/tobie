import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Unbounded_800ExtraBold, useFonts } from '@expo-google-fonts/unbounded';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AnimatedInput from '@/components/ui/AnimatedInput';
import Button from '@/components/ui/Button';
import { useSignUp } from '@/hooks/useSignUp';

const { height } = Dimensions.get('window');

const ValidationItem = ({ label, met }: { label: string; met: boolean }) => (
  <View style={styles.validationRow}>
    <Ionicons name={met ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={met ? '#4CAF50' : '#BBB'} />
    <Text style={[styles.validationText, met && { color: '#666' }]}>{label}</Text>
  </View>
);

export default function SignUpScreen() {
  const router = useRouter();
  const { 
    email, setEmail, password, setPassword, confirmPassword, setConfirmPassword,
    loading, emailError, setEmailError, validation, handleSignUp 
  } = useSignUp();
  
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  let [fontsLoaded] = useFonts({ Unbounded_800ExtraBold, Inter_400Regular, Inter_500Medium });
  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.staticBackground} pointerEvents="none">
        <View style={styles.ring1} /><View style={styles.ring2} /><View style={styles.ring3} />
        <View style={styles.blob1} /><View style={styles.blob2} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={isKeyboardVisible}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.signUpSpacer} />
          <View style={styles.content}>
            <Text style={styles.title}>Create your{'\n'}Account</Text>
            <Text style={styles.subtitle}>Join Tobie and start bidding on exclusive items.</Text>
            
            <View style={styles.form}>
              <AnimatedInput 
                placeholder="Email Address" 
                value={email} 
                onChangeText={(t) => { setEmail(t); setEmailError(''); }} 
                error={emailError} 
              />
              
              <View>
                <AnimatedInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
                <View style={styles.validationContainer}>
                  <ValidationItem label="At least 8 characters" met={validation.length} />
                  <ValidationItem label="Contains a number" met={validation.number} />
                </View>
              </View>

              <View>
                <AnimatedInput placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
                <View style={styles.validationContainer}>
                  <ValidationItem label="Passwords match" met={validation.match} />
                </View>
              </View>

              <View style={styles.buttonStack}>
                <Button
                  label={loading ? 'Please wait...' : 'Create Account'}
                  onPress={handleSignUp}
                  variant="secondary"
                  disabled={loading || !Object.values(validation).every(Boolean)}
                />
              </View>

              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text style={styles.linkText} onPress={() => router.push('/sign-in')}>Sign In</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 40 },
  signUpSpacer: { height: 60 },
  content: { width: '100%' },
  title: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 28, color: '#1A1A1A', letterSpacing: -0.5, marginBottom: 12, lineHeight: 36 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#888', marginBottom: 32, maxWidth: '85%', lineHeight: 22 },
  form: { gap: 28 },
  validationContainer: { marginTop: 8, gap: 4 },
  validationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  validationText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#BBB' },
  buttonStack: { marginTop: 12, gap: 16 },
  footerText: { fontFamily: 'Inter_400Regular', textAlign: 'center', color: '#999', fontSize: 14, marginTop: 8 },
  linkText: { color: '#000', fontFamily: 'Inter_500Medium' },
});