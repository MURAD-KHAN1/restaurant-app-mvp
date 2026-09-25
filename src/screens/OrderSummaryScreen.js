import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../theme/colors';

const SERVICE_CHARGE_RATE = 0.05;
const SALES_TAX_RATE = 0.15;
const ORDER_TYPES = ['Dine-in', 'Takeaway'];
const PICKUP_TIMES = ['15 minutes', '30 minutes', '45 minutes', '60 minutes'];

const OrderLine = React.memo(function OrderLine({ item, colors }) {
  return (
    <View style={[styles.itemRow, { borderColor: colors.border }]}>
      <View style={[styles.quantity, { backgroundColor: colors.surfaceMuted }]}>
        <Text style={[styles.quantityText, { color: colors.primary }]}>{item.quantity}×</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        {item.note ? <Text style={[styles.note, { color: colors.secondaryText }]}>Note: {item.note}</Text> : null}
      </View>
      <Text style={[styles.itemPrice, { color: colors.text }]}>{formatCurrency(item.price * item.quantity)}</Text>
    </View>
  );
});

function SummaryRow({ label, value, colors, discount = false }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: discount ? colors.success : colors.text }]}>
        {discount ? '- ' : ''}{formatCurrency(Math.abs(value))}
      </Text>
    </View>
  );
}

