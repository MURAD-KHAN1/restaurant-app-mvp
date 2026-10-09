// ==================================================
// FILE: cartReducer.js
// PURPOSE: Changes cart state for each cart action
// VIVA: Edit add, quantity, remove, notes, promo and clear cart actions here
// ==================================================

// ===== IMPORTS =====
import { PROMO_CODES } from '../data/promoCodes';

// ===== INITIAL STATE =====
export const initialCartState = { items: [], promoCode: '', discountPercent: 0 };

export function cartReducer(state, action) {
  switch (action.type) {
    // ===== ADD ITEM TO CART =====
    case 'ADD_ITEM': {
      const item = action.payload;
      if (!item?.isAvailable) return state;
      const existing = state.items.find((entry) => entry.id === item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((entry) =>
            entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry,
          ),
        };
      }
      return { ...state, items: [...state.items, { ...item, quantity: 1, note: '' }] };
    }
    // ===== REMOVE ITEM FROM CART =====
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
    // ===== INCREASE ITEM QUANTITY =====
    case 'INCREMENT':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      };
    // ===== DECREASE ITEM QUANTITY =====
    case 'DECREMENT':
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.payload ? { ...item, quantity: item.quantity - 1 } : item,
          )
          .filter((item) => item.quantity > 0),
      };
    // ===== UPDATE ITEM NOTE =====
    case 'UPDATE_NOTE':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, note: action.payload.note } : item,
        ),
      };
    // ===== CLEAR COMPLETE CART =====
    case 'CLEAR_CART':
      return initialCartState;
    // ===== APPLY PROMO CODE =====
    case 'APPLY_PROMO': {
      const code = action.payload.trim().toUpperCase();
      const discountPercent = PROMO_CODES[code];
      return discountPercent ? { ...state, promoCode: code, discountPercent } : state;
    }
    // ===== REMOVE PROMO CODE =====
    case 'REMOVE_PROMO':
      return { ...state, promoCode: '', discountPercent: 0 };
    default:
      return state;
  }
}
