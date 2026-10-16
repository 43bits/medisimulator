import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Radius, FontSize, FontWeight, Spacing } from '@/constants/tokens';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  leftIcon,
  containerStyle,
  isPassword,
  ...props
}: InputProps) {
  const { colors, isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.row,
          {
            backgroundColor: colors.surface2,
            borderColor: error
              ? colors.destructive
              : focused
              ? colors.ring
              : colors.border,
            borderWidth: focused || error ? 1.5 : 1,
            borderRadius: Radius.lg,
          },
        ]}
      >
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={18}
            color={colors.mutedForeground}
            style={styles.leftIcon}
          />
        ) : null}
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={colors.subtleForeground}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
          style={[
            styles.input,
            {
              color: colors.foreground,
              fontSize: FontSize.base,
              paddingLeft: leftIcon ? 0 : Spacing.md,
              paddingRight: isPassword ? 44 : Spacing.md,
            },
            props.style,
          ]}
        />
        {isPassword ? (
          <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.mutedForeground}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    overflow: 'hidden',
  },
  leftIcon: { marginLeft: Spacing.md, marginRight: Spacing.sm },
  input: { flex: 1, height: '100%' },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  error: { fontSize: FontSize.xs, marginTop: 2 },
});
