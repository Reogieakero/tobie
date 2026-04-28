import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';


const ONBOARDING_KEY = 'has_seen_onboarding';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
  try {
    const AsyncStorage = (
      await import('@react-native-async-storage/async-storage')
    ).default;

    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    if (value === null) {
      // First-time user → show onboarding
      setShowOnboarding(true);
    } else {
      // Check if already logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        (router as any).replace('/home');
      } else {
        (router as any).replace('/(auth)/sign-in');
      }
    }
  } catch {
    setShowOnboarding(true);
  } finally {
    setLoading(false);
  }
};

  const handleFinish = async () => {
    try {
      const AsyncStorage = (
        await import('@react-native-async-storage/async-storage')
      ).default;
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // ignore — user can still proceed
    }
    (router as any).replace('/(auth)/sign-in');
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={handleFinish} />;
  }

  // Returning user: router.replace is already called above.
  // Render the loader briefly while navigation commits.
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});