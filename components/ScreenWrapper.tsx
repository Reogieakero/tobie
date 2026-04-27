import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  topColor?: string;
  backgroundColor?: string;
}

export function ScreenWrapper({
  children,
  style,
  topColor = '#0A0A0A',
  backgroundColor = '#0A0A0A',
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <View style={{ height: insets.top, backgroundColor: topColor }} />
      <View style={[styles.content, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, backgroundColor: '#0A0A0A' },
});