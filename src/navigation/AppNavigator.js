import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useTheme } from '../context/ThemeContext';
import CartScreen from '../screens/CartScreen';
import LoginScreen from '../screens/LoginScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';
import MenuScreen from '../screens/MenuScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReservationScreen from '../screens/ReservationScreen';

const Stack = createNativeStackNavigator();
const CustomerStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CUSTOMER_TABS = [
  { name: 'Menu', component: MenuScreen, icon: 'restaurant-outline', activeIcon: 'restaurant' },
  { name: 'Cart', component: CartScreen, icon: 'bag-handle-outline', activeIcon: 'bag-handle' },
  { name: 'Reserve', component: ReservationScreen, icon: 'calendar-outline', activeIcon: 'calendar' },
  { name: 'Orders', component: OrdersScreen, icon: 'receipt-outline', activeIcon: 'receipt' },
  { name: 'Profile', component: ProfileScreen, icon: 'person-outline', activeIcon: 'person' },
];

function TabIcon({ route, focused, color, size }) {
  const tab = CUSTOMER_TABS.find((item) => item.name === route.name);
  const managerIcons = {
    Dashboard: focused ? 'grid' : 'grid-outline',
    Profile: focused ? 'person' : 'person-outline',
  };
  return <Ionicons name={tab ? (focused ? tab.activeIcon : tab.icon) : managerIcons[route.name]} size={size} color={color} />;
}

function sharedTabOptions(colors) {
  return ({ route }) => ({
    headerShown: false,
    tabBarHideOnKeyboard: true,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.secondaryText,
    tabBarStyle: {
      backgroundColor: colors.tabBar,
      borderTopColor: colors.border,
      height: 68,
      paddingTop: 7,
      paddingBottom: 8,
    },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
    tabBarIcon: (props) => <TabIcon route={route} {...props} />,
  });
}

function CustomerTabs() {
  const { colors } = useTheme();
  const { itemCount } = useCart();
  return (
    <Tab.Navigator screenOptions={sharedTabOptions(colors)}>
      {CUSTOMER_TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={tab.name === 'Cart'
            ? { tabBarBadge: itemCount || undefined, tabBarBadgeStyle: { backgroundColor: colors.primary } }
            : undefined}
        />
      ))}
    </Tab.Navigator>
  );
}

function CustomerNavigator() {
  return (
    <CustomerStack.Navigator screenOptions={{ headerShown: false }}>
      <CustomerStack.Screen name='CustomerTabs' component={CustomerTabs} />
      <CustomerStack.Screen name='OrderSummary' component={OrderSummaryScreen} options={{ animation: 'slide_from_right' }} />
    </CustomerStack.Navigator>
  );
}

function ManagerTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator screenOptions={sharedTabOptions(colors)}>
      <Tab.Screen name='Dashboard' component={ManagerDashboardScreen} />
      <Tab.Screen name='Profile' component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { isInitialized } = useRestaurant();
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };

  if (!isInitialized) return <LoadingScreen />;

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!user ? (
          <Stack.Screen name='Authentication' component={LoginScreen} />
        ) : user.role === 'manager' ? (
          <Stack.Screen name='ManagerApp' component={ManagerTabs} />
        ) : (
          <Stack.Screen name='CustomerApp' component={CustomerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
