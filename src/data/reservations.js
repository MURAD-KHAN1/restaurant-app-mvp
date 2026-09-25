const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
const dayAfterTomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000);
const toDateString = (date) => date.toISOString().slice(0, 10);

export const initialReservations = [
  { id: 'RSV-1001', customerName: 'Ayesha Khan', customerEmail: 'customer@example.com', phone: '0300-1234567', date: toDateString(tomorrow), time: '19:00', partySize: 4, tableId: 'T2', status: 'Pending' },
  { id: 'RSV-1002', customerName: 'Bilal Sheikh', customerEmail: 'bilal@example.com', phone: '0312-7654321', date: toDateString(dayAfterTomorrow), time: '20:00', partySize: 6, tableId: 'T4', status: 'Accepted' },
];
