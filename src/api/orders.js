export function normalizeOrder(order) {
  return { ...order, id: order._id, timestamp: order.createdAt,
    customerName: order.customerName || '', customerEmail: order.customerEmail || '',
    type: order.orderType, table: order.table?.tableNumber ? 'T' + order.table.tableNumber : '',
    items: order.items.map(item => ({ id: item.menuItem, name: item.name, price: item.unitPrice,
      quantity: item.quantity, note: item.note || '' })),
    totals: { subtotal: order.subtotal, serviceCharge: order.serviceCharge, salesTax: order.salesTax,
      discount: order.discount, grandTotal: order.total } };
}
export function normalizeOrders(orders) {
  if (!Array.isArray(orders)) throw new Error('The server returned an invalid order list.');
  return orders.map(normalizeOrder);
}
export function orderRequest(details) {
  return { items: details.items.map(item => ({ menuItem: item.id, quantity: item.quantity, note: item.note || '' })),
    orderType: details.type, promoCode: details.promoCode || '',
    ...(details.type === 'Dine-in' ? { table: details.table } : { pickupTime: details.pickupTime }) };
}
