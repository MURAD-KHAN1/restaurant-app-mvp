import { PROMO_CODES } from '../data/promoCodes';

export const initialCartState = { items: [], promoCode: '', discountPercent: 0 };

export function cartReducer(state, action) {
  switch (action.type) {
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
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
    case 'INCREMENT':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      };
    case 'DECREMENT':
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.payload ? { ...item, quantity: item.quantity - 1 } : item,
          )
          .filter((item) => item.quantity > 0),
      };
    case 'UPDATE_NOTE':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, note: action.payload.note } : item,
        ),
      };
    case 'CLEAR_CART':
      return initialCartState;
    case 'APPLY_PROMO': {
      const code = action.payload.trim().toUpperCase();
      const discountPercent = PROMO_CODES[code];
      return discountPercent ? { ...state, promoCode: code, discountPercent } : state;
    }
    case 'REMOVE_PROMO':
      return { ...state, promoCode: '', discountPercent: 0 };
    default:
      return state;
  }
}