export default function OrderSummaryScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const { tables } = useRestaurant();
  const { items, promoCode, discountPercent, clearCart } = useCart();
  const [orderType, setOrderType] = useState('Dine-in');
  const [selectedTable, setSelectedTable] = useState(tables[0]?.id ?? '');
  const [pickupTime, setPickupTime] = useState(PICKUP_TIMES[0]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
    const salesTax = subtotal * SALES_TAX_RATE;
    const discount = subtotal * (discountPercent / 100);
    return { subtotal, serviceCharge, salesTax, discount, grandTotal: subtotal + serviceCharge + salesTax - discount };
  }, [discountPercent, items]);

  const confirmOrder = useCallback(() => {
    if (!items.length) return;
    if (orderType === 'Dine-in' && !selectedTable) {
      Alert.alert('Select a table', 'Choose a table before placing your dine-in order.');
      return;
    }
    if (orderType === 'Takeaway' && !pickupTime) {
      Alert.alert('Select pickup time', 'Choose when you would like to collect your order.');
      return;
    }
    const order = placeOrder({
      customerName: user.name,
      customerEmail: user.email,
      items: items.map((item) => ({ ...item })),
      total: totals.grandTotal,
      type: orderType,
      ...(orderType === 'Dine-in' ? { table: selectedTable } : { pickupTime }),
      totals,
      promoCode,
    });
    clearCart();
    Alert.alert('Order placed', order.id + ' is now pending.', [
      { text: 'Track order', onPress: () => navigation.navigate('CustomerTabs', { screen: 'Orders' }) },
    ]);
  }, [clearCart, items, navigation, orderType, pickupTime, placeOrder, promoCode, selectedTable, totals, user.email, user.name]);

  if (!items.length) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header colors={colors} onBack={() => navigation.goBack()} />
        <EmptyState icon='receipt-outline' title='Nothing to review' message='Your cart is empty. Add a dish before reviewing your order.' actionLabel='Return to cart' onAction={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header colors={colors} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Items</Text>
          {items.map((item) => <OrderLine key={item.id} item={item} colors={colors} />)}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order type</Text>
          <View style={styles.optionRow}>
            {ORDER_TYPES.map((type) => {
              const selected = orderType === type;
              return (
                <Pressable key={type} onPress={() => setOrderType(type)} style={[styles.typeOption, { backgroundColor: selected ? colors.primary : colors.background, borderColor: selected ? colors.primary : colors.border }]}>
                  <Ionicons name={type === 'Dine-in' ? 'restaurant-outline' : 'bag-handle-outline'} size={19} color={selected ? '#FFFFFF' : colors.primary} />
                  <Text style={[styles.optionText, { color: selected ? '#FFFFFF' : colors.text }]}>{type}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.optionLabel, { color: colors.text }]}>{orderType === 'Dine-in' ? 'Select table' : 'Select pickup time'}</Text>
          <View style={styles.choiceWrap}>
            {orderType === 'Dine-in' ? tables.map((table) => {
              const selected = selectedTable === table.id;
              return <Pressable key={table.id} onPress={() => setSelectedTable(table.id)} style={[styles.choice, { backgroundColor: selected ? colors.surfaceMuted : colors.background, borderColor: selected ? colors.primary : colors.border }]}><Text style={[styles.choiceText, { color: selected ? colors.primary : colors.text }]}>{table.name}</Text></Pressable>;
            }) : PICKUP_TIMES.map((time) => {
              const selected = pickupTime === time;
              return <Pressable key={time} onPress={() => setPickupTime(time)} style={[styles.choice, { backgroundColor: selected ? colors.surfaceMuted : colors.background, borderColor: selected ? colors.primary : colors.border }]}><Text style={[styles.choiceText, { color: selected ? colors.primary : colors.text }]}>In {time}</Text></Pressable>;
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment summary</Text>
          <SummaryRow label='Subtotal' value={totals.subtotal} colors={colors} />
          <SummaryRow label='Service charge (5%)' value={totals.serviceCharge} colors={colors} />
          <SummaryRow label='Sales tax (15%)' value={totals.salesTax} colors={colors} />
          {totals.discount ? <SummaryRow label={'Promo ' + promoCode + ' (' + discountPercent + '%)'} value={totals.discount} colors={colors} discount /> : null}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Grand total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(totals.grandTotal)}</Text>
          </View>
        </View>

        <View style={[styles.notice, { backgroundColor: colors.surfaceMuted }]}>
          <Ionicons name='information-circle-outline' size={20} color={colors.primary} />
          <Text style={[styles.noticeText, { color: colors.secondaryText }]}>This is a frontend-only demo. No payment will be collected.</Text>
        </View>
        <Pressable onPress={confirmOrder} style={({ pressed }) => [styles.confirmButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
          <Text style={styles.confirmText}>Confirm order</Text>
          <View style={styles.confirmRight}><Text style={styles.confirmText}>{formatCurrency(totals.grandTotal)}</Text><Ionicons name='checkmark-circle-outline' size={21} color='#FFFFFF' /></View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ colors, onBack }) {
  return (
    <View style={[styles.header, { borderColor: colors.border }]}>
      <Pressable accessibilityLabel='Back to cart' onPress={onBack} style={[styles.backButton, { backgroundColor: colors.surfaceMuted }]}><Ionicons name='arrow-back' size={22} color={colors.text} /></Pressable>
      <View><Text style={[styles.title, { color: colors.text }]}>Order summary</Text><Text style={[styles.subtitle, { color: colors.secondaryText }]}>Review before confirming</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { minHeight: 74, borderBottomWidth: 1, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 21, fontWeight: '900' },
  subtitle: { fontSize: 11, marginTop: 2 },
  content: { padding: 16, paddingBottom: 36 },
  card: { borderWidth: 1, borderRadius: 20, padding: 15, marginBottom: 13 },
  sectionTitle: { fontSize: 17, fontWeight: '900', marginBottom: 5 },
  optionRow: { flexDirection: 'row', gap: 9, marginTop: 9 },
  typeOption: { flex: 1, minHeight: 47, borderWidth: 1, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  optionText: { fontSize: 13, fontWeight: '900' },
  optionLabel: { fontSize: 13, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  choiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderWidth: 1, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 9 },
  choiceText: { fontSize: 11, fontWeight: '800' },
  itemRow: { borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  quantity: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  quantityText: { fontSize: 12, fontWeight: '900' },
  itemDetails: { flex: 1, paddingHorizontal: 10 },
  itemName: { fontSize: 14, fontWeight: '800' },
  note: { fontSize: 11, marginTop: 3 },
  itemPrice: { fontSize: 13, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '800' },
  divider: { height: 1, marginVertical: 15 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 17, fontWeight: '900' },
  totalValue: { fontSize: 21, fontWeight: '900' },
  notice: { borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 17 },
  confirmButton: { minHeight: 56, borderRadius: 17, paddingHorizontal: 18, marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  confirmRight: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  confirmText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  pressed: { opacity: 0.78 },
});
