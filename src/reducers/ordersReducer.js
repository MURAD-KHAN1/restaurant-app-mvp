export const initialOrdersState = { orders: [] };
const STATUS_RANK = { Pending: 0, Preparing: 1, Ready: 2, Served: 3 };

export function ordersReducer(state, action) {
  switch (action.type) {
    case 'LOAD_ORDERS':
      return { orders: Array.isArray(action.payload) ? action.payload : [] };
    case 'PLACE_ORDER':
      return { orders: [action.payload, ...state.orders] };
    case 'UPDATE_STATUS':
      return {
        orders: state.orders.map((order) => {
          if (order.id !== action.payload.id) return order;
          const nextRank = STATUS_RANK[action.payload.status];
          const currentRank = STATUS_RANK[order.status];
          return nextRank >= currentRank ? { ...order, status: action.payload.status } : order;
        }),
      };
    default:
      return state;
  }
}
