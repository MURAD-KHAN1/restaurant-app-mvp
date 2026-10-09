import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client';
import { normalizeReservation, normalizeReservations, normalizeTables } from '../api/reservations';
import { useApi } from '../hooks/useApi';
import { useAuth } from './AuthContext';
const RestaurantContext = createContext(undefined);
export function RestaurantProvider({ children }) {
  const { user, token } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const bookings = useApi(user?.role === 'manager' ? '/reservations' : '/reservations/my',
    { token, enabled: Boolean(user && token), transform: normalizeReservations });
  const refetchBookings = bookings.refetch;
  const tableApi = useApi('/tables', { token, enabled: Boolean(user && token), transform: normalizeTables });
  useEffect(() => { AsyncStorage.multiRemove(['@restaurant/menu', '@restaurant/reservations']).catch(() => {}); }, []);
  const addReservation = useCallback(async booking => {
    const response = await apiRequest('/reservations', { method: 'POST', body: {
      table: booking.tableId, date: booking.date, time: booking.time, partySize: booking.partySize,
      phone: booking.phone, customerName: booking.customerName } }, token);
    await refetchBookings().catch(() => {});
    return normalizeReservation(response);
  }, [refetchBookings, token]);
  const updateReservationStatus = useCallback(async (id, status) => {
    const response = await apiRequest('/reservations/' + id, { method: 'PATCH', body: { status } }, token);
    await refetchBookings();
    return normalizeReservation(response);
  }, [refetchBookings, token]);
  const cancelReservation = useCallback(id => updateReservationStatus(id, 'Cancelled'), [updateReservationStatus]);
  const value = useMemo(() => ({ menuItems, setMenuItems, reservations: bookings.data || [],
    tables: tableApi.data || [], isInitialized: true,
    reservationsLoading: bookings.loading, reservationsError: bookings.error, refetchReservations: bookings.refetch,
    tablesLoading: tableApi.loading, tablesError: tableApi.error, refetchTables: tableApi.refetch,
    addReservation, cancelReservation, updateReservationStatus }),
  [menuItems, bookings.data, bookings.loading, bookings.error, bookings.refetch,
    tableApi.data, tableApi.loading, tableApi.error, tableApi.refetch, addReservation, cancelReservation, updateReservationStatus]);
  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}
export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurant must be used inside a RestaurantProvider.');
  return context;
}
