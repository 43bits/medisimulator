import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/services/api';
import { Spacing, FontSize, FontWeight, Radius } from '@/constants/tokens';

export default function LoginScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleLogin() {
    if (!username.trim()) { setError('Username is required.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password.trim());
      router.replace('/(tabs)/dashboard');
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Login failed. Check your credentials.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + Spacing['3xl'], paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand mark */}
        <View style={styles.brandRow}>
          <View style={[styles.brandIcon, { backgroundColor: colors.brand }]}>
            <Ionicons name="pulse" size={26} color="#fff" />
          </View>
          <View>
            <Text style={[styles.brandName, { color: colors.foreground }]}>
              MedSimulator
            </Text>
            <Text style={[styles.brandTagline, { color: colors.mutedForeground }]}>
              Hospital OS
            </Text>
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headlineBlock}>
          <Text style={[styles.headline, { color: colors.foreground }]}>
            Welcome back
          </Text>
          <Text style={[styles.subheadline, { color: colors.mutedForeground }]}>
            Sign in with your facility credentials
          </Text>
        </View>

        {/* Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface1,
              borderColor: colors.border,
              shadowColor: colors.foreground,
            },
          ]}
        >
          {/* Spotlight accent bar */}
          <View style={[styles.accentBar, { backgroundColor: colors.brand }]} />

          <View style={styles.cardInner}>
            <View style={[styles.secureChip, { backgroundColor: colors.infoSoft }]}>
              <Ionicons name="shield-checkmark-outline" size={13} color={colors.info} />
              <Text style={[styles.secureText, { color: colors.info }]}>
                Secure staff access
              </Text>
            </View>

            <View style={styles.fields}>
              <Input
                label="Username"
                placeholder="e.g. admin"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="person-outline"
                value={username}
                onChangeText={setUsername}
                onSubmitEditing={handleLogin}
                returnKeyType="next"
              />
              <Input
                label="Password"
                placeholder="Enter your password"
                isPassword
                leftIcon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleLogin}
                returnKeyType="go"
              />
            </View>

            {error ? (
              <View style={[styles.errorBanner, { backgroundColor: colors.destructiveSoft, borderColor: colors.destructive }]}>
                <Ionicons name="alert-circle-outline" size={15} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
              </View>
            ) : null}

            <Button
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={styles.submitBtn}
            >
              Sign in
            </Button>

            <View style={styles.hintRow}>
              <Ionicons name="information-circle-outline" size={14} color={colors.subtleForeground} />
              <Text style={[styles.hintText, { color: colors.subtleForeground }]}>
                Use your facility-issued username and password
              </Text>
            </View>
          </View>
        </View>

        {/* Feature highlights */}
        <View style={styles.highlights}>
          {HIGHLIGHTS.map((h) => (
            <View
              key={h.label}
              style={[styles.highlightChip, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name={h.icon as any} size={15} color={colors.brand} />
              <Text style={[styles.highlightLabel, { color: colors.mutedForeground }]}>{h.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const HIGHLIGHTS = [
  { icon: 'people-outline',     label: 'Patient flow' },
  { icon: 'flask-outline',      label: 'Laboratory' },
  { icon: 'medical-outline',    label: 'Pharmacy' },
  { icon: 'card-outline',       label: 'Billing' },
];

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    gap: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  headlineBlock: { gap: 4 },
  headline: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: FontSize.base,
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  accentBar: {
    height: 3,
    opacity: 0.9,
  },
  cardInner: {
    padding: Spacing.lg,
    gap: Spacing.base,
  },
  secureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  secureText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.4,
  },
  fields: { gap: Spacing.md },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  errorText: { flex: 1, fontSize: FontSize.sm },
  submitBtn: { marginTop: Spacing.xs },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    justifyContent: 'center',
  },
  hintText: { fontSize: FontSize.xs, textAlign: 'center' },
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  highlightLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
});
