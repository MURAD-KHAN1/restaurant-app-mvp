import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CartItemRow from '../components/CartItemRow';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../theme/colors';

export default function CartScreen({ navigation }) {
  const { colors } = useTheme();
  const { items, promoCode, discountPercent, increment, decrement, removeItem, updateNote, clearCart, applyPromo, removePromo } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const serviceCharge = subtotal * 0.05;
    const salesTax = subtotal * 0.15;
    const discount = subtotal * (discountPercent / 100);
    return { subtotal, serviceCharge, salesTax, discount, grandTotal: subtotal + serviceCharge + salesTax - discount };
  }, [discountPercent, items]);

  const handleIncrement = useCallback((id) => increment(id), [increment]);
  const handleDecrement = useCallback((id) => decrement(id), [decrement]);
  const handleRemove = useCallback((id) => removeItem(id), [removeItem]);
  const handleNote = useCallback((id, note) => updateNote(id, note), [updateNote]);

  const submitPromo = () => {
    const result = applyPromo(promoInput);
    setPromoMessage(result.message);
    if (result.success) setPromoInput('');
  };
  const checkout = () => {
    navigation.navigate('OrderSummary');
  };

  if (!items.length) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.titleBlock}><Text style={[styles.title, { color: colors.text }]}>Your cart</Text></View>
        <EmptyState icon='bag-handle-outline' title='Your cart is empty' message='Explore the menu and add something delicious.' actionLabel='Browse menu' onAction={() => navigation.navigate('Menu')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <View style={styles.header}>
          <View><Text style={[styles.title, { color: colors.text }]}>Your cart</Text><Text style={[styles.subtitle, { color: colors.secondaryText }]}>{items.length} unique dishes</Text></View>
          <Pressable onPress={() => Alert.alert('Clear cart?', 'Remove every item from your cart?', [{ text: 'Keep items', style: 'cancel' }, { text: 'Clear', style: 'destructive', onPress: clearCart }])}>
            <Text style={[styles.clearText, { color: colors.danger }]}>Clear</Text>
          </Pressable>
        </View>

        {items.map((item) => <CartItemRow key={item.id} item={item} onIncrement={handleIncrement} onDecrement={handleDecrement} onRemove={handleRemove} onNoteChange={handleNote} />)}

        <View style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardTitleRow}><Ionicons name='pricetag-outline' size={20} color={colors.primary} /><Text style={[styles.cardTitle, { color: colors.text }]}>Promo code</Text></View>
          {promoCode ? (
            <View style={[styles.appliedPromo, { backgroundColor: colors.surfaceMuted }]}>
              <View><Text style={[styles.promoCode, { color: colors.primary }]}>{promoCode}</Text><Text style={[styles.promoMessage, { color: colors.secondaryText }]}>{discountPercent}% off your food total</Text></View>
              <Pressable onPress={() => { removePromo(); setPromoMessage(''); }}><Ionicons name='close-circle' size={24} color={colors.danger} /></Pressable>
            </View>
          ) : (
            <View style={styles.promoRow}>
              <TextInput value={promoInput} onChangeText={(value) => { setPromoInput(value.toUpperCase()); setPromoMessage(''); }} placeholder='WELCOME10 or FEAST20' placeholderTextColor={colors.secondaryText} autoCapitalize='characters' style={[styles.promoInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
              <Pressable onPress={submitPromo} style={[styles.applyButton, { backgroundColor: colors.primary }]}><Text style={styles.applyText}>Apply</Text></Pressable>
            </View>
          )}
          {promoMessage ? <Text style={[styles.feedback, { color: promoMessage.startsWith('Invalid') ? colors.danger : colors.success }]}>{promoMessage}</Text> : null}
        </View>

        <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Order summary</Text>
          <SummaryRow label='Subtotal' value={totals.subtotal} colors={colors} />
          <SummaryRow label='Service charge (5%)' value={totals.serviceCharge} colors={colors} />
          <SummaryRow label='Sales tax (15%)' value={totals.salesTax} colors={colors} />
          {totals.discount ? <SummaryRow label={'Discount (' + discountPercent + '%)'} value={-totals.discount} colors={colors} isDiscount /> : null}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.totalRow}><Text style={[styles.totalLabel, { color: colors.text }]}>Grand total</Text><Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(totals.grandTotal)}</Text></View>
        </View>
        <Pressable onPress={checkout} style={({ pressed }) => [styles.checkout, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
          <Text style={styles.checkoutText}>Review order</Text>
          <View style={styles.checkoutPrice}><Text style={styles.checkoutText}>{formatCurrency(totals.grandTotal)}</Text><Ionicons name='arrow-forward' size={20} color='#FFFFFF' /></View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, colors, isDiscount = false }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: isDiscount ? colors.success : colors.text }]}>{isDiscount ? '- ' : ''}{formatCurrency(Math.abs(value))}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  titleBlock: { paddingHorizontal: 18, paddingTop: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { fontSize: 27, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 2 },
  clearText: { fontSize: 14, fontWeight: '800' },
  promoCard: { borderWidth: 1, borderRadius: 19, padding: 15, marginTop: 4 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: '900' },
  promoRow: { flexDirection: 'row', gap: 9 },
  promoInput: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, minHeight: 45, fontSize: 13 },
  applyButton: { justifyContent: 'center', paddingHorizontal: 17, borderRadius: 12 },
  applyText: { color: '#FFFFFF', fontWeight: '900' },
  appliedPromo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 13, padding: 12 },
  promoCode: { fontSize: 15, fontWeight: '900' },
  promoMessage: { fontSize: 12, marginTop: 2 },
  feedback: { fontSize: 12, fontWeight: '700', marginTop: 9 },
  summary: { borderWidth: 1, borderRadius: 19, padding: 16, marginTop: 13 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '800' },
  divider: { height: 1, marginVertical: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 17, fontWeight: '900' },
  totalValue: { fontSize: 20, fontWeight: '900' },
  checkout: { minHeight: 56, borderRadius: 17, paddingHorizontal: 18, marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkoutPrice: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkoutText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  pressed: { opacity: 0.78 },
});
