import AnimatedInput from '@/components/ui/AnimatedInput';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Unbounded_800ExtraBold, useFonts } from '@expo-google-fonts/unbounded';
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

const { height } = Dimensions.get('window');

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  let [fontsLoaded] = useFonts({ Unbounded_800ExtraBold, Inter_400Regular, Inter_500Medium });

  async function handleSignIn() {
    setErrors({ email: '', password: '' });
    if (!email || !password) {
      setErrors({ email: !email ? 'Email is required.' : '', password: !password ? 'Password is required.' : '' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showToast("Sign In Failed", error.message, "danger");
      } else {
        router.replace('/home');
      }
    } catch (e) {
      showToast("Network Error", "Check your connection.", "danger");
    } finally {
      setLoading(false);
    }
  }

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.staticBackground} pointerEvents="none">
        <View style={styles.ring1} /><View style={styles.ring2} /><View style={styles.ring3} />
        <View style={styles.blob1} /><View style={styles.blob2} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={isKeyboardVisible} showsVerticalScrollIndicator={false}>
          <View style={{ height: 100 }} />
          <View style={styles.content}>
            <Text style={styles.title}>Welcome back{'\n'}to Tobie</Text>
            <Text style={styles.subtitle}>Sign in to continue to your auctions.</Text>
            <View style={styles.form}>
              <AnimatedInput placeholder="Email Address" value={email} onChangeText={setEmail} error={errors.email} />
              <AnimatedInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} error={errors.password} />
              <Button label={loading ? 'Signing in...' : 'Sign In'} onPress={handleSignIn} variant="secondary" disabled={loading} />
              <Text style={styles.footerText}>Don't have an account? <Text style={styles.linkText} onPress={() => router.push('/sign-up')}>Sign Up</Text></Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  staticBackground: { ...StyleSheet.absoluteFillObject },
  ring1: { position: 'absolute', width: 420, height: 420, borderRadius: 210, borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)', top: -130, right: -110 },
  ring2: { position: 'absolute', width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', bottom: 60, left: -70 },
  ring3: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)', top: height * 0.38, right: -40 },
  blob1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.03)', bottom: 140, right: 10 },
  blob2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(0,0,0,0.025)', top: 60, left: -30 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 40 },
  content: { width: '100%' },
  title: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 28, color: '#1A1A1A', letterSpacing: -0.5, marginBottom: 12, lineHeight: 36 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#888', marginBottom: 48, maxWidth: '80%', lineHeight: 22 },
  form: { gap: 32 },
  footerText: { fontFamily: 'Inter_400Regular', textAlign: 'center', color: '#999', fontSize: 14, marginTop: 8 },
  linkText: { color: '#000', fontFamily: 'Inter_500Medium' },
});