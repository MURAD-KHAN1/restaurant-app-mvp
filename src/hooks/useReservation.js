import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';

const HOUR_MS = 60 * 60 * 1000;
export const TIME_SLOTS = Array.from({ length: 11 }, (_, index) => `${String(index + 12).padStart(2, '0')}:00`);

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function useReservation() {
  const { user } = useAuth();
  const { tables, reservations, addReservation, cancelReservation: cancelSavedReservation } = useRestaurant();
  const defaultDate = new Date(Date.now() + 24 * HOUR_MS);
  const [selectedDate, setSelectedDate] = useState(localDateString(defaultDate));
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [partySize, setPartySize] = useState(2);
  const [selectedTable, setSelectedTable] = useState(null);
  const [contactDetails, setContactDetails] = useState({ name: user?.name ?? '', phone: '' });

  const getAvailableTables = useCallback((time = selectedTime, date = selectedDate, size = partySize) => {
    const occupiedIds = reservations
      .filter((reservation) => reservation.date === date && reservation.time === time
        && !['Cancelled', 'Declined'].includes(reservation.status))
      .map((reservation) => reservation.tableId);
    return tables.filter((table) => table.seats >= Number(size) && !occupiedIds.includes(table.id));
  }, [partySize, reservations, selectedDate, selectedTime, tables]);

  const availability = useMemo(() => getAvailableTables(), [getAvailableTables]);

  useEffect(() => {
    setSelectedTable((current) => availability.some((table) => table.id === current?.id) ? current : availability[0] ?? null);
  }, [availability]);

  const isSlotAvailable = useCallback((time) => getAvailableTables(time).length > 0, [getAvailableTables]);

  const getBookingSummary = useCallback((values = {}) => ({
    customerName: (values.name ?? contactDetails.name ?? user?.name ?? '').trim(),
    phone: (values.phone ?? contactDetails.phone ?? '').trim(),
    date: values.date ?? selectedDate,
    time: selectedTime,
    partySize: Number(values.partySize ?? partySize),
    tableId: selectedTable?.id ?? null,
    tableName: selectedTable?.name ?? 'No table selected',
  }), [contactDetails, partySize, selectedDate, selectedTable, selectedTime, user?.name]);

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
      const reservationTime = new Date(`${booking.date}T${booking.time}:00`);
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

  const createReservation = useCallback((booking = getBookingSummary()) => {
    const errors = validateBooking(booking);
    if (Object.keys(errors).length > 0) {
      return { success: false, error: Object.values(errors)[0] };
    }
    const reservation = {
      id: `RSV-${Date.now().toString().slice(-7)}`,
      customerName: booking.customerName || user?.name,
      customerEmail: user?.email,
      phone: booking.phone,
      date: booking.date,
      time: booking.time,
      partySize: booking.partySize,
      tableId: booking.tableId,
      status: 'Pending',
    };
    addReservation(reservation);
    return { success: true, reservation };
  }, [addReservation, getBookingSummary, user?.email, user?.name, validateBooking]);

  const cancelReservation = useCallback((id) => cancelSavedReservation(id), [cancelSavedReservation]);
  const myReservations = useMemo(() => (
    reservations.filter((reservation) => reservation.customerEmail === user?.email)
  ), [reservations, user?.email]);

  return {
    selectedDate, setSelectedDate, selectedTime, setSelectedTime,
    partySize, setPartySize, selectedTable, setSelectedTable,
    contactDetails, setContactDetails, availability, isSlotAvailable,
    validateForm, getBookingSummary, createReservation, cancelReservation, myReservations,
  };
}
