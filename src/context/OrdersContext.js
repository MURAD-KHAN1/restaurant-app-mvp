import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { apiRequest } from '../api/client';
import { normalizeOrder, normalizeOrders, orderRequest } from '../api/orders';
import { useApi } from '../hooks/useApi';
import { useAuth } from './AuthContext';
const OrdersContext = createContext(undefined);
export function OrdersProvider({ children }) {
  const { user, token } = useAuth();
  const { data, loading, error, refetch } = useApi(user?.role === 'manager' ? '/orders' : '/orders/my',
    { token, enabled: Boolean(user && token), transform: normalizeOrders });
  useEffect(() => { AsyncStorage.removeItem('@restaurant/orders').catch(() => {}); }, []);
  const placeOrder = useCallback(async details => {
    const response = await apiRequest('/orders', { method: 'POST', body: orderRequest(details) }, token);
    // A refresh failure must not turn a confirmed order into a failed checkout/retry.
    await refetch().catch(() => {});
    return normalizeOrder(response);
  }, [refetch, token]);
  const updateOrderStatus = useCallback(async (id, status) => {
    const response = await apiRequest('/orders/' + id + '/status', { method: 'PATCH', body: { status } }, token);
    await refetch();
    return normalizeOrder(response);
  }, [refetch, token]);
  const value = useMemo(() => ({ orders: data || [], isInitialized: true, loading, error,
    refetchOrders: refetch, placeOrder, updateOrderStatus }), [data, loading, error, refetch, placeOrder, updateOrderStatus]);
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}
export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used inside an OrdersProvider.');
  return context;
}
