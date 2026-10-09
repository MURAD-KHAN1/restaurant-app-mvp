export const initialOrdersState = { orders: [] };
export function ordersReducer(state, action) {
  if (action.type === 'LOAD_ORDERS') return { orders: Array.isArray(action.payload) ? action.payload : [] };
  return state;
}
