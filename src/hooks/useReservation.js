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

export function useReservation() {
  const { user } = useAuth();
  const { tables, reservations, addReservation, cancelReservation: cancelSavedReservation } = useRestaurant();
  const defaultDate = new Date(Date.now() + 24 * HOUR_MS);
  const [selectedDate, setSelectedDate] = useState(localDateString(defaultDate));
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [partySize, setPartySize] = useState(2);
  const [selectedTable, setSelectedTable] = useState(null);
  const [contactDetails, setContactDetails] = useState({ name: user?.name ?? '', phone: '' });

  const getAvailableTables = useCallback((time = selectedTime) => {
    const occupiedIds = reservations
      .filter((reservation) => reservation.date === selectedDate && reservation.time === time
        && !['Cancelled', 'Declined'].includes(reservation.status))
      .map((reservation) => reservation.tableId);
    return tables.filter((table) => table.seats >= Number(partySize) && !occupiedIds.includes(table.id));
  }, [partySize, reservations, selectedDate, selectedTime, tables]);

  const availability = useMemo(() => getAvailableTables(), [getAvailableTables]);

  useEffect(() => {
    setSelectedTable((current) => availability.some((table) => table.id === current?.id) ? current : availability[0] ?? null);
  }, [availability]);

  const isSlotAvailable = (time) => getAvailableTables(time).length > 0;

  const validate = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) return 'Enter the date as YYYY-MM-DD.';
    const dateOnly = new Date(`${selectedDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(dateOnly.getTime()) || dateOnly.toISOString().slice(0, 10) !== selectedDate) return 'Enter a valid calendar date.';
    if (dateOnly < today) return 'Reservation date cannot be in the past.';
    if (Number(partySize) < 1 || Number(partySize) > 12) return 'Party size must be between 1 and 12.';
    if (!/^03\d{2}-\d{7}$/.test(contactDetails.phone)) return 'Use Pakistani phone format 03XX-XXXXXXX.';
    if (!selectedTime) return 'Choose an available time slot.';
    const reservationTime = new Date(`${selectedDate}T${selectedTime}:00`);
    if (reservationTime.getTime() < Date.now() + HOUR_MS) return 'Reservation must be at least one hour ahead.';
    if (!selectedTable) return 'No suitable table is available for this time.';
    return '';
  };

  const createReservation = () => {
    const error = validate();
    if (error) return { success: false, error };
    const reservation = {
      id: `RSV-${Date.now().toString().slice(-7)}`,
      customerName: contactDetails.name || user.name,
      customerEmail: user.email,
      phone: contactDetails.phone,
      date: selectedDate,
      time: selectedTime,
      partySize: Number(partySize),
      tableId: selectedTable.id,
      status: 'Pending',
    };
    addReservation(reservation);
    return { success: true, reservation };
  };

  const cancelReservation = (id) => cancelSavedReservation(id);
  const myReservations = reservations.filter((reservation) => reservation.customerEmail === user?.email);

  return {
    selectedDate, setSelectedDate, selectedTime, setSelectedTime,
    partySize, setPartySize, selectedTable, setSelectedTable,
    contactDetails, setContactDetails, availability, isSlotAvailable,
    createReservation, cancelReservation, myReservations,
  };
}
