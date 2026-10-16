import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  getDashboardStats,
  getNotifications,
  type DashboardStats,
  type Notification,
} from '@/services/dashboardService';
import {
  Spacing,
  FontSize,
  FontWeight,
  Radius,
  moduleColorForRole,
} from '@/constants/tokens';

// ─── KPI card ────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accent: string;
  accentSoft: string;
}
function KpiCard({ label, value, sub, icon, accent, accentSoft }: KpiCardProps) {
  const { colors } = useTheme();
  return (
    <Card spotlight accentColor={accent} style={styles.kpiCard} padding={Spacing.md}>
      <View style={styles.kpiTop}>
        <View style={[styles.kpiIconWrap, { backgroundColor: accentSoft }]}>
          <Ionicons name={icon} size={20} color={accent} />
        </View>
      </View>
      <Text style={[styles.kpiValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{label}</Text>
      {sub ? <Text style={[styles.kpiSub, { color: colors.subtleForeground }]}>{sub}</Text> : null}
    </Card>
  );
}

// ─── Quick action tile ────────────────────────────────────────────────────────
interface QuickActionProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accent: string;
  accentSoft: string;
  onPress: () => void;
}
function QuickAction({ label, icon, accent, accentSoft, onPress }: QuickActionProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.78 : 1 },
      ]}
    >
      <View style={[styles.qaIconWrap, { backgroundColor: accentSoft }]}>
        <Ionicons name={icon} size={22} color={accent} />
      </View>
      <Text style={[styles.qaLabel, { color: colors.foreground }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={14} color={colors.subtleForeground} style={styles.qaChevron} />
    </Pressable>
  );
}

