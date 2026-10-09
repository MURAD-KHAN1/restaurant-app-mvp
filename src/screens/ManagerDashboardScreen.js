import { apiRequest } from '../api/client';
import { normalizeMenu } from '../api/menu';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
// ==================================================
// FILE: ManagerDashboardScreen.js
// PURPOSE: Shows manager orders, reservations and menu tools
// VIVA: Edit manager actions, menu prices, availability and new dishes here
// ==================================================

// ===== IMPORTS =====
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Alert from '../utils/alerts';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import { FadeSlideView, ScalePressable } from '../components/Motion';
import { BRAND_SHORT_NAME } from '../constants/brand';
import { useOrders } from '../context/OrdersContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../theme/colors';

// ===== MANAGER DASHBOARD SECTIONS =====
const SECTIONS = [
  { key: 'orders', label: 'Orders', icon: 'receipt-outline' },
  { key: 'reservations', label: 'Reservations', icon: 'calendar-outline' },
  { key: 'menu', label: 'Menu', icon: 'restaurant-outline' },
];
const NEXT_STATUS = { Pending: 'Preparing', Preparing: 'Ready', Ready: 'Served' };
const EMPTY_ITEM = { name: '', description: '', price: '', category: 'Mains' };

export default function ManagerDashboardScreen() {
  // ===== GET SHARED DATA =====
  const { colors } = useTheme();
  const { orders, updateOrderStatus, loading: ordersLoading, error: ordersError, refetchOrders } = useOrders();
  const { menuItems, setMenuItems, reservations, updateReservationStatus,
    reservationsLoading, reservationsError, refetchReservations } = useRestaurant();
  const { token } = useAuth();
  const { loading, error, refetch } = useApi('/menu', { transform: normalizeMenu, onData: setMenuItems });
  const [isSaving, setIsSaving] = useState(false);
  const mutationBusy = useRef(false);
  const runMutation = async (method, id, body, onSuccess) => {
    if (mutationBusy.current) return;
    mutationBusy.current = true;
    setIsSaving(true);
    try {
      await apiRequest('/menu' + (id ? '/' + id : ''), { method, body }, token);
      onSuccess?.();
      await refetch();
    } catch (failure) {
      const message = failure.status === 401 ? 'Your session has expired. Please log in again.'
        : failure.status === 403 ? 'A manager account is required for this action.' : failure.message;
      Alert.alert('Menu action failed', message || 'Please try again.');
    } finally { mutationBusy.current = false; setIsSaving(false); }
  };
  // ===== LOCAL STATE =====
  const [section, setSection] = useState('orders');
  const [isUpdating, setIsUpdating] = useState(false);
  const updating = useRef(false);
  const statusAction = async action => {
    if (updating.current) return;
    updating.current = true; setIsUpdating(true);
    try { await action(); } catch (failure) { Alert.alert('Update failed', failure.message || 'Please try again.'); }
    finally { updating.current = false; setIsUpdating(false); }
  };
  const dashboardLoading = section === 'orders' ? ordersLoading : section === 'reservations' ? reservationsLoading : loading;
  const refreshDashboard = () => (section === 'orders' ? refetchOrders() : section === 'reservations' ? refetchReservations() : refetch()).catch(() => {});
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState(EMPTY_ITEM);
  const [priceDrafts, setPriceDrafts] = useState({});

  // ===== DASHBOARD COUNTS =====
  const stats = useMemo(() => ({
    orders: orders.filter((item) => !['Served', 'Cancelled'].includes(item.status)).length,
    reservations: reservations.filter((item) => item.status === 'Pending').length,
    unavailable: menuItems.filter((item) => !item.isAvailable).length,
  }), [menuItems, orders, reservations]);

  // ===== ADD MENU ITEM VALIDATION =====
  const saveNewItem = () => {
    const price = Number(newItem.price);
    if (!newItem.name.trim() || !newItem.description.trim() || !['Starters', 'Mains', 'Desserts', 'Drinks'].includes(newItem.category) || !newItem.price.trim() || !Number.isFinite(price) || price < 0) {
      Alert.alert('Missing details', 'Enter a name, description, and valid price.');
      return;
    }
    runMutation('POST', null, { name: newItem.name.trim(), description: newItem.description.trim(),
      category: newItem.category, price, available: true, isSpecial: false }, () => {
      setNewItem(EMPTY_ITEM); setShowAddItem(false);
    });
  };

  // ===== MANAGER MENU PRICE CHANGE =====
  const savePrice = (item) => {
    const nextPrice = Number(priceDrafts[item.id]);
    if (!priceDrafts[item.id]?.trim() || !Number.isFinite(nextPrice) || nextPrice < 0) return Alert.alert('Invalid price', 'Enter a valid, non-negative price.');
    runMutation('PUT', item.id, { price: nextPrice }, () => {
      setPriceDrafts((current) => ({ ...current, [item.id]: '' }));
    });
  };

  // ===== MAIN DISPLAY =====
  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled' refreshControl={<RefreshControl refreshing={dashboardLoading} onRefresh={refreshDashboard} tintColor={colors.primary} />}>
        <View style={styles.headingRow}>
          <View><Text style={[styles.eyebrow, { color: colors.primary }]}>{BRAND_SHORT_NAME.toUpperCase()} · MANAGER</Text><Text style={[styles.title, { color: colors.text }]}>Dashboard</Text></View>
          <View style={[styles.managerIcon, { backgroundColor: colors.surfaceMuted }]}><Ionicons name='grid' size={24} color={colors.primary} /></View>
        </View>
        <View style={styles.statsRow}>
          <StatCard delay={40} label='Active orders' value={stats.orders} icon='flame-outline' colors={colors} />
          <StatCard delay={110} label='Pending tables' value={stats.reservations} icon='calendar-outline' colors={colors} />
          <StatCard delay={180} label='Unavailable' value={stats.unavailable} icon='alert-circle-outline' colors={colors} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {SECTIONS.map((item) => <ScalePressable key={item.key} onPress={() => setSection(item.key)} style={[styles.tab, { backgroundColor: section === item.key ? colors.primary : colors.surface, borderColor: section === item.key ? colors.primary : colors.border }]}><Ionicons name={item.icon} size={17} color={section === item.key ? '#FFFFFF' : colors.secondaryText} /><Text style={{ color: section === item.key ? '#FFFFFF' : colors.text, fontWeight: '800', fontSize: 12 }}>{item.label}</Text></ScalePressable>)}
        </ScrollView>

        {/* ===== MANAGER ORDERS SECTION ===== */}
        {section === 'orders' ? (
          <FadeSlideView key='orders'>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Incoming Orders</Text>
            <Pressable accessibilityLabel='Refresh manager orders' onPress={refreshDashboard}><Text style={{ color: colors.primary, marginBottom: 10 }}>Refresh orders</Text></Pressable>
            {ordersLoading || isUpdating ? <ActivityIndicator color={colors.primary} /> : null}
            {ordersError ? <EmptyState icon='alert-circle-outline' title='Unable to load orders' message={ordersError} actionLabel='Retry' onAction={refreshDashboard} /> : null}
            {!orders.length ? <EmptyState icon='receipt-outline' title='No incoming orders' message='Customer orders will appear here.' /> : orders.map((order) => (
              <View key={order.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardTop}>
                  <View><Text style={[styles.cardTitle, { color: colors.text }]}>{order.id}</Text><Text style={[styles.meta, { color: colors.secondaryText }]}>{order.customerName} · {order.items.length} dishes</Text></View>
                  <View style={[styles.badge, { backgroundColor: colors.surfaceMuted }]}><Text style={[styles.badgeText, { color: colors.primary }]}>{order.status}</Text></View>
                </View>
                {order.items.map((item) => <Text key={item.id} style={[styles.lineItem, { color: colors.secondaryText }]}>{item.quantity} × {item.name}{item.note ? ' — ' + item.note : ''}</Text>)}
                <View style={[styles.cardFooter, { borderColor: colors.border }]}>
                  <Text style={[styles.orderTotal, { color: colors.text }]}>{formatCurrency(order.total ?? order.totals?.grandTotal ?? 0)}</Text>
                  {/* ===== MANAGER ACTION: UPDATE ORDER STATUS ===== */}
                  {NEXT_STATUS[order.status] ? <ScalePressable disabled={isUpdating} onPress={() => statusAction(() => updateOrderStatus(order.id, NEXT_STATUS[order.status]))} style={[styles.primarySmall, { backgroundColor: colors.primary }]}><Text style={styles.whiteButtonText}>Mark {NEXT_STATUS[order.status]}</Text><Ionicons name='arrow-forward' size={15} color='#FFFFFF' /></ScalePressable> : <Text style={[styles.completeText, { color: colors.success }]}>{order.status === 'Cancelled' ? 'Cancelled' : 'Completed'}</Text>}
                </View>
                {order.status === 'Pending' ? <Pressable disabled={isUpdating} onPress={() => statusAction(() => updateOrderStatus(order.id, 'Cancelled'))}><Text style={{ color: colors.danger, marginTop: 8 }}>Cancel order</Text></Pressable> : null}
              </View>
            ))}
          </FadeSlideView>
        ) : null}

        {/* ===== MANAGER RESERVATIONS SECTION ===== */}
        {section === 'reservations' ? (
          <FadeSlideView key='reservations'>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reservations</Text>
            <Pressable accessibilityLabel='Refresh manager reservations' onPress={refreshDashboard}><Text style={{ color: colors.primary, marginBottom: 10 }}>Refresh reservations</Text></Pressable>
            {reservationsLoading || isUpdating ? <ActivityIndicator color={colors.primary} /> : null}
            {reservationsError ? <EmptyState icon='alert-circle-outline' title='Unable to load reservations' message={reservationsError} actionLabel='Retry' onAction={refreshDashboard} /> : null}
            {!reservations.length ? <EmptyState icon='calendar-outline' title='No reservations' message='Guest reservation requests will appear here.' /> : reservations.map((item) => (
              <View key={item.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardTop}>
                  <View style={styles.guestRow}><View style={[styles.guestIcon, { backgroundColor: colors.surfaceMuted }]}><Ionicons name='people' size={20} color={colors.primary} /></View><View><Text style={[styles.cardTitle, { color: colors.text }]}>{item.customerName}</Text><Text style={[styles.meta, { color: colors.secondaryText }]}>{item.phone}</Text></View></View>
                  <Text style={[styles.badgeText, { color: item.status === 'Declined' || item.status === 'Cancelled' ? colors.danger : colors.primary }]}>{item.status}</Text>
                </View>
                <View style={[styles.reservationInfo, { backgroundColor: colors.background }]}>
                  <Info icon='calendar-outline' text={item.date} colors={colors} />
                  <Info icon='time-outline' text={item.time} colors={colors} />
                  <Info icon='people-outline' text={item.partySize + ' guests'} colors={colors} />
                  <Info icon='restaurant-outline' text={item.tableLabel} colors={colors} />
                </View>
                {/* ===== MANAGER ACTIONS: ACCEPT / DECLINE RESERVATION ===== */}
                {item.status === 'Pending' ? (
                  <View style={styles.decisionRow}>
                    <ScalePressable disabled={isUpdating} onPress={() => statusAction(() => updateReservationStatus(item.id, 'Declined'))} style={[styles.declineButton, { borderColor: colors.danger }]}><Text style={[styles.declineText, { color: colors.danger }]}>Decline</Text></ScalePressable>
                    <ScalePressable disabled={isUpdating} onPress={() => statusAction(() => updateReservationStatus(item.id, 'Accepted'))} style={[styles.acceptButton, { backgroundColor: colors.success }]}><Ionicons name='checkmark' size={18} color='#FFFFFF' /><Text style={styles.whiteButtonText}>Accept</Text></ScalePressable>
                  </View>
                ) : null}
              </View>
            ))}
          </FadeSlideView>
        ) : null}

        {/* ===== MENU MANAGEMENT ===== */}
        {section === 'menu' ? (
          <FadeSlideView key='menu'>
            <View style={styles.menuHeading}><Text style={[styles.sectionTitle, { color: colors.text }]}>Menu Management</Text><ScalePressable disabled={isSaving} onPress={() => setShowAddItem(true)} style={[styles.addButton, { backgroundColor: colors.primary }]}><Ionicons name='add' size={18} color='#FFFFFF' /><Text style={styles.whiteButtonText}>Add item</Text></ScalePressable></View>
            <Pressable accessibilityLabel='Refresh manager menu' disabled={loading} onPress={() => refetch().catch(() => {})}><Text style={{ color: colors.primary, marginBottom: 10 }}>Refresh menu</Text></Pressable>
            {loading || isSaving ? <ActivityIndicator color={colors.primary} /> : null}
            {error ? <EmptyState icon='alert-circle-outline' title='Unable to load menu' message={error} actionLabel='Retry' onAction={() => refetch().catch(() => {})} /> : null}
            {menuItems.map((item) => (
              <View key={item.id} style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }, !item.isAvailable && styles.unavailable]}>
                <View style={[styles.menuIcon, { backgroundColor: colors.surfaceMuted }]}>{item.image ? <Image source={item.image} style={styles.menuImage} resizeMode='cover' /> : <Ionicons name={item.icon || 'restaurant-outline'} size={25} color={colors.primary} />}</View>
                <View style={styles.menuDetails}>
                  <Text style={[styles.menuName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.meta, { color: colors.secondaryText }]}>{item.category} · {formatCurrency(item.price)}</Text>
                  {/* ===== MANAGER MENU PRICE CHANGE ===== */}
                  <View style={styles.priceRow}>
                    <TextInput value={priceDrafts[item.id] ?? ''} onChangeText={(value) => setPriceDrafts((current) => ({ ...current, [item.id]: value }))} placeholder='New price' placeholderTextColor={colors.secondaryText} keyboardType='numeric' style={[styles.priceInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
                    <ScalePressable disabled={isSaving} onPress={() => savePrice(item)} style={[styles.savePrice, { backgroundColor: colors.surfaceMuted }]}><Text style={[styles.savePriceText, { color: colors.primary }]}>Save</Text></ScalePressable>
                  </View>
                </View>
                <Pressable disabled={isSaving} accessibilityLabel={'Delete ' + item.name} onPress={() => Alert.alert('Delete menu item?', item.name, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => runMutation('DELETE', item.id) },
                ])}><Ionicons name='trash-outline' size={20} color={colors.danger} /></Pressable>
                {/* ===== AVAILABLE / UNAVAILABLE TOGGLE ===== */}
                <Pressable accessibilityLabel={'Toggle availability for ' + item.name} disabled={isSaving} onPress={() => runMutation('PUT', item.id, { available: !item.isAvailable })} style={[styles.toggle, { backgroundColor: item.isAvailable ? colors.success : colors.border }]}><View style={[styles.toggleKnob, item.isAvailable && styles.toggleKnobOn]} /></Pressable>
              </View>
            ))}
          </FadeSlideView>
        ) : null}
      </ScrollView>

      {/* ===== ADD MENU ITEM FORM ===== */}
      <Modal visible={showAddItem} transparent animationType='slide' onRequestClose={() => setShowAddItem(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalTop}><Text style={[styles.modalTitle, { color: colors.text }]}>Add menu item</Text><Pressable onPress={() => setShowAddItem(false)}><Ionicons name='close' size={25} color={colors.secondaryText} /></Pressable></View>
            <TextInput value={newItem.name} onChangeText={(value) => setNewItem((current) => ({ ...current, name: value }))} placeholder='Dish name' placeholderTextColor={colors.secondaryText} style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]} />
            <TextInput value={newItem.description} onChangeText={(value) => setNewItem((current) => ({ ...current, description: value }))} placeholder='Description' placeholderTextColor={colors.secondaryText} multiline style={[styles.modalInput, styles.descriptionInput, { color: colors.text, borderColor: colors.border }]} />
            <TextInput value={newItem.price} onChangeText={(value) => setNewItem((current) => ({ ...current, price: value }))} placeholder='Price in PKR' placeholderTextColor={colors.secondaryText} keyboardType='numeric' style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]} />
            <Text style={[styles.inputLabel, { color: colors.text }]}>Category</Text>
            <View style={styles.categoryRow}>
              {['Starters', 'Mains', 'Desserts', 'Drinks'].map((category) => <Pressable key={category} onPress={() => setNewItem((current) => ({ ...current, category }))} style={[styles.categoryButton, { borderColor: newItem.category === category ? colors.primary : colors.border, backgroundColor: newItem.category === category ? colors.surfaceMuted : colors.surface }]}><Text style={{ color: newItem.category === category ? colors.primary : colors.secondaryText, fontSize: 11, fontWeight: '800' }}>{category}</Text></Pressable>)}
            </View>
            <ScalePressable disabled={isSaving} onPress={saveNewItem} style={[styles.modalSave, { backgroundColor: colors.primary }]}><Text style={styles.whiteButtonText}>Add to menu</Text></ScalePressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatCard({ delay, label, value, icon, colors }) {
  // ===== MAIN DISPLAY =====
  return <FadeSlideView delay={delay} style={styles.statSlot}><View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}><Ionicons name={icon} size={20} color={colors.primary} /><Text style={[styles.statValue, { color: colors.text }]}>{value}</Text><Text numberOfLines={2} style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text></View></FadeSlideView>;
}

