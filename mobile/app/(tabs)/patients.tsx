import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, RefreshControl, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getPatients, type Patient } from '@/services/patientService';
import { Spacing, FontSize, FontWeight, Radius } from '@/constants/tokens';

function PatientCard({ item }: { item: Patient }) {
  const { colors } = useTheme();
  const age = item.dateOfBirth
    ? Math.floor((Date.now() - new Date(item.dateOfBirth).getTime()) / 3.156e10)
    : null;
  return (
    <Card spotlight accentColor={colors.moduleClinical} style={styles.card} padding={Spacing.md}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: colors.infoSoft }]}>
          <Text style={[styles.avatarText, { color: colors.brand }]}>
            {item.firstName[0]}{item.lastName[0]}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {item.firstName} {item.middleName ? `${item.middleName} ` : ''}{item.lastName}
          </Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            {item.patientNumber}{age != null ? ` · ${age}y` : ''}{item.gender ? ` · ${item.gender}` : ''}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.subtleForeground} />
      </View>
      {item.phonePrimary ? (
        <View style={styles.phoneRow}>
          <Ionicons name="call-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.phone, { color: colors.mutedForeground }]}>{item.phonePrimary}</Text>
        </View>
      ) : null}
    </Card>
  );
}

export default function PatientsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (q = '') => {
    const res = await getPatients({ search: q || undefined, take: 40 }).catch(() => ({ data: [], total: 0 }));
    setPatients(res.data); setTotal(res.total);
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(search); setRefreshing(false); };
  const onSearch = (v: string) => { setSearch(v); load(v); };

  if (loading) return <LoadingSpinner fullScreen message="Loading patients…" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.surface1, borderBottomColor: colors.border, paddingTop: insets.top + Spacing.sm }]}>
        <View style={[styles.accentBar, { backgroundColor: colors.moduleClinical }]} />
        <View style={{ paddingHorizontal: Spacing.base, paddingBottom: Spacing.md, gap: Spacing.sm }}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.foreground }]}>Patients</Text>
            <View style={[styles.chip, { backgroundColor: colors.infoSoft }]}>
              <Text style={[styles.chipText, { color: colors.info }]}>{total}</Text>
            </View>
          </View>
          <View style={[styles.searchBar, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
            <TextInput
              value={search}
              onChangeText={onSearch}
              placeholder="Search by name, phone, or ID…"
              placeholderTextColor={colors.subtleForeground}
              style={[styles.searchInput, { color: colors.foreground }]}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search ? (
              <Pressable onPress={() => onSearch('')}>
                <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
      <FlatList
        data={patients}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => <PatientCard item={item} />}
        contentContainerStyle={{ padding: Spacing.base, gap: Spacing.sm, paddingBottom: insets.bottom + 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 64, gap: 10 }}>
            <Ionicons name="people-outline" size={48} color={colors.border} />
            <Text style={{ color: colors.mutedForeground, fontSize: FontSize.base }}>No patients found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: 1 },
  accentBar: { height: 3, opacity: 0.9 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, letterSpacing: -0.4 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  chipText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, height: 44 },
  searchInput: { flex: 1, fontSize: FontSize.base },
  card: { marginBottom: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xs },
  avatar: { width: 40, height: 40, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  name: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  sub: { fontSize: FontSize.xs, marginTop: 2 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  phone: { fontSize: FontSize.xs },
});