// ─── Notification row ─────────────────────────────────────────────────────────
function NotifRow({ notif }: { notif: Notification }) {
  const { colors } = useTheme();
  const isCritical = notif.severity === 'CRITICAL';
  return (
    <View style={[styles.notifRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.notifDot, { backgroundColor: isCritical ? colors.destructive : colors.warning }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.notifTitle, { color: colors.foreground }]} numberOfLines={1}>
          {notif.title}
        </Text>
        {notif.message ? (
          <Text style={[styles.notifMsg, { color: colors.mutedForeground }]} numberOfLines={1}>
            {notif.message}
          </Text>
        ) : null}
      </View>
      <Badge variant={isCritical ? 'destructive' : 'warning'}>
        {isCritical ? 'Critical' : 'Warning'}
      </Badge>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [stats, setStats]         = useState<DashboardStats>({});
  const [notifs, setNotifs]       = useState<Notification[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const roleColor = moduleColorForRole(user?.roleCode, colors);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const load = useCallback(async () => {
    const [s, n] = await Promise.all([getDashboardStats(), getNotifications()]);
    setStats(s);
    setNotifs(n.slice(0, 6));
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) return <LoadingSpinner fullScreen message="Loading dashboard…" />;

  const healthBad = stats.healthStatus === 'critical' || stats.healthStatus === 'warning';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing['2xl'] }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.surface1, borderBottomColor: colors.border, paddingTop: insets.top + Spacing.sm }]}>
        <View style={[styles.accentBar, { backgroundColor: roleColor }]} />
        <View style={styles.headerInner}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting}</Text>
            <Text style={[styles.username, { color: colors.foreground }]}>
              {user?.fullName ?? user?.username ?? 'User'}
            </Text>
            {(user?.homeFacility?.name || user?.homeBranch?.name) ? (
              <Text style={[styles.scope, { color: colors.subtleForeground }]}>
                {[user?.homeFacility?.name, user?.homeBranch?.name].filter(Boolean).join(' · ')}
              </Text>
            ) : null}
          </View>
          <View style={[styles.roleChip, { backgroundColor: colors.infoSoft }]}>
            <Text style={[styles.roleText, { color: colors.info }]}>
              {(user?.roleCode ?? 'STAFF').replace(/_/g, ' ')}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.body, { paddingHorizontal: Spacing.base }]}>

        {/* ── KPI Band ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Overview</Text>
          <View style={styles.kpiGrid}>
            <KpiCard
              label="Health score"
              value={stats.healthScore ?? '—'}
              sub={stats.healthStatus ?? undefined}
              icon="pulse"
              accent={healthBad ? colors.destructive : colors.success}
              accentSoft={healthBad ? colors.destructiveSoft : colors.successSoft}
            />
            <KpiCard
              label="Open alerts"
              value={stats.openAlerts ?? 0}
              sub={stats.criticalAlerts ? `${stats.criticalAlerts} critical` : undefined}
              icon="shield-alert" // handled as alert-circle
              accent={colors.warning}
              accentSoft={colors.warningSoft}
            />
            <KpiCard
              label="Admissions"
              value={stats.activeAdmissions ?? 0}
              sub="Active inpatients"
              icon="bed"
              accent={colors.moduleInpatient}
              accentSoft={colors.infoSoft}
            />
            <KpiCard
              label="Lab queue"
              value={stats.labQueue ?? 0}
              sub="Awaiting results"
              icon="flask"
              accent={colors.moduleDiagnostics}
              accentSoft={colors.surface3}
            />
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Quick actions</Text>
          <View style={styles.qaList}>
            <QuickAction
              label="Patients"
              icon="people"
              accent={colors.moduleClinical}
              accentSoft={colors.infoSoft}
              onPress={() => router.push('/(tabs)/patients')}
            />
            <QuickAction
              label="Appointments"
              icon="calendar"
              accent={colors.moduleClinical}
              accentSoft={colors.infoSoft}
              onPress={() => router.push('/(tabs)/appointments')}
            />
            <QuickAction
              label="Online Booking Requests"
              icon="globe-outline"
              accent={colors.moduleOperations}
              accentSoft={colors.warningSoft}
              onPress={() => router.push('/(tabs)/appointments')}
            />
            <QuickAction
              label="Account & Settings"
              icon="person-circle"
              accent={colors.moduleAdmin}
              accentSoft={colors.surface3}
              onPress={() => router.push('/(tabs)/profile')}
            />
          </View>
        </View>

        {/* ── Alerts ── */}
        {notifs.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Active alerts</Text>
            <Card padding={0} style={{ overflow: 'hidden' }}>
              {notifs.map((n, i) => (
                <NotifRow key={n.id ?? i} notif={n} />
              ))}
            </Card>
          </View>
        ) : (
          <View style={[styles.nominalBanner, { backgroundColor: colors.successSoft, borderColor: colors.success }]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={[styles.nominalText, { color: colors.success }]}>
              All systems nominal — no active alerts
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: 1, paddingBottom: Spacing.md },
  accentBar: { height: 3, opacity: 0.9 },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  greeting: { fontSize: FontSize.sm },
  username: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, letterSpacing: -0.3 },
  scope: { fontSize: FontSize.xs, marginTop: 2 },
  roleChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, marginTop: 4 },
  roleText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, letterSpacing: 0.3 },
  body: { paddingTop: Spacing.lg, gap: Spacing.xl },
  section: { gap: Spacing.sm },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  kpiCard: { width: '47.5%', minWidth: 140 },
  kpiTop: { marginBottom: Spacing.xs },
  kpiIconWrap: { width: 36, height: 36, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, letterSpacing: -0.5 },
  kpiLabel: { fontSize: FontSize.sm, marginTop: 2 },
  kpiSub: { fontSize: FontSize.xs, marginTop: 1, textTransform: 'capitalize' },
  qaList: { gap: Spacing.sm },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  qaIconWrap: { width: 40, height: 40, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.medium },
  qaChevron: { marginLeft: 'auto' },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  notifDot: { width: 8, height: 8, borderRadius: Radius.full },
  notifTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  notifMsg: { fontSize: FontSize.xs, marginTop: 1 },
  nominalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  nominalText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
});
