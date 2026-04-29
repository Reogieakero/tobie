import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

interface ApplyStateProps {
  isPressed: boolean;
  handlePressIn: () => void;
  handlePressOut: () => void;
  fillHeight: Animated.AnimatedInterpolation<string | number>;
}

export const ApplyState = ({ isPressed, handlePressIn, handlePressOut, fillHeight }: ApplyStateProps) => {
  return (
    <View style={styles.content}>
      <View style={styles.iconCircle}>
        <Ionicons name="briefcase-outline" size={40} color="#111" />
      </View>
      <Text style={styles.title}>Start Selling Today</Text>
      <Text style={styles.description}>
        Join our community of elite sellers. Opening a shop allows you to list items and manage auctions.
      </Text>

      <View style={styles.actionContainer}>
        <Text style={styles.holdHint}>Hold to start application</Text>
        <View style={styles.holdContainer}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={({ pressed }) => [
              styles.circleButton,
              pressed && styles.circleButtonPressed,
            ]}
          >
            <Animated.View style={[styles.fill, { height: fillHeight }]} />
            <View style={styles.buttonContent}>
              <Ionicons
                name={isPressed ? 'timer-outline' : 'finger-print'}
                size={32}
                color={isPressed ? '#fff' : '#111'}
              />
              <Text style={[styles.holdText, isPressed && { color: '#fff' }]}>
                {isPressed ? 'HOLDING' : 'START'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default ApplyState;

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  iconCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontFamily: 'Unbounded_700Bold', fontSize: 20, color: '#111', textAlign: 'center', marginBottom: 12 },
  description: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  actionContainer: { alignItems: 'center', width: '100%' },
  holdHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#AAA', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 28 },
  holdContainer: { alignItems: 'center' },
  circleButton: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#fff', borderWidth: 2, borderColor: '#111', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  circleButtonPressed: { transform: [{ scale: 0.96 }] },
  buttonContent: { alignItems: 'center', zIndex: 2 },
  fill: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#111', zIndex: 1 },
  holdText: { fontFamily: 'Unbounded_700Bold', fontSize: 10, marginTop: 6, color: '#111' },
});