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

      const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);

      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/sign-in');
      }
    } catch (error) {
      router.replace('/(auth)/sign-in');
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
    } catch (e) {
      // Fail silently to allow user entry
    }
    router.replace('/(auth)/sign-in');
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