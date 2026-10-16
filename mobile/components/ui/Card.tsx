import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Radius, Spacing } from '@/constants/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Adds the Meridian spotlight top-border accent */
  spotlight?: boolean;
  accentColor?: string;
  padding?: number;
}

export function Card({ children, style, spotlight, accentColor, padding }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.foreground,
          padding: padding ?? Spacing.base,
        },
        style,
      ]}
    >
      {spotlight && (
        <View
          style={[
            styles.spotlightBar,
            { backgroundColor: accentColor ?? colors.brand },
          ]}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  spotlightBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    opacity: 0.9,
  },
});
