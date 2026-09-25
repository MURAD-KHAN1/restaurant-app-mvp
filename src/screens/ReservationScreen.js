import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import { useTheme } from '../context/ThemeContext';
import { useDebounce } from '../hooks/useDebounce';
import { useForm } from '../hooks/useForm';
import { TIME_SLOTS, useReservation } from '../hooks/useReservation';

export default function ReservationScreen() {
  const { colors } = useTheme();
  const reservation = useReservation();
  const { setContactDetails, setPartySize, setSelectedDate } = reservation;
  const [confirmation, setConfirmation] = useState(null);
  const debouncedDate = useDebounce(reservation.selectedDate, 350);
  const form = useForm({
    name: reservation.contactDetails.name,
    phone: reservation.contactDetails.phone,
    date: reservation.selectedDate,
    partySize: String(reservation.partySize),
  }, reservation.validateForm, (values) => {
    setConfirmation(reservation.getBookingSummary(values));
  });

  useEffect(() => {
    setContactDetails({ name: form.values.name, phone: form.values.phone });
    setSelectedDate(form.values.date);
    setPartySize(Number(form.values.partySize) || 0);
  }, [form.values.date, form.values.name, form.values.partySize, form.values.phone, setContactDetails, setPartySize, setSelectedDate]);

  const confirmReservation = () => {
    if (!confirmation) return;
    const result = reservation.createReservation(confirmation);
    if (!result.success) {
      setConfirmation(null);
      Alert.alert('Reservation unavailable', result.error);
      return;
    }
    setConfirmation(null);
    Alert.alert('Reservation requested', 'Your booking is pending manager approval.');
  };

  const field = (name, label, placeholder, keyboardType = 'default') => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        value={form.values[name]}
        onChangeText={(value) => form.handleChange(name, value)}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        keyboardType={keyboardType}
        style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: form.errors[name] ? colors.danger : colors.border }]}
      />
      {form.errors[name] ? <Text style={[styles.error, { color: colors.danger }]}>{form.errors[name]}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <View style={styles.headingRow}>
          <View><Text style={[styles.title, { color: colors.text }]}>Reserve a table</Text><Text style={[styles.subtitle, { color: colors.secondaryText }]}>Plan a memorable meal with us.</Text></View>
          <View style={[styles.headerIcon, { backgroundColor: colors.surfaceMuted }]}><Ionicons name='calendar' size={25} color={colors.primary} /></View>
        </View>
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {field('name', 'Guest name', 'Full name')}
          {field('phone', 'Phone number', '03XX-XXXXXXX', 'phone-pad')}
          <View style={styles.twoColumns}>
            <View style={styles.flexField}>{field('date', 'Date', 'YYYY-MM-DD', 'numbers-and-punctuation')}</View>
            <View style={styles.partyField}>{field('partySize', 'Guests', '1–12', 'number-pad')}</View>
          </View>
          <Text style={[styles.debounceHint, { color: colors.secondaryText }]}>Checking availability for {debouncedDate}…</Text>
          <Text style={[styles.label, { color: colors.text }]}>Time</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotRow}>
            {TIME_SLOTS.map((time) => {
              const available = reservation.isSlotAvailable(time);
              const selected = reservation.selectedTime === time;
              return (
                <Pressable key={time} disabled={!available} onPress={() => reservation.setSelectedTime(time)} style={[styles.slot, { backgroundColor: selected ? colors.primary : colors.background, borderColor: selected ? colors.primary : colors.border }, !available && styles.disabled]}>
                  <Text style={{ color: selected ? '#FFFFFF' : colors.text, fontWeight: '800', fontSize: 13 }}>{time}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {form.errors.time ? <Text style={[styles.error, { color: colors.danger }]}>{form.errors.time}</Text> : null}
          <Text style={[styles.label, { color: colors.text }]}>Available table</Text>
          {reservation.availability.length ? reservation.availability.map((table) => {
            const selected = reservation.selectedTable?.id === table.id;
            return (
              <Pressable key={table.id} onPress={() => reservation.setSelectedTable(table)} style={[styles.tableRow, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.surfaceMuted : colors.background }]}>
                <View style={[styles.tableIcon, { backgroundColor: colors.surface }]}><Ionicons name='people-outline' size={20} color={colors.primary} /></View>
                <View style={styles.tableText}><Text style={[styles.tableName, { color: colors.text }]}>{table.name}</Text><Text style={[styles.tableMeta, { color: colors.secondaryText }]}>{table.area} · seats {table.seats}</Text></View>
                <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.primary : colors.secondaryText} />
              </Pressable>
            );
          }) : <Text style={[styles.noTables, { color: colors.danger }]}>No suitable tables are free at this time.</Text>}
          {form.errors.table ? <Text style={[styles.error, { color: colors.danger }]}>{form.errors.table}</Text> : null}
          <Pressable onPress={form.handleSubmit} style={({ pressed }) => [styles.reserveButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={styles.reserveText}>Request reservation</Text><Ionicons name='arrow-forward' size={20} color='#FFFFFF' /></Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your reservations</Text>
        {reservation.myReservations.length ? reservation.myReservations.map((item) => (
          <View key={item.id} style={[styles.reservationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.reservationTop}><Text style={[styles.reservationDate, { color: colors.text }]}>{item.date} at {item.time}</Text><Text style={[styles.status, { color: item.status === 'Cancelled' || item.status === 'Declined' ? colors.danger : colors.success }]}>{item.status}</Text></View>
            <Text style={[styles.reservationMeta, { color: colors.secondaryText }]}>{item.partySize} guests · Table {item.tableId} · {item.id}</Text>
            {!['Cancelled', 'Declined'].includes(item.status) ? <Pressable onPress={() => Alert.alert('Cancel reservation?', 'This will release your table.', [{ text: 'Keep', style: 'cancel' }, { text: 'Cancel', style: 'destructive', onPress: () => reservation.cancelReservation(item.id) }])}><Text style={[styles.cancelText, { color: colors.danger }]}>Cancel reservation</Text></Pressable> : null}
          </View>
        )) : <EmptyState icon='calendar-outline' title='No reservations yet' message='Your upcoming table bookings will appear here.' />}
      </ScrollView>

      <Modal visible={Boolean(confirmation)} transparent animationType='fade' onRequestClose={() => setConfirmation(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.successIcon, { backgroundColor: colors.surfaceMuted }]}><Ionicons name='calendar-outline' size={42} color={colors.primary} /></View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Confirm reservation</Text>
            <Text style={[styles.modalText, { color: colors.secondaryText }]}>Please review your booking before it is saved.</Text>
            <Text style={[styles.bookingSummary, { color: colors.text }]}>{confirmation?.customerName}{'\n'}{confirmation?.date} at {confirmation?.time}{'\n'}{confirmation?.partySize} guests · {confirmation?.tableName}{'\n'}{confirmation?.phone}</Text>
            <Pressable onPress={confirmReservation} style={[styles.modalButton, { backgroundColor: colors.primary }]}><Text style={styles.reserveText}>Confirm</Text></Pressable>
            <Pressable onPress={() => setConfirmation(null)} style={styles.modalCancelButton}><Text style={[styles.modalCancelText, { color: colors.secondaryText }]}>Keep editing</Text></Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  title: { fontSize: 27, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 3 },
  headerIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  formCard: { borderWidth: 1, borderRadius: 22, padding: 16 },
  field: { marginBottom: 13 },
  label: { fontSize: 13, fontWeight: '800', marginBottom: 7 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, fontSize: 14 },
  error: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  twoColumns: { flexDirection: 'row', gap: 10 },
  flexField: { flex: 1 },
  partyField: { width: 92 },
  debounceHint: { fontSize: 11, marginTop: -5, marginBottom: 14 },
  slotRow: { paddingBottom: 16 },
  slot: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginRight: 8 },
  disabled: { opacity: 0.32 },
  tableRow: { minHeight: 62, borderWidth: 1, borderRadius: 14, marginBottom: 9, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' },
  tableIcon: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  tableText: { flex: 1 },
  tableName: { fontSize: 14, fontWeight: '800' },
  tableMeta: { fontSize: 11, marginTop: 3 },
  noTables: { fontSize: 13, fontWeight: '700', marginBottom: 12 },
  reserveButton: { minHeight: 52, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 7 },
  reserveText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  pressed: { opacity: 0.78 },
  sectionTitle: { fontSize: 21, fontWeight: '900', marginTop: 24, marginBottom: 11 },
  reservationCard: { borderWidth: 1, borderRadius: 17, padding: 14, marginBottom: 10 },
  reservationTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  reservationDate: { flex: 1, fontSize: 15, fontWeight: '900' },
  status: { fontSize: 12, fontWeight: '900' },
  reservationMeta: { fontSize: 12, marginTop: 6 },
  cancelText: { fontSize: 12, fontWeight: '800', marginTop: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', borderRadius: 24, padding: 22, alignItems: 'center' },
  successIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '900', marginTop: 15 },
  modalText: { fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
  bookingSummary: { fontSize: 14, lineHeight: 23, textAlign: 'center', fontWeight: '700', marginTop: 12 },
  modalButton: { alignSelf: 'stretch', minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  modalCancelButton: { minHeight: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  modalCancelText: { fontSize: 13, fontWeight: '800' },
});
