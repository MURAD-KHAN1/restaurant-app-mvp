import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { PROMO_CODES } from '../data/promoCodes';
import { cartReducer, initialCartState } from '../reducers/cartReducer';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const addItem = useCallback((item) => dispatch({ type: 'ADD_ITEM', payload: item }), []);
  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE_ITEM', payload: id }), []);
  const increment = useCallback((id) => dispatch({ type: 'INCREMENT', payload: id }), []);
  const decrement = useCallback((id) => dispatch({ type: 'DECREMENT', payload: id }), []);
  const updateNote = useCallback((id, note) => dispatch({ type: 'UPDATE_NOTE', payload: { id, note } }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const applyPromo = useCallback((code) => {
    const normalized = code.trim().toUpperCase();
    if (!PROMO_CODES[normalized]) return { success: false, message: 'Invalid code. Try WELCOME10 or FEAST20.' };
    dispatch({ type: 'APPLY_PROMO', payload: normalized });
    return { success: true, message: `${PROMO_CODES[normalized]}% discount applied.` };
  }, []);
  const removePromo = useCallback(() => dispatch({ type: 'REMOVE_PROMO' }), []);

  const value = useMemo(() => ({
    ...state,
    itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
    addItem, removeItem, increment, decrement, updateNote, clearCart, applyPromo, removePromo,
  }), [state, addItem, removeItem, increment, decrement, updateNote, clearCart, applyPromo, removePromo]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside a CartProvider.');
  return context;
}
