import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import OrderStatusStep from '../components/OrderStatusStep';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../theme/colors';

const STEPS = [
  { label: 'Pending', icon: 'time-outline' },
  { label: 'Preparing', icon: 'flame-outline' },
  { label: 'Ready', icon: 'notifications-outline' },
  { label: 'Served', icon: 'checkmark-done-outline' },
];

function formatElapsed(timestamp, now) {
  const seconds = Math.max(0, Math.floor((now - new Date(timestamp).getTime()) / 1000));
  const minutes = Math.floor(seconds / 60);
  return minutes ? minutes + 'm ' + (seconds % 60) + 's' : seconds + 's';
}

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { orders } = useOrders();
  const [now, setNow] = useState(Date.now());
  const myOrders = useMemo(() => orders.filter((order) => order.customerEmail === user.email), [orders, user.email]);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Text style={[styles.title, { color: colors.text }]}>Your orders</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Live demo tracking: Preparing at 10s, Ready at 20s, Served at 30s.</Text>
        </View>
        {!myOrders.length ? <EmptyState icon='receipt-outline' title='No orders yet' message='Place an order from your cart and track it here in real time.' /> : myOrders.map((order) => {
          const activeIndex = STEPS.findIndex((step) => step.label === order.status);
          return (
            <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.orderTop}>
                <View><Text style={[styles.orderId, { color: colors.text }]}>{order.id}</Text><Text style={[styles.orderTime, { color: colors.secondaryText }]}>Elapsed {formatElapsed(order.timestamp, now)}</Text></View>
                <View style={[styles.statusBadge, { backgroundColor: colors.surfaceMuted }]}><View style={[styles.statusDot, { backgroundColor: order.status === 'Served' ? colors.success : colors.primary }]} /><Text style={[styles.statusText, { color: colors.text }]}>{order.status}</Text></View>
              </View>
              <View style={styles.itemsBox}>
                {order.items.map((item) => <Text key={item.id} style={[styles.itemText, { color: colors.secondaryText }]}>{item.quantity} × {item.name}</Text>)}
              </View>
              <View style={[styles.totalStrip, { borderColor: colors.border }]}><Text style={[styles.totalLabel, { color: colors.secondaryText }]}>Total</Text><Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(order.totals.grandTotal)}</Text></View>
              <View style={styles.tracker}>
                {STEPS.map((step, index) => <OrderStatusStep key={step.label} label={step.label} icon={step.icon} isComplete={index < activeIndex} isCurrent={index === activeIndex} isLast={index === STEPS.length - 1} />)}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  heading: { marginBottom: 18 },
  title: { fontSize: 27, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  orderCard: { borderWidth: 1, borderRadius: 22, padding: 16, marginBottom: 15 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  orderId: { fontSize: 17, fontWeight: '900' },
  orderTime: { fontSize: 12, marginTop: 4 },
  statusBadge: { borderRadius: 15, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '900' },
  itemsBox: { marginTop: 14, gap: 4 },
  itemText: { fontSize: 13 },
  totalStrip: { borderTopWidth: 1, marginTop: 13, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 13, fontWeight: '700' },
  totalValue: { fontSize: 16, fontWeight: '900' },
  tracker: { marginTop: 20 },
});
