import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  children: React.ReactNode;
  isValid: boolean;
  hasValue: boolean;
  error?: string;
};

export default function ValidatedField({ children, isValid, hasValue, error }: Props) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>{children}</View>
        {hasValue && (
          <View style={styles.iconWrap}>
            {isValid ? (
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
            ) : (
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            )}
          </View>
        )}
      </View>
      {hasValue && !isValid && error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  iconWrap: { paddingBottom: 10, paddingLeft: 8 },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 2,
  },
});