function Info({ icon, text, colors }) {
  // ===== MAIN DISPLAY =====
  return <View style={styles.info}><Ionicons name={icon} size={15} color={colors.primary} /><Text style={[styles.infoText, { color: colors.text }]}>{text}</Text></View>;
}

// ===== SCREEN DESIGN / STYLES =====
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  managerIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 17 },
  statSlot: { flex: 1 },
  statCard: { minHeight: 108, borderWidth: 1, borderRadius: 18, padding: 11, elevation: 2, shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  statValue: { fontSize: 23, fontWeight: '900', marginTop: 7 },
  statLabel: { fontSize: 10, lineHeight: 13, marginTop: 2 },
  tabs: { paddingVertical: 18 },
  tab: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 21, fontWeight: '900', marginBottom: 11 },
  card: { borderWidth: 1, borderRadius: 19, padding: 14, marginBottom: 11 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: '900' },
  meta: { fontSize: 11, marginTop: 3 },
  badge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '900' },
  lineItem: { fontSize: 12, marginTop: 7 },
  cardFooter: { borderTopWidth: 1, marginTop: 12, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: 15, fontWeight: '900' },
  primarySmall: { borderRadius: 11, paddingHorizontal: 11, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  whiteButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  completeText: { fontSize: 12, fontWeight: '900' },
  guestRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  guestIcon: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  reservationInfo: { borderRadius: 13, padding: 11, flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, rowGap: 9 },
  info: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 11, fontWeight: '700' },
  decisionRow: { flexDirection: 'row', gap: 9, marginTop: 12 },
  declineButton: { flex: 1, minHeight: 41, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  declineText: { fontSize: 12, fontWeight: '900' },
  acceptButton: { flex: 1, minHeight: 41, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  menuHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 9 },
  menuCard: { borderWidth: 1, borderRadius: 17, padding: 11, marginBottom: 9, flexDirection: 'row', alignItems: 'center' },
  unavailable: { opacity: 0.62 },
  menuIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10, overflow: 'hidden' },
  menuImage: { width: '100%', height: '100%' },
  menuDetails: { flex: 1 },
  menuName: { fontSize: 13, fontWeight: '900' },
  priceRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  priceInput: { flex: 1, minHeight: 35, borderWidth: 1, borderRadius: 9, paddingHorizontal: 9, fontSize: 11 },
  savePrice: { minWidth: 47, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  savePriceText: { fontSize: 11, fontWeight: '900' },
  toggle: { width: 43, height: 24, borderRadius: 12, marginLeft: 9, padding: 3, justifyContent: 'center' },
  toggleKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF' },
  toggleKnobOn: { alignSelf: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 30 },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 17 },
  modalTitle: { fontSize: 21, fontWeight: '900' },
  modalInput: { minHeight: 48, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, marginBottom: 11 },
  descriptionInput: { minHeight: 74, paddingTop: 12, textAlignVertical: 'top' },
  inputLabel: { fontSize: 12, fontWeight: '800', marginBottom: 8 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  categoryButton: { borderWidth: 1, borderRadius: 11, paddingHorizontal: 10, paddingVertical: 8 },
  modalSave: { minHeight: 49, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
});
