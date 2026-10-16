import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Radius, FontSize, FontWeight, Spacing } from '@/constants/tokens';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();

  const bgMap: Record<Variant, string> = {
    primary:     colors.primary,
    secondary:   colors.secondary,
    outline:     'transparent',
    ghost:       'transparent',
    destructive: colors.destructive,
  };

  const textColorMap: Record<Variant, string> = {
    primary:     colors.primaryForeground,
    secondary:   colors.secondaryForeground,
    outline:     colors.primary,
    ghost:       colors.mutedForeground,
    destructive: colors.destructiveForeground,
  };

  const borderColorMap: Record<Variant, string> = {
    primary:     colors.primary,
    secondary:   colors.secondary,
    outline:     colors.border,
    ghost:       'transparent',
    destructive: colors.destructive,
  };

  const heightMap: Record<Size, number> = { sm: 36, md: 44, lg: 52 };
  const fontSizeMap: Record<Size, number> = { sm: FontSize.sm, md: FontSize.base, lg: FontSize.md };
  const paddingMap: Record<Size, number> = { sm: Spacing.md, md: Spacing.base, lg: Spacing.lg };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          height: heightMap[size],
          paddingHorizontal: paddingMap[size],
          backgroundColor: bgMap[variant],
          borderColor: borderColorMap[variant],
          borderWidth: variant === 'outline' ? 1 : 0,
          borderRadius: Radius.lg,
          opacity: isDisabled ? 0.5 : pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColorMap[variant]} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: textColorMap[variant],
              fontSize: fontSizeMap[size],
              fontWeight: FontWeight.semibold,
            },
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    letterSpacing: 0.1,
  },
});
