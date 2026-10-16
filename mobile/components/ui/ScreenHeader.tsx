import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { FontSize, FontWeight, Spacing } from '@/constants/tokens';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, accentColor, right }: ScreenHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.surface1,
          borderBottomColor: colors.border,
          paddingTop: insets.top + Spacing.sm,
        },
      ]}
    >
      {/* Spotlight accent bar */}
      <View
        style={[
          styles.accentBar,
          { backgroundColor: accentColor ?? colors.brand },
        ]}
      />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
          ) : null}
        </View>
        {right ?? null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    gap: 0,
  },
  accentBar: {
    height: 3,
    marginHorizontal: -Spacing.base,
    marginBottom: Spacing.sm,
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
});
