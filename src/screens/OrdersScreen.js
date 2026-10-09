import { useIsFocused } from '@react-navigation/native';
// ==================================================
// FILE: OrdersScreen.js
// PURPOSE: Shows customer orders and tracking
// VIVA: Edit order cards, details, status display and elapsed time here
// ==================================================

// ===== IMPORTS =====
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import { FadeSlideView } from '../components/Motion';
import OrderStatusStep from '../components/OrderStatusStep';
import { BRAND_SHORT_NAME } from '../constants/brand';
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
  // ===== GET SHARED DATA =====
  const { colors } = useTheme();
  const { user } = useAuth();
  const { orders, loading, error, refetchOrders } = useOrders();
  const isFocused = useIsFocused();
  // ===== LOCAL STATE =====
  const [now, setNow] = useState(() => Date.now());
  // ===== CURRENT CUSTOMER ORDER LIST =====
  const myOrders = useMemo(() => orders.filter((order) => order.customerEmail === user?.email), [orders, user?.email]);

  // Poll the server every 10 seconds; no customer-side status transitions.
  useEffect(() => {
    if (!isFocused) return undefined;
    refetchOrders().catch(() => {});
    const intervalId = setInterval(() => {
      setNow(Date.now());
      refetchOrders().catch(() => {});
    }, 10000);
    return () => clearInterval(intervalId);
  }, [isFocused, refetchOrders]);

  // ===== MAIN DISPLAY =====
  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FadeSlideView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetchOrders().catch(() => {})} tintColor={colors.primary} />}>
        <View style={styles.heading}>
          <Text style={[styles.title, { color: colors.text }]}>Your orders</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>{BRAND_SHORT_NAME} server status refreshes every 10 seconds.</Text>
        </View>
        <Pressable accessibilityLabel='Refresh orders' onPress={() => refetchOrders().catch(() => {})}><Text style={{ color: colors.primary }}>Refresh orders</Text></Pressable>
        {loading && !myOrders.length ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <EmptyState icon='alert-circle-outline' title='Unable to load orders' message={error} actionLabel='Retry' onAction={() => refetchOrders().catch(() => {})} /> : null}
        {/* ===== ORDER LIST / EMPTY ORDERS ===== */}
        {!myOrders.length ? <EmptyState icon='receipt-outline' title='No orders yet' message='Place an order from your cart and track it here in real time.' /> : myOrders.map((order, index) => {
          const activeIndex = STEPS.findIndex((step) => step.label === order.status);
          // ===== ORDER CARD =====
          return (
            <FadeSlideView key={order.id} delay={Math.min(index, 6) * 70} style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
              {/* ===== ORDER STATUS AND ELAPSED TIME ===== */}
              <View style={styles.orderTop}>
                <View><Text style={[styles.orderId, { color: colors.text }]}>{order.id}</Text><Text style={[styles.orderTime, { color: colors.secondaryText }]}>Elapsed {formatElapsed(order.timestamp, now)}</Text></View>
                <View style={[styles.statusBadge, { backgroundColor: colors.surfaceMuted }]}><View style={[styles.statusDot, { backgroundColor: order.status === 'Served' ? colors.success : colors.primary }]} /><Text style={[styles.statusText, { color: colors.text }]}>{order.status}</Text></View>
              </View>
              <Text style={[styles.orderType, { color: colors.primary }]}>{order.type ?? 'Dine-in'} · {(order.type ?? 'Dine-in') === 'Dine-in' ? `Table ${order.table ?? 'not selected'}` : `Pickup in ${order.pickupTime}`}</Text>
              {/* ===== ORDER DETAILS ===== */}
              <View style={styles.itemsBox}>
                {order.items.map((item) => <Text key={item.id} style={[styles.itemText, { color: colors.secondaryText }]}>{item.quantity} × {item.name}</Text>)}
              </View>
              <View style={[styles.totalStrip, { borderColor: colors.border }]}><Text style={[styles.totalLabel, { color: colors.secondaryText }]}>Total</Text><Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(order.total ?? order.totals?.grandTotal ?? 0)}</Text></View>
              {/* ===== ORDER STATUS STEPS ===== */}
              <View style={styles.tracker}>
                {STEPS.map((step, index) => <OrderStatusStep key={step.label} label={step.label} icon={step.icon} isComplete={index < activeIndex} isCurrent={index === activeIndex} isLast={index === STEPS.length - 1} />)}
              </View>
            </FadeSlideView>
          );
        })}
        </ScrollView>
      </FadeSlideView>
    </SafeAreaView>
  );
}

// ===== SCREEN DESIGN / STYLES =====
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  heading: { marginBottom: 18 },
  title: { fontSize: 27, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  orderCard: { borderWidth: 1, borderRadius: 22, padding: 16, marginBottom: 15, elevation: 2, shadowOpacity: 0.07, shadowRadius: 9, shadowOffset: { width: 0, height: 4 } },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  orderId: { fontSize: 17, fontWeight: '900' },
  orderTime: { fontSize: 12, marginTop: 4 },
  orderType: { fontSize: 12, fontWeight: '800', marginTop: 10 },
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
