import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initialMenuItems } from '../data/menu';
import { initialReservations } from '../data/reservations';
import { tables } from '../data/tables';

const MENU_KEY = '@restaurant/menu';
const RESERVATIONS_KEY = '@restaurant/reservations';
const RestaurantContext = createContext(undefined);

export function RestaurantProvider({ children }) {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [reservations, setReservations] = useState(initialReservations);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadSavedData() {
      try {
        const [[, savedMenu], [, savedReservations]] = await AsyncStorage.multiGet([MENU_KEY, RESERVATIONS_KEY]);
        if (!active) return;
        if (savedMenu) setMenuItems(JSON.parse(savedMenu));
        if (savedReservations) setReservations(JSON.parse(savedReservations));
      } catch (error) {
        console.warn('Could not load restaurant data:', error);
      } finally {
        if (active) setIsInitialized(true);
      }
    }
    loadSavedData();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (isInitialized) AsyncStorage.setItem(MENU_KEY, JSON.stringify(menuItems)).catch(console.warn);
  }, [isInitialized, menuItems]);

  useEffect(() => {
    if (isInitialized) AsyncStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations)).catch(console.warn);
  }, [isInitialized, reservations]);

  const addMenuItem = useCallback((item) => {
    setMenuItems((current) => [{ ...item, id: `menu-${Date.now()}` }, ...current]);
  }, []);
  const updateMenuPrice = useCallback((id, price) => {
    setMenuItems((current) => current.map((item) => item.id === id ? { ...item, price: Number(price) } : item));
  }, []);
  const toggleMenuAvailability = useCallback((id) => {
    setMenuItems((current) => current.map((item) => item.id === id ? { ...item, isAvailable: !item.isAvailable } : item));
  }, []);
  const addReservation = useCallback((reservation) => {
    setReservations((current) => [reservation, ...current]);
  }, []);
  const cancelReservation = useCallback((id) => {
    setReservations((current) => current.map((reservation) =>
      reservation.id === id ? { ...reservation, status: 'Cancelled' } : reservation,
    ));
  }, []);
  const updateReservationStatus = useCallback((id, status) => {
    setReservations((current) => current.map((reservation) =>
      reservation.id === id ? { ...reservation, status } : reservation,
    ));
  }, []);

  const value = useMemo(() => ({
    menuItems, reservations, tables, isInitialized,
    addMenuItem, updateMenuPrice, toggleMenuAvailability,
    addReservation, cancelReservation, updateReservationStatus,
  }), [menuItems, reservations, isInitialized, addMenuItem, updateMenuPrice,
    toggleMenuAvailability, addReservation, cancelReservation, updateReservationStatus]);

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurant must be used inside a RestaurantProvider.');
  return context;
}
