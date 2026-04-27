import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

type IconName = 'Search' | 'Zap' | 'Trophy';

const ICON_MAP: Record<IconName, string> = {
  Search: 'search',
  Zap: 'flash',
  Trophy: 'trophy',
};

interface SlideProps {
  title: string;
  subtitle: string;
  iconName: string;
  accentShade: string;
  isActive: boolean;
}

export default function OnboardingSlide({
  title,
  subtitle,
  iconName,
  accentShade,
  isActive,
}: SlideProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  const iconNameMapped = ICON_MAP[iconName as IconName] ?? 'search';

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(32);
      scaleAnim.setValue(0.85);
    }
  }, [isActive, fadeAnim, slideAnim, scaleAnim]);

  return (
    <LinearGradient
      colors={['#FFFFFF', '#000000']}
      style={[styles.slide, { width, height }]}
    >
      <View style={styles.ring1} />
      <View style={styles.ring2} />
      <View style={styles.blob} />

      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Ionicons name={iconNameMapped as any} size={40} color={accentShade} />
      </Animated.View>

      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.divider, { backgroundColor: accentShade }]} />
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  ring1: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    top: -120,
    right: -110,
  },
  ring2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    bottom: 80,
    left: -70,
  },
  blob: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.03)',
    bottom: 160,
    right: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    backgroundColor: 'rgba(24, 23, 23, 0.7)',
    marginBottom: 44,
  },
  textContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 50,
    letterSpacing: -1,
    color: '#000000',
    marginBottom: 14,
  },
  divider: {
    width: 36,
    height: 3,
    borderRadius: 2,
    marginBottom: 18,
    opacity: 0.6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400',
    maxWidth: 290,
  },
});