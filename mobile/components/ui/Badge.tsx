import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Radius, FontSize, FontWeight } from '@/constants/tokens';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  /** override bg/text manually */
  bg?: string;
  textColor?: string;
}

export function Badge({ children, variant = 'default', bg, textColor }: BadgeProps) {
  const { colors } = useTheme();

  const bgMap: Record<BadgeVariant, string> = {
    default:     colors.secondary,
    success:     colors.successSoft,
    warning:     colors.warningSoft,
    destructive: colors.destructiveSoft,
    info:        colors.infoSoft,
    outline:     'transparent',
  };

  const textMap: Record<BadgeVariant, string> = {
    default:     colors.secondaryForeground,
    success:     colors.success,
    warning:     colors.warning,
    destructive: colors.destructive,
    info:        colors.info,
    outline:     colors.mutedForeground,
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg ?? bgMap[variant],
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.text, { color: textColor ?? textMap[variant] }]}>
        {children}
      </Text>
    </View>
  );
}

function statusToBadgeVariant(status: string): BadgeVariant {
  const s = status.toUpperCase();
  if (['CONFIRMED', 'COMPLETED', 'PAID', 'DISPENSED', 'ACTIVE'].includes(s)) return 'success';
  if (['PENDING', 'IN_PROGRESS', 'WAITING', 'PENDING_INSURANCE'].includes(s)) return 'warning';
  if (['REJECTED', 'CANCELLED', 'LOCKED', 'FAILED'].includes(s)) return 'destructive';
  if (['DRAFT', 'SCHEDULED'].includes(s)) return 'info';
  return 'default';
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusToBadgeVariant(status)}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
