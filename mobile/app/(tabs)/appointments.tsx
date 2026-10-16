import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  getAppointments,
  getPendingBookings,
  reviewBooking,
  type Appointment,
} from '@/services/appointmentService';
import type { BookingRequest } from '@/services/bookingService';
import { Spacing, FontSize, FontWeight, Radius } from '@/constants/tokens';

const BOOKING_REVIEW_ROLES = new Set([
  'SUPER_ADMIN','ADMIN','FACILITY_ADMIN','BRANCH_ADMIN',
  'DOCTOR','CLINICIAN','NURSE','TRIAGE_NURSE',
]);

type Tab = 'scheduled' | 'requests';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

// ─── Appointment card ─────────────────────────────────────────────────────────
function AppointmentCard({ item }: { item: Appointment }) {
  const { colors } = useTheme();
  const patientName = item.patient
    ? `${item.patient.firstName} ${item.patient.lastName}`
    : `Patient #${item.patientId}`;
  return (
    <Card style={styles.apptCard} spotlight accentColor={colors.moduleClinical} padding={Spacing.md}>
      <View style={styles.apptRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.apptPatient, { color: colors.foreground }]} numberOfLines={1}>
            {patientName}
          </Text>
          {item.patient?.patientNumber ? (
            <Text style={[styles.apptSub, { color: colors.mutedForeground }]}>
              {item.patient.patientNumber}
            </Text>
          ) : null}
        </View>
        <StatusBadge status={item.statusCode} />
      </View>
      <View style={styles.apptMeta}>
        <View style={styles.metaChip}>
          <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {formatDate(item.appointmentDate)}
          </Text>
        </View>
        {item.startTime ? (
          <View style={styles.metaChip}>
            <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.startTime}</Text>
          </View>
        ) : null}
        {item.doctor ? (
          <View style={styles.metaChip}>
            <Ionicons name="person-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {item.doctor.firstName} {item.doctor.lastName}
            </Text>
          </View>
        ) : null}
      </View>
      {item.visitReason ? (
        <Text style={[styles.apptReason, { color: colors.subtleForeground }]} numberOfLines={2}>
          {item.visitReason}
        </Text>
      ) : null}
    </Card>
  );
}

// ─── Booking request card ─────────────────────────────────────────────────────
interface BookingCardProps {
  item: BookingRequest;
  onConfirm: (item: BookingRequest) => void;
  onReject: (item: BookingRequest) => void;
}
function BookingCard({ item, onConfirm, onReject }: BookingCardProps) {
  const { colors } = useTheme();
  return (
    <Card style={styles.apptCard} spotlight accentColor={colors.warning} padding={Spacing.md}>
      <View style={styles.apptRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.apptPatient, { color: colors.foreground }]} numberOfLines={1}>
            {item.patientName}
          </Text>
          <Text style={[styles.apptSub, { color: colors.mutedForeground, fontFamily: 'monospace' }]}>
            {item.bookingRef}
          </Text>
        </View>
        <Badge variant="warning">Pending</Badge>
      </View>
      <View style={styles.apptMeta}>
        <View style={styles.metaChip}>
          <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {formatDate(item.preferredDate)}
            {item.preferredTime ? ` · ${item.preferredTime}` : ''}
          </Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="call-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.patientPhone}</Text>
        </View>
      </View>
      {item.visitReason ? (
        <Text style={[styles.apptReason, { color: colors.subtleForeground }]} numberOfLines={2}>
          {item.visitReason}
        </Text>
      ) : null}
      <View style={styles.bookingActions}>
        <Button
          variant="primary"
          size="sm"
          style={[styles.bookingBtn, { backgroundColor: colors.success }]}
          onPress={() => onConfirm(item)}
        >
          Confirm
        </Button>
        <Button
          variant="destructive"
          size="sm"
          style={styles.bookingBtn}
          onPress={() => onReject(item)}
        >
          Reject
        </Button>
      </View>
    </Card>
  );
}

