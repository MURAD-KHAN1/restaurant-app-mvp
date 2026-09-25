import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initialMenuItems } from '../data/menu';
import { initialReservations } from '../data/reservations';
import { tables } from '../data/tables';

const MENU_KEY = '@restaurant/menu';
const RESERVATIONS_KEY = '@restaurant/reservations';
const RestaurantContext = createContext(undefined);

function mergeSavedMenu(savedMenu) {
  const savedItems = JSON.parse(savedMenu);
  if (!Array.isArray(savedItems)) return initialMenuItems;
  const savedIds = new Set(savedItems.map((item) => item.id));
  const restored = savedItems.map((item) => {
    const currentItem = initialMenuItems.find((candidate) => candidate.id === item.id);
    if (!currentItem) return { ...item, image: null, icon: item.icon || 'restaurant-outline' };
    return { ...currentItem, ...item, image: currentItem.image, icon: currentItem.icon };
  });
  return [...restored, ...initialMenuItems.filter((item) => !savedIds.has(item.id))];
}

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
        if (savedMenu) setMenuItems(mergeSavedMenu(savedMenu));
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
    if (isInitialized) {
      const serializableMenu = menuItems.map((item) => ({ ...item, image: undefined }));
      AsyncStorage.setItem(MENU_KEY, JSON.stringify(serializableMenu)).catch(console.warn);
    }
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
