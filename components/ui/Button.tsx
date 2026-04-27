import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { paddingVertical: 10, paddingHorizontal: 20 },
  md: { paddingVertical: 14, paddingHorizontal: 28 },
  lg: { paddingVertical: 17, paddingHorizontal: 36 },
};

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: '#FFFFFF' },
  secondary: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.25)',
  },
  ghost: { backgroundColor: 'transparent' },
};

const labelSizeStyles: Record<Size, TextStyle> = {
  sm: { fontSize: 13 },
  md: { fontSize: 15 },
  lg: { fontSize: 16 },
};

const labelVariantStyles: Record<Variant, TextStyle> = {
  primary: { color: '#0A0A0A' },
  secondary: { color: '#FFFFFF' },
  ghost: { color: 'rgba(255,255,255,0.45)' },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'right',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#000000' : '#FFFFFF'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View>{icon}</View>}
          <Text
            style={[
              styles.label,
              labelSizeStyles[size],
              labelVariantStyles[variant],
              textStyle,
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && <View>{icon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.4,
  },
});