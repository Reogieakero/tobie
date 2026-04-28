import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Unbounded_800ExtraBold, useFonts } from '@expo-google-fonts/unbounded';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { height } = Dimensions.get('window');

const AnimatedInput = ({
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  error,
}: {
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(!secureTextEntry);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
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
          />
          {secureTextEntry && (
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
              <Ionicons name={passwordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color={isFocused ? '#000' : '#999'} />
            </TouchableOpacity>
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
};

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
    if (passwordError) setPasswordError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  async function handleSignIn() {
    if (!email || !password) {
      if (!email) setEmailError('Email is required.');
      if (!password) setPasswordError('Password is required.');
      return;
    }

    setLoading(true);
    setEmailError('');
    setPasswordError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('email not confirmed')) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email before signing in.',
          [
            { text: 'Go to Verify', onPress: () => router.push({ pathname: '/verify', params: { email } }) },
            { text: 'Cancel' },
          ]
        );
      } else if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        setEmailError('Incorrect email or password.');
        setPasswordError('Please check your credentials and try again.');
      } else {
        Alert.alert('Sign In Failed', error.message);
      }
    } else {
      // Update this line in handleSignIn
        router.replace('/home');
    }

    setLoading(false);
  }

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
          <View style={{ height: 100 }} />
          <View style={styles.content}>
            <Text style={styles.title}>Welcome back{'\n'}to Tobie</Text>
            <Text style={styles.subtitle}>Sign in to continue to your auctions.</Text>
            <View style={styles.form}>
              <AnimatedInput placeholder="Email Address" value={email} onChangeText={handleEmailChange} error={emailError} />
              <AnimatedInput placeholder="Password" secureTextEntry value={password} onChangeText={handlePasswordChange} error={passwordError} />
              <View style={styles.buttonStack}>
                <Button label={loading ? 'Signing in...' : 'Sign In'} onPress={handleSignIn} variant="secondary" disabled={loading} />
              </View>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text style={styles.linkText} onPress={() => router.push('/sign-up')}>Sign Up</Text>
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
  scrollContent: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 40 },
  content: { width: '100%' },
  title: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 28, color: '#1A1A1A', letterSpacing: -0.5, marginBottom: 12, lineHeight: 36 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#888', marginBottom: 48, maxWidth: '80%', lineHeight: 22 },
  form: { gap: 32 },
  inputWrapper: { width: '100%', height: 56, justifyContent: 'flex-end' },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  inputLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 2 },
  input: { flex: 1, fontFamily: 'Inter_500Medium', color: '#1A1A1A', fontSize: 16, paddingVertical: 6 },
  eyeIcon: { paddingLeft: 10, paddingBottom: 6 },
  baseLine: { height: 1, backgroundColor: '#E2E2E2', width: '100%' },
  animatedLine: { height: 2, backgroundColor: '#000', position: 'absolute', bottom: 0, left: 0 },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#E53935', marginTop: 6 },
  buttonStack: { marginTop: 8, gap: 16 },
  footerText: { fontFamily: 'Inter_400Regular', textAlign: 'center', color: '#999', fontSize: 14, marginTop: 8 },
  linkText: { color: '#000', fontFamily: 'Inter_500Medium' },
});