// ─── Review modal ─────────────────────────────────────────────────────────────
interface ReviewModalProps {
  visible: boolean;
  booking: BookingRequest | null;
  action: 'CONFIRMED' | 'REJECTED';
  onClose: () => void;
  onSubmit: (notes: string) => Promise<void>;
}
function ReviewModal({ visible, booking, action, onClose, onSubmit }: ReviewModalProps) {
  const { colors } = useTheme();
  const [notes, setNotes] = useState('');
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState<string | null>(null);

  useEffect(() => { if (!visible) { setNotes(''); setErr(null); } }, [visible]);

  const handle = async () => {
    setBusy(true); setErr(null);
    try { await onSubmit(notes); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Failed. Retry.'); }
    finally { setBusy(false); }
  };

  const isConfirm = action === 'CONFIRMED';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface1, borderColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>
            {isConfirm ? 'Confirm booking' : 'Reject booking'}
          </Text>
          {booking ? (
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              {booking.patientName} · {formatDate(booking.preferredDate)}
              {booking.preferredTime ? ` · ${booking.preferredTime}` : ''}
            </Text>
          ) : null}
          <Text style={[styles.notesLabel, { color: colors.mutedForeground }]}>
            Notes to patient (optional)
          </Text>
          <TextInput
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
            placeholder={isConfirm ? 'e.g. Please arrive 10 minutes early…' : 'e.g. No availability, please call to reschedule…'}
            placeholderTextColor={colors.subtleForeground}
            style={[styles.notesInput, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.foreground }]}
            maxLength={500}
          />
          {err ? <Text style={[styles.modalErr, { color: colors.destructive }]}>{err}</Text> : null}
          <View style={styles.modalBtns}>
            <Button variant="outline" size="sm" style={{ flex: 1 }} onPress={onClose} disabled={busy}>Cancel</Button>
            <Button
              size="sm"
              style={[{ flex: 1 }, isConfirm ? { backgroundColor: colors.success } : { backgroundColor: colors.destructive }]}
              onPress={handle}
              loading={busy}
            >
              {isConfirm ? 'Confirm' : 'Reject'}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function AppointmentsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const canReview = BOOKING_REVIEW_ROLES.has(user?.roleCode ?? '');
  const [tab, setTab] = useState<Tab>('scheduled');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bookings, setBookings]         = useState<BookingRequest[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  const [reviewTarget, setReviewTarget] = useState<BookingRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'CONFIRMED' | 'REJECTED'>('CONFIRMED');
  const [modalVisible, setModalVisible] = useState(false);

  const load = useCallback(async () => {
    const [appts, bkgs] = await Promise.all([
      getAppointments({ take: 40 }).catch(() => [] as Appointment[]),
      canReview ? getPendingBookings().catch(() => [] as BookingRequest[]) : Promise.resolve([] as BookingRequest[]),
    ]);
    setAppointments(appts);
    setBookings(bkgs);
  }, [canReview]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const openReview = (booking: BookingRequest, action: 'CONFIRMED' | 'REJECTED') => {
    setReviewTarget(booking);
    setReviewAction(action);
    setModalVisible(true);
  };

  const submitReview = async (notes: string) => {
    if (!reviewTarget) return;
    await reviewBooking(reviewTarget.id, reviewAction, notes || undefined);
    setModalVisible(false);
    setBookings(prev => prev.filter(b => b.id !== reviewTarget.id));
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading appointments…" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface1, borderBottomColor: colors.border, paddingTop: insets.top + Spacing.sm }]}>
        <View style={[styles.accentBar, { backgroundColor: colors.moduleClinical }]} />
        <View style={{ paddingHorizontal: Spacing.base, paddingBottom: Spacing.md }}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.headerBadge, { color: colors.brand }]}>Scheduling</Text>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>Appointments</Text>
            </View>
            <View style={[styles.countChip, { backgroundColor: colors.infoSoft }]}>
              <Text style={[styles.countText, { color: colors.info }]}>{appointments.length}</Text>
            </View>
          </View>

          {/* Tabs — only when user can review bookings */}
          {canReview && (
            <View style={[styles.tabBar, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              {(['scheduled', 'requests'] as Tab[]).map(t => (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  style={[styles.tabBtn, tab === t && { backgroundColor: colors.surface1 }]}
                >
                  {t === 'requests' && bookings.length > 0 && (
                    <View style={[styles.tabDot, { backgroundColor: colors.warning }]} />
                  )}
                  <Text style={[styles.tabText, { color: tab === t ? colors.foreground : colors.mutedForeground, fontWeight: tab === t ? FontWeight.semibold : FontWeight.normal }]}>
                    {t === 'scheduled' ? 'Scheduled' : `Requests${bookings.length > 0 ? ` (${bookings.length})` : ''}`}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* List */}
      {tab === 'scheduled' ? (
        <FlatList
          data={appointments}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => <AppointmentCard item={item} />}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="calendar-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No appointments found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <BookingCard
              item={item}
              onConfirm={b => openReview(b, 'CONFIRMED')}
              onReject={b => openReview(b, 'REJECTED')}
            />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="checkmark-circle-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No pending booking requests</Text>
              <Text style={[styles.emptySub, { color: colors.subtleForeground }]}>
                Patients can book at /book-appointment on the web
              </Text>
            </View>
          }
        />
      )}

      <ReviewModal
        visible={modalVisible}
        booking={reviewTarget}
        action={reviewAction}
        onClose={() => setModalVisible(false)}
        onSubmit={submitReview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: 1 },
  accentBar: { height: 3, opacity: 0.9 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.md },
  headerBadge: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
  headerTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, letterSpacing: -0.4 },
  countChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, marginTop: 6 },
  countText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  tabBar: { flexDirection: 'row', borderRadius: Radius.lg, borderWidth: 1, padding: 3, gap: 3 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: Radius.md },
  tabDot: { width: 7, height: 7, borderRadius: Radius.full },
  tabText: { fontSize: FontSize.sm },
  listContent: { padding: Spacing.base, gap: Spacing.sm },
  apptCard: { marginBottom: Spacing.sm },
  apptRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  apptPatient: { fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  apptSub: { fontSize: FontSize.xs, marginTop: 2 },
  apptMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xs },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSize.xs },
  apptReason: { fontSize: FontSize.xs, fontStyle: 'italic', marginTop: 4 },
  bookingActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  bookingBtn: { flex: 1 },
  emptyWrap: { alignItems: 'center', paddingTop: 64, gap: 10 },
  emptyText: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  emptySub: { fontSize: FontSize.sm, textAlign: 'center', paddingHorizontal: 32 },
  // modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], borderWidth: 1, padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing['3xl'] },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  modalSub: { fontSize: FontSize.sm, marginTop: -Spacing.xs },
  notesLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, letterSpacing: 0.6, textTransform: 'uppercase' },
  notesInput: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, fontSize: FontSize.base, minHeight: 80, textAlignVertical: 'top' },
  modalErr: { fontSize: FontSize.sm },
  modalBtns: { flexDirection: 'row', gap: Spacing.sm },
});
