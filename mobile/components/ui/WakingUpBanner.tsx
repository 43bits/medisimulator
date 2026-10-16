/**
 * WakingUpBanner
 * Shown automatically whenever a request to the Render backend is taking
 * longer than SLOW_REQUEST_MS (4 s). Handles Render free-tier cold starts.
 *
 * Drop it once at the top of any screen that makes API calls:
 *   <WakingUpBanner />
 *
 * Or wrap it in the root layout so it appears globally:
 *   // app/_layout.tsx  →  <WakingUpBanner position="top" />
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onSlowRequest } from '@/services/api';
import { useTheme } from '@/context/ThemeContext';
import { FontSize, FontWeight, Spacing, Radius } from '@/constants/tokens';

interface WakingUpBannerProps {
  /** 'top' slides in from below the status bar; 'bottom' sits above the tab bar */
  position?: 'top' | 'bottom';
}

export function WakingUpBanner({ position = 'bottom' }: WakingUpBannerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [slow, setSlow] = useState(false);
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => onSlowRequest(setSlow), []);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: slow ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [slow, opacity]);

  if (!slow) return null;

  const positionStyle =
    position === 'top'
      ? { top: insets.top + Spacing.sm }
      : { bottom: insets.bottom + 70 }; // above tab bar

  return (
    <Animated.View
      style={[
        styles.banner,
        positionStyle,
        {
          backgroundColor: colors.warningSoft,
          borderColor: colors.warning,
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <ActivityIndicator size="small" color={colors.warning} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.warning }]}>
          Waking up server…
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          The server was idle and is starting up. This takes ~30–60 s.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    zIndex: 999,
    // Shadow
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  sub: {
    fontSize: FontSize.xs,
    marginTop: 1,
  },
});
