import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { FontSize } from '@/constants/tokens';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen }: LoadingSpinnerProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, { backgroundColor: fullScreen ? colors.background : undefined }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <Text style={[styles.message, { color: colors.mutedForeground }]}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  fullScreen: { flex: 1 },
  message: { fontSize: FontSize.sm, textAlign: 'center' },
});
