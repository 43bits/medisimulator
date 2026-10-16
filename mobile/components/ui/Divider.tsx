import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export function Divider({ my = 8 }: { my?: number }) {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.border, marginVertical: my }} />;
}
