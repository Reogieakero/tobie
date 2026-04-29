import AnimatedInput from '@/components/ui/AnimatedInput';
import Button from '@/components/ui/Button';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useLoading } from '@/hooks/useLoading';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/lib/toast';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Unbounded_800ExtraBold, useFonts } from '@expo-google-fonts/unbounded';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
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
  const { isLoading, startLoading, stopLoading } = useLoading(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', 
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', 
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  let [fontsLoaded] = useFonts({ Unbounded_800ExtraBold, Inter_400Regular, Inter_500Medium });

  async function handleSignIn() {
    setErrors({ email: '', password: '' });
    if (!email || !password) {
      setErrors({ 
        email: !email ? 'Email is required.' : '', 
        password: !password ? 'Password is required.' : '' 
      });
      return;
    }

    startLoading();

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showToast("Sign In Failed", error.message, "danger");
        stopLoading();
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (e) {
      showToast("Network Error", "Check your connection.", "danger");
      stopLoading();
    }
  }

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {isLoading && <LoadingOverlay message="SIGNING IN" />}

      <View style={styles.staticBackground} pointerEvents="none">
        <View style={styles.ring1} /><View style={styles.ring2} /><View style={styles.ring3} />
        <View style={styles.blob1} /><View style={styles.blob2} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          scrollEnabled={isKeyboardVisible} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={isKeyboardVisible}
        >
          <View style={styles.logoHeader}>
            <Image 
              source={require('@/assets/images/wolf-logo-no-bg.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Welcome back{'\n'}to Tobie</Text>
            <Text style={styles.subtitle}>Sign in to continue to your auctions.</Text>
            
            <View style={styles.form}>
              <AnimatedInput 
                placeholder="Email Address" 
                value={email} 
                onChangeText={setEmail} 
                error={errors.email} 
              />
              <AnimatedInput 
                placeholder="Password" 
                secureTextEntry 
                value={password} 
                onChangeText={setPassword} 
                error={errors.password} 
              />
              <Button 
                label="Sign In" 
                onPress={handleSignIn} 
                variant="secondary" 
              />
              <Text style={styles.footerText}>
                Don't have an account? <Text style={styles.linkText} onPress={() => router.push('/(auth)/sign-up')}>Sign Up</Text>
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
  staticBackground: { ...StyleSheet.absoluteFillObject },
  ring1: { position: 'absolute', width: 420, height: 420, borderRadius: 210, borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)', top: -130, right: -110 },
  ring2: { position: 'absolute', width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', bottom: 60, left: -70 },
  ring3: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)', top: height * 0.38, right: -40 },
  blob1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.03)', bottom: 140, right: 10 },
  blob2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(0,0,0,0.025)', top: 60, left: -30 },
  scrollContent: { 
    flexGrow: 1, 
    paddingHorizontal: 16, 
    paddingTop: height * 0.08, 
    paddingBottom: 60 
  },
  logoHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 140, 
    height: 140, 
  },
  content: { width: '100%' },
  title: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 28, color: '#1A1A1A', letterSpacing: -0.5, marginBottom: 12, lineHeight: 36 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#888', marginBottom: 40, maxWidth: '80%', lineHeight: 22 },
  form: { gap: 32 },
  footerText: { fontFamily: 'Inter_400Regular', textAlign: 'center', color: '#999', fontSize: 14, marginTop: 8 },
  linkText: { color: '#000', fontFamily: 'Inter_500Medium' },
});