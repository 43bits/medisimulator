import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { API_BASE_URL } from '@/services/api';
import { Spacing, FontSize, FontWeight, Radius, moduleColorForRole } from '@/constants/tokens';

function InfoRow({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value?: string | null }) {
  const { colors } = useTheme();
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.mutedForeground} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { color: colors.subtleForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const roleColor = moduleColorForRole(user?.roleCode, colors);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
    ]);
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(p => p[0]).slice(0, 2).join('')
    : (user?.username ?? 'U').slice(0, 2).toUpperCase();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing['2xl'] }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface1, borderBottomColor: colors.border, paddingTop: insets.top + Spacing.sm }]}>
        <View style={[styles.accentBar, { backgroundColor: roleColor }]} />
        <View style={styles.headerInner}>
          <View style={[styles.avatar, { backgroundColor: roleColor + '22' }]}>
            <Text style={[styles.avatarText, { color: roleColor }]}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.foreground }]}>{user?.fullName ?? user?.username ?? 'User'}</Text>
            <Text style={[styles.username, { color: colors.mutedForeground }]}>@{user?.username}</Text>
            <View style={[styles.roleChip, { backgroundColor: roleColor + '18' }]}>
              <Text style={[styles.roleText, { color: roleColor }]}>
                {(user?.roleCode ?? 'STAFF').replace(/_/g, ' ')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ padding: Spacing.base, gap: Spacing.base }}>
        {/* Account info */}
        <Card spotlight accentColor={roleColor} padding={Spacing.md}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Account</Text>
          <Divider my={Spacing.sm} />
          <InfoRow icon="mail-outline"     label="Email"      value={user?.email} />
          <InfoRow icon="business-outline" label="Facility"   value={user?.homeFacility?.name} />
          <InfoRow icon="git-branch-outline" label="Branch"   value={user?.homeBranch?.name} />
          <InfoRow icon="globe-outline"    label="All branches" value={user?.canAccessAllBranchesInFacility ? 'Yes' : undefined} />
        </Card>

        {/* Connection info */}
        <Card padding={Spacing.md}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Connection</Text>
          <Divider my={Spacing.sm} />
          <View style={styles.infoRow}>
            <Ionicons name="server-outline" size={16} color={colors.mutedForeground} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.subtleForeground }]}>API endpoint</Text>
              <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: 'monospace', fontSize: FontSize.xs }]}>
                {API_BASE_URL}
              </Text>
            </View>
          </View>
        </Card>

        {/* Sign out */}
        <Button variant="destructive" size="lg" onPress={handleLogout}>
          Sign out
        </Button>

        <Text style={[styles.version, { color: colors.subtleForeground }]}>
          MedSimulator HMS · Mobile v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: 1, paddingBottom: Spacing.lg },
  accentBar: { height: 3, opacity: 0.9 },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.base, paddingTop: Spacing.md },
  avatar: { width: 64, height: 64, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, letterSpacing: -0.3 },
  username: { fontSize: FontSize.sm, marginTop: 2 },
  roleChip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full, marginTop: Spacing.xs },
  roleText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, letterSpacing: 0.3 },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, letterSpacing: 0.8, textTransform: 'uppercase' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: Spacing.xs },
  infoLabel: { fontSize: FontSize.xs },
  infoValue: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginTop: 1 },
  version: { fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.xs },
});
