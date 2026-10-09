import { normalizeTables } from '../api/reservations';
import { useApi } from './useApi';
// ==================================================
// FILE: useReservation.js
// PURPOSE: Checks tables and creates bookings
// VIVA: Edit validation, available tables, create and cancel reservation here
// ==================================================

// ===== IMPORTS =====
import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';

const HOUR_MS = 60 * 60 * 1000;
// ===== RESERVATION TIME SLOTS =====
export const TIME_SLOTS = Array.from({ length: 11 }, (_, index) => `${String(index + 12).padStart(2, '0')}:00`);

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ===== VALID DATE CHECK =====
function parseLocalDate(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

// ===== RESERVATION LOGIC =====
export function useReservation() {
  // ===== GET SHARED DATA =====
  const { user, token } = useAuth();
  const { tables, reservations, addReservation, cancelReservation: cancelSavedReservation,
    refetchReservations, reservationsLoading, reservationsError, tablesLoading, tablesError, refetchTables } = useRestaurant();
  // ===== LOCAL STATE =====
  const [selectedDate, setSelectedDate] = useState(() => localDateString(new Date(Date.now() + 24 * HOUR_MS)));
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [partySize, setPartySize] = useState(2);
  const [selectedTablePreference, setSelectedTable] = useState(null);
  const [contactDetails, setContactDetails] = useState({ name: user?.name ?? '', phone: '' });

  // ===== AVAILABLE TABLES / GUEST CAPACITY =====
  const slotApi = useApi('/tables?date=' + encodeURIComponent(selectedDate)
    + '&time=' + encodeURIComponent(selectedTime) + '&partySize=' + partySize,
    { token, transform: normalizeTables, enabled: Boolean(token && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)
      && Number.isInteger(partySize) && partySize >= 1 && partySize <= 12) });
  const refetchSlot = slotApi.refetch;
  const getAvailableTables = useCallback((time = selectedTime, date = selectedDate, size = partySize) => {
    // Current slot availability comes from all active server bookings, not just this customer's list.
    const candidates = time === selectedTime && date === selectedDate ? (slotApi.data || []) : tables;
    return candidates.filter(table => table.seats >= Number(size));
  }, [partySize, selectedDate, selectedTime, slotApi.data, tables]);

  const availability = useMemo(() => getAvailableTables(), [getAvailableTables]);
  const selectedTable = useMemo(
    () => availability.find((table) => table.id === selectedTablePreference?.id) ?? availability[0] ?? null,
    [availability, selectedTablePreference],
  );

  const isSlotAvailable = useCallback((time) => getAvailableTables(time).length > 0, [getAvailableTables]);

  // ===== BOOKING DETAILS =====
  const getBookingSummary = useCallback((values = {}) => ({
    customerName: (values.name ?? contactDetails.name ?? user?.name ?? '').trim(),
    phone: (values.phone ?? contactDetails.phone ?? '').trim(),
    date: values.date ?? selectedDate,
    time: selectedTime,
    partySize: Number(values.partySize ?? partySize),
    tableId: selectedTable?.id ?? null,
    tableName: selectedTable?.name ?? 'No table selected',
  }), [contactDetails, partySize, selectedDate, selectedTable, selectedTime, user?.name]);

  // ===== VALIDATION =====
  const validateBooking = useCallback((booking) => {
    const errors = {};
    if (!booking.customerName) errors.name = 'Your name is required.';
    if (!/^03\d{2}-\d{7}$/.test(booking.phone)) errors.phone = 'Use Pakistani phone format 03XX-XXXXXXX.';

    const dateOnly = parseLocalDate(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!dateOnly) errors.date = 'Enter a valid date as YYYY-MM-DD.';
    else if (dateOnly < today) errors.date = 'Reservation date cannot be in the past.';

    if (!Number.isInteger(booking.partySize) || booking.partySize < 1 || booking.partySize > 12) {
      errors.partySize = 'Party size must be between 1 and 12.';
    }

    if (!TIME_SLOTS.includes(booking.time)) errors.time = 'Choose an available time slot.';
    else if (dateOnly) {
      const reservationTime = new Date(`${booking.date}T${booking.time}:00+05:00`);
      if (reservationTime.getTime() < Date.now() + HOUR_MS) {
        errors.time = 'Reservation must be at least one hour ahead.';
      }
    }

    if (!errors.date && !errors.partySize && !errors.time) {
      const availableTables = getAvailableTables(booking.time, booking.date, booking.partySize);
      if (!booking.tableId || !availableTables.some((table) => table.id === booking.tableId)) {
        errors.table = 'No suitable table is available for this time.';
      }
    }
    return errors;
  }, [getAvailableTables]);

  const validateForm = useCallback((values) => (
    validateBooking(getBookingSummary(values))
  ), [getBookingSummary, validateBooking]);

  // ===== CREATE RESERVATION =====
  const createReservation = useCallback(async (booking = getBookingSummary()) => {
    const errors = validateBooking(booking);
    if (Object.keys(errors).length) return { success: false, error: Object.values(errors)[0] };
    try {
      const reservation = await addReservation(booking);
      await refetchSlot().catch(() => {});
      return { success: true, reservation };
    } catch (error) { return { success: false, error: error.message || 'Booking could not be created.' }; }
  }, [addReservation, getBookingSummary, validateBooking, refetchSlot]);
  const cancelReservation = useCallback(async id => {
    await cancelSavedReservation(id);
    await refetchSlot().catch(() => {});
  }, [cancelSavedReservation, refetchSlot]);
  const refresh = useCallback(async () => {
    await Promise.all([refetchReservations(), refetchTables(), refetchSlot()]);
  }, [refetchReservations, refetchTables, refetchSlot]);
  // ===== CURRENT CUSTOMER RESERVATIONS =====
  const myReservations = useMemo(() => (
    reservations.filter((reservation) => reservation.customerEmail === user?.email)
  ), [reservations, user?.email]);

  return {
    selectedDate, setSelectedDate, selectedTime, setSelectedTime,
    partySize, setPartySize, selectedTable, setSelectedTable,
    contactDetails, setContactDetails, availability, isSlotAvailable,
    loading: reservationsLoading || tablesLoading || slotApi.loading,
    error: reservationsError || tablesError || slotApi.error, refresh,
    validateForm, getBookingSummary, createReservation, cancelReservation, myReservations,
  };
}
