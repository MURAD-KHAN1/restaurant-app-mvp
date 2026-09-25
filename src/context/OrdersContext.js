import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { initialOrdersState, ordersReducer } from '../reducers/ordersReducer';

const ORDERS_KEY = '@restaurant/orders';
const OrdersContext = createContext(undefined);
const TRACKING_STAGES = [
  { status: 'Preparing', afterMs: 10000 },
  { status: 'Ready', afterMs: 20000 },
  { status: 'Served', afterMs: 30000 },
];
const STATUS_RANK = { Pending: 0, Preparing: 1, Ready: 2, Served: 3 };

export function OrdersProvider({ children }) {
  const [state, dispatch] = useReducer(ordersReducer, initialOrdersState);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(ORDERS_KEY)
      .then((saved) => {
        if (active && saved) dispatch({ type: 'LOAD_ORDERS', payload: JSON.parse(saved) });
      })
      .catch((error) => console.warn('Could not load orders:', error))
      .finally(() => { if (active) setIsInitialized(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (isInitialized) AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(state.orders)).catch(console.warn);
  }, [isInitialized, state.orders]);

  useEffect(() => {
    if (!isInitialized) return undefined;
    const timerIds = [];
    state.orders.forEach((order) => {
      const elapsed = Date.now() - new Date(order.timestamp).getTime();
      TRACKING_STAGES.forEach((stage) => {
        if (STATUS_RANK[order.status] < STATUS_RANK[stage.status]) {
          const timerId = setTimeout(() => {
            dispatch({ type: 'UPDATE_STATUS', payload: { id: order.id, status: stage.status } });
          }, Math.max(0, stage.afterMs - elapsed));
          timerIds.push(timerId);
        }
      });
    });
    return () => timerIds.forEach((timerId) => clearTimeout(timerId));
  }, [isInitialized, state.orders]);

  const placeOrder = useCallback((details) => {
    const order = {
      ...details,
      id: `ORD-${Date.now().toString().slice(-7)}`,
      status: 'Pending',
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'PLACE_ORDER', payload: order });
    return order;
  }, []);
  const updateOrderStatus = useCallback((id, status) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { id, status } });
  }, []);

  const value = useMemo(() => ({
    orders: state.orders, isInitialized, placeOrder, updateOrderStatus,
  }), [state.orders, isInitialized, placeOrder, updateOrderStatus]);
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used inside an OrdersProvider.');
  return context;
}
