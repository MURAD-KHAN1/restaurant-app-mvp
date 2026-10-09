// ==================================================
// FILE: App.js
// PURPOSE: Starts the app and shares data with screens

// ===== IMPORTS =====
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { OrdersProvider } from './src/context/OrdersContext';
import { RestaurantProvider } from './src/context/RestaurantContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// Reset customer cart data whenever the signed-in account changes.
function SessionCart({ children }) {
  const { user } = useAuth();
  return <CartProvider key={user?.id ?? 'logged-out'}>{children}</CartProvider>;
}

// ===== CONTEXT PROVIDERS =====
function RestaurantApp() {
  // ===== GET SHARED DATA =====
  const { isDark } = useTheme();

  // ===== MAIN DISPLAY =====
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AuthProvider>
        <RestaurantProvider>
          <OrdersProvider>
            <SessionCart>
              {/* ===== MAIN NAVIGATION ===== */}
              <AppNavigator />
            </SessionCart>
          </OrdersProvider>
        </RestaurantProvider>
      </AuthProvider>
    </>
  );
}

// ===== APP STARTS HERE =====
export default function App() {
  // ===== MAIN DISPLAY =====
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RestaurantApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
