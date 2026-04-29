import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useLoading } from '@/hooks/useLoading';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';

const ONBOARDING_KEY = 'has_seen_onboarding';

export default function Index() {
  const { isLoading, stopLoading } = useLoading(true);
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
        stopLoading();
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
      stopLoading();
    }
  };

  const handleFinish = async () => {
    try {
      const AsyncStorage = (
        await import('@react-native-async-storage/async-storage')
      ).default;
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {}
    router.replace('/(auth)/sign-in');
  };

  if (isLoading) return <LoadingOverlay message="INITIALIZING" />;
  if (showOnboarding) return <OnboardingScreen onFinish={handleFinish} />;

  return <LoadingOverlay />;
}