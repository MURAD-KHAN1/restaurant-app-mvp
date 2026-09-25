import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { orders } = useOrders();
  const { reservations } = useRestaurant();
  const orderCount = orders.filter((order) => order.customerEmail === user.email).length;
  const reservationCount = reservations.filter((item) => item.customerEmail === user.email).length;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <View style={[styles.profileCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}><Text style={styles.initial}>{user.name.charAt(0).toUpperCase()}</Text></View>
          <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.email, { color: colors.secondaryText }]}>{user.email}</Text>
          <View style={[styles.rolePill, { backgroundColor: colors.surfaceMuted }]}><Ionicons name={user.role === 'manager' ? 'briefcase-outline' : 'person-outline'} size={15} color={colors.primary} /><Text style={[styles.roleText, { color: colors.primary }]}>{user.role === 'manager' ? 'Restaurant Manager' : 'Customer'}</Text></View>
          {user.role === 'customer' ? <View style={[styles.stats, { borderColor: colors.border }]}><View style={styles.stat}><Text style={[styles.statNumber, { color: colors.text }]}>{orderCount}</Text><Text style={[styles.statLabel, { color: colors.secondaryText }]}>Orders</Text></View><View style={[styles.statDivider, { backgroundColor: colors.border }]} /><View style={styles.stat}><Text style={[styles.statNumber, { color: colors.text }]}>{reservationCount}</Text><Text style={[styles.statLabel, { color: colors.secondaryText }]}>Reservations</Text></View></View> : null}
        </View>

        <View style={[styles.setting, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.settingIcon, { backgroundColor: colors.surfaceMuted }]}><Ionicons name={isDark ? 'moon' : 'sunny'} size={21} color={colors.primary} /></View>
          <View style={styles.settingText}><Text style={[styles.settingTitle, { color: colors.text }]}>Dark theme</Text><Text style={[styles.settingSubtitle, { color: colors.secondaryText }]}>Use {isDark ? 'light' : 'dark'} restaurant colours</Text></View>
          <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: colors.border, true: colors.primary }} thumbColor='#FFFFFF' />
        </View>

        <Pressable onPress={() => Alert.alert('Log out?', 'You can sign back in with a demo account.', [{ text: 'Stay', style: 'cancel' }, { text: 'Log out', style: 'destructive', onPress: logout }])} style={[styles.logout, { borderColor: colors.danger }]}>
          <Ionicons name='log-out-outline' size={21} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Log out</Text>
        </Pressable>
        <Text style={[styles.footer, { color: colors.secondaryText }]}>Saffron Table MVP · Local demo data only</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, padding: 17 },
  title: { fontSize: 27, fontWeight: '900', marginBottom: 18 },
  profileCard: { borderRadius: 23, padding: 20, alignItems: 'center', elevation: 3, shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  avatar: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#FFFFFF', fontSize: 31, fontWeight: '900' },
  name: { fontSize: 21, fontWeight: '900', marginTop: 13 },
  email: { fontSize: 13, marginTop: 4 },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 14, marginTop: 12 },
  roleText: { fontSize: 12, fontWeight: '900' },
  stats: { alignSelf: 'stretch', borderTopWidth: 1, marginTop: 18, paddingTop: 16, flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1 },
  setting: { borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  settingIcon: { width: 43, height: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  settingText: { flex: 1, marginLeft: 11 },
  settingTitle: { fontSize: 15, fontWeight: '800' },
  settingSubtitle: { fontSize: 11, marginTop: 3 },
  logout: { minHeight: 50, borderRadius: 15, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  logoutText: { fontSize: 15, fontWeight: '900' },
  footer: { marginTop: 'auto', textAlign: 'center', fontSize: 11, paddingTop: 20 },
});
