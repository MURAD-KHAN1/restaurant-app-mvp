import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import { useOrders } from '../context/OrdersContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../theme/colors';

const SECTIONS = [
  { key: 'orders', label: 'Orders', icon: 'receipt-outline' },
  { key: 'reservations', label: 'Reservations', icon: 'calendar-outline' },
  { key: 'menu', label: 'Menu', icon: 'restaurant-outline' },
];
const NEXT_STATUS = { Pending: 'Preparing', Preparing: 'Ready', Ready: 'Served' };
const EMPTY_ITEM = { name: '', description: '', price: '', category: 'Mains' };

export default function ManagerDashboardScreen() {
  const { colors } = useTheme();
  const { orders, updateOrderStatus } = useOrders();
  const { menuItems, reservations, addMenuItem, updateMenuPrice, toggleMenuAvailability, updateReservationStatus } = useRestaurant();
  const [section, setSection] = useState('orders');
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState(EMPTY_ITEM);
  const [priceDrafts, setPriceDrafts] = useState({});

  const stats = useMemo(() => ({
    orders: orders.filter((item) => item.status !== 'Served').length,
    reservations: reservations.filter((item) => item.status === 'Pending').length,
    unavailable: menuItems.filter((item) => !item.isAvailable).length,
  }), [menuItems, orders, reservations]);

  const saveNewItem = () => {
    const price = Number(newItem.price);
    if (!newItem.name.trim() || !newItem.description.trim() || !price || price < 1) {
      Alert.alert('Missing details', 'Enter a name, description, and valid price.');
      return;
    }
    addMenuItem({ ...newItem, name: newItem.name.trim(), description: newItem.description.trim(), price, image: 'restaurant-outline', isSpecial: false, isAvailable: true });
    setNewItem(EMPTY_ITEM);
    setShowAddItem(false);
  };

  const savePrice = (item) => {
    const nextPrice = Number(priceDrafts[item.id]);
    if (!nextPrice || nextPrice < 1) return Alert.alert('Invalid price', 'Enter a price greater than zero.');
    updateMenuPrice(item.id, nextPrice);
    setPriceDrafts((current) => ({ ...current, [item.id]: '' }));
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <View style={styles.headingRow}>
          <View><Text style={[styles.eyebrow, { color: colors.primary }]}>MANAGER VIEW</Text><Text style={[styles.title, { color: colors.text }]}>Dashboard</Text></View>
          <View style={[styles.managerIcon, { backgroundColor: colors.surfaceMuted }]}><Ionicons name='grid' size={24} color={colors.primary} /></View>
        </View>
        <View style={styles.statsRow}>
          <StatCard label='Active orders' value={stats.orders} icon='flame-outline' colors={colors} />
          <StatCard label='Pending tables' value={stats.reservations} icon='calendar-outline' colors={colors} />
          <StatCard label='Unavailable' value={stats.unavailable} icon='alert-circle-outline' colors={colors} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {SECTIONS.map((item) => <Pressable key={item.key} onPress={() => setSection(item.key)} style={[styles.tab, { backgroundColor: section === item.key ? colors.primary : colors.surface, borderColor: section === item.key ? colors.primary : colors.border }]}><Ionicons name={item.icon} size={17} color={section === item.key ? '#FFFFFF' : colors.secondaryText} /><Text style={{ color: section === item.key ? '#FFFFFF' : colors.text, fontWeight: '800', fontSize: 12 }}>{item.label}</Text></Pressable>)}
        </ScrollView>

        {section === 'orders' ? (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Incoming Orders</Text>
            {!orders.length ? <EmptyState icon='receipt-outline' title='No incoming orders' message='Customer orders will appear here.' /> : orders.map((order) => (
              <View key={order.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardTop}>
                  <View><Text style={[styles.cardTitle, { color: colors.text }]}>{order.id}</Text><Text style={[styles.meta, { color: colors.secondaryText }]}>{order.customerName} · {order.items.length} dishes</Text></View>
                  <View style={[styles.badge, { backgroundColor: colors.surfaceMuted }]}><Text style={[styles.badgeText, { color: colors.primary }]}>{order.status}</Text></View>
                </View>
                {order.items.map((item) => <Text key={item.id} style={[styles.lineItem, { color: colors.secondaryText }]}>{item.quantity} × {item.name}{item.note ? ' — ' + item.note : ''}</Text>)}
                <View style={[styles.cardFooter, { borderColor: colors.border }]}>
                  <Text style={[styles.orderTotal, { color: colors.text }]}>{formatCurrency(order.totals.grandTotal)}</Text>
                  {NEXT_STATUS[order.status] ? <Pressable onPress={() => updateOrderStatus(order.id, NEXT_STATUS[order.status])} style={[styles.primarySmall, { backgroundColor: colors.primary }]}><Text style={styles.whiteButtonText}>Mark {NEXT_STATUS[order.status]}</Text><Ionicons name='arrow-forward' size={15} color='#FFFFFF' /></Pressable> : <Text style={[styles.completeText, { color: colors.success }]}>Completed</Text>}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {section === 'reservations' ? (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reservations</Text>
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
                  <Info icon='restaurant-outline' text={item.tableId} colors={colors} />
                </View>
                {item.status === 'Pending' ? (
                  <View style={styles.decisionRow}>
                    <Pressable onPress={() => updateReservationStatus(item.id, 'Declined')} style={[styles.declineButton, { borderColor: colors.danger }]}><Text style={[styles.declineText, { color: colors.danger }]}>Decline</Text></Pressable>
                    <Pressable onPress={() => updateReservationStatus(item.id, 'Accepted')} style={[styles.acceptButton, { backgroundColor: colors.success }]}><Ionicons name='checkmark' size={18} color='#FFFFFF' /><Text style={styles.whiteButtonText}>Accept</Text></Pressable>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {section === 'menu' ? (
          <View>
            <View style={styles.menuHeading}><Text style={[styles.sectionTitle, { color: colors.text }]}>Menu Management</Text><Pressable onPress={() => setShowAddItem(true)} style={[styles.addButton, { backgroundColor: colors.primary }]}><Ionicons name='add' size={18} color='#FFFFFF' /><Text style={styles.whiteButtonText}>Add item</Text></Pressable></View>
            {menuItems.map((item) => (
              <View key={item.id} style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }, !item.isAvailable && styles.unavailable]}>
                <View style={[styles.menuIcon, { backgroundColor: colors.surfaceMuted }]}><Ionicons name={item.image || 'restaurant-outline'} size={25} color={colors.primary} /></View>
                <View style={styles.menuDetails}>
                  <Text style={[styles.menuName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.meta, { color: colors.secondaryText }]}>{item.category} · {formatCurrency(item.price)}</Text>
                  <View style={styles.priceRow}>
                    <TextInput value={priceDrafts[item.id] ?? ''} onChangeText={(value) => setPriceDrafts((current) => ({ ...current, [item.id]: value }))} placeholder='New price' placeholderTextColor={colors.secondaryText} keyboardType='numeric' style={[styles.priceInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
                    <Pressable onPress={() => savePrice(item)} style={[styles.savePrice, { backgroundColor: colors.surfaceMuted }]}><Text style={[styles.savePriceText, { color: colors.primary }]}>Save</Text></Pressable>
                  </View>
                </View>
                <Pressable accessibilityLabel={'Toggle availability for ' + item.name} onPress={() => toggleMenuAvailability(item.id)} style={[styles.toggle, { backgroundColor: item.isAvailable ? colors.success : colors.border }]}><View style={[styles.toggleKnob, item.isAvailable && styles.toggleKnobOn]} /></Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

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
            <Pressable onPress={saveNewItem} style={[styles.modalSave, { backgroundColor: colors.primary }]}><Text style={styles.whiteButtonText}>Add to menu</Text></Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon, colors }) {
  return <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons name={icon} size={20} color={colors.primary} /><Text style={[styles.statValue, { color: colors.text }]}>{value}</Text><Text numberOfLines={2} style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text></View>;
}

function Info({ icon, text, colors }) {
  return <View style={styles.info}><Ionicons name={icon} size={15} color={colors.primary} /><Text style={[styles.infoText, { color: colors.text }]}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  managerIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 17 },
  statCard: { flex: 1, minHeight: 108, borderWidth: 1, borderRadius: 17, padding: 11 },
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
  menuIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
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
