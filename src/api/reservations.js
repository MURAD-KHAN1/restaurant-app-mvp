export function normalizeTable(table) {
  return { id: table._id, label: 'T' + table.tableNumber, name: table.name, seats: table.seats,
    area: table.area, available: table.available };
}
export function normalizeTables(tables) {
  if (!Array.isArray(tables)) throw new Error('The server returned an invalid table list.');
  return tables.map(normalizeTable);
}
export function normalizeReservation(reservation) {
  return { ...reservation, id: reservation._id, tableId: reservation.table?._id || reservation.table,
    tableLabel: reservation.table?.tableNumber ? 'T' + reservation.table.tableNumber : '',
    tableName: reservation.table?.name || '', customerName: reservation.customerName || '',
    customerEmail: reservation.customerEmail || '' };
}
export function normalizeReservations(reservations) {
  if (!Array.isArray(reservations)) throw new Error('The server returned an invalid reservation list.');
  return reservations.map(normalizeReservation);
}
