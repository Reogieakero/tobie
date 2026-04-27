import Button from '@/components/ui/Button';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Unbounded_800ExtraBold, useFonts } from '@expo-google-fonts/unbounded';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
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

const AnimatedInput = ({ placeholder, secureTextEntry }: { placeholder: string; secureTextEntry?: boolean }) => {
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
    <View style={styles.inputWrapper}>
      <Text style={[styles.inputLabel, isFocused && { color: '#000' }]}>{placeholder}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={secureTextEntry ? !passwordVisible : false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor="#000"
          autoCapitalize="none"
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
            <Ionicons name={passwordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color={isFocused ? '#000' : '#999'} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.baseLine} />
      <Animated.View style={[styles.animatedLine, { width: animatedWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
    </View>
  );
};

export default function SignInScreen() {
  const router = useRouter();
  let [fontsLoaded] = useFonts({ Unbounded_800ExtraBold, Inter_400Regular, Inter_500Medium });
  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.staticBackground} pointerEvents="none">
        <View style={styles.ring1} /><View style={styles.ring2} /><View style={styles.ring3} />
        <View style={styles.blob1} /><View style={styles.blob2} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flexFill}>
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={true} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.spacer} />
          <View style={styles.content}>
            <Text style={styles.title}>Welcome back{'\n'}to Tobie</Text>
            <Text style={styles.subtitle}>Sign in to continue to your auctions.</Text>
            <View style={styles.form}>
              <AnimatedInput placeholder="Email Address" />
              <AnimatedInput placeholder="Password" secureTextEntry />
              <View style={styles.buttonStack}>
                <Button label="Sign In" onPress={() => {}} variant="secondary" />
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} /><Text style={styles.dividerText}>OR</Text><View style={styles.dividerLine} />
                </View>
                <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
                  <Ionicons name="logo-google" size={18} color="#000" />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.footerText}>
                Don't have an account? <Text style={styles.linkText} onPress={() => router.push('/sign-up')}>Sign Up</Text>
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
  flexFill: { flex: 1 },
  staticBackground: { ...StyleSheet.absoluteFillObject, zIndex: -1 },
  ring1: { position: 'absolute', width: 420, height: 420, borderRadius: 210, borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)', top: -130, right: -110 },
  ring2: { position: 'absolute', width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', bottom: 60, left: -70 },
  ring3: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)', top: height * 0.38, right: -40 },
  blob1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.03)', bottom: 140, right: 10 },
  blob2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(0,0,0,0.025)', top: 60, left: -30 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 40 },
  spacer: { flex: 1 },
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
  buttonStack: { marginTop: 8, gap: 16 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EAEAEA' },
  dividerText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#BBB', paddingHorizontal: 12, letterSpacing: 1 },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 16, borderWidth: 1, borderColor: '#E2E2E2', backgroundColor: '#FFF', gap: 12 },
  googleButtonText: { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#1A1A1A' },
  footerText: { fontFamily: 'Inter_400Regular', textAlign: 'center', color: '#999', fontSize: 14, marginTop: 8 },
  linkText: { color: '#000', fontFamily: 'Inter_500Medium' },
});