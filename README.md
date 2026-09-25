# Saffron Table — Restaurant App MVP

Saffron Table is a frontend-only Expo/React Native restaurant application. It uses mock/local data, React Navigation, Context, reducers, custom hooks, and AsyncStorage. It has separate customer and manager experiences and does not use a backend, Firebase, Redux, Zustand, payments, or manager reports.

## Requirements

- Node.js 20.19 or newer
- npm
- Expo Go on an Android or iOS phone
- Phone and development computer connected to the same network

## Installation

1. Open a terminal in the project directory:

   ```powershell
   cd C:\Users\LENOVO\Desktop\MAD\restaurant-app-mvp
   ```

2. Install dependencies:

   ```powershell
   npm install
   ```

3. Start the Expo development server:

   ```powershell
   npx.cmd expo start
   ```

   On macOS/Linux, `npx expo start` is equivalent.

4. Open Expo Go and scan the QR code. If LAN discovery is unavailable, run `npx.cmd expo start --tunnel`.

## Test credentials

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer@example.com` | `Password123` |
| Manager | `manager@example.com` | `Manager123` |

New mock Customer or Manager accounts can also be created from the Sign Up tab. Accounts created there last for the current app session.

## Questions 3–10 compliance

| Question | Deliverable | Main files |
| --- | --- | --- |
| 3 | Login/signup with validation, mock users, Customer/Manager roles, one-second simulated login, loading state, and successful role navigation | `src/screens/LoginScreen.js`, `src/data/users.js` |
| 4 | Menu with 20 dishes, four categories, Daily Specials, unavailable states, FlatList, state/effects, and pull-to-refresh | `src/screens/MenuScreen.js`, `src/data/menu.js` |
| 5 | Search/ref controls with focus, clear, debounce, five recent searches, render counter, Back to Top, and empty state | `src/screens/MenuScreen.js`, `src/hooks/useDebounce.js` |
| 6 | Global authentication/theme state, custom context hooks, light/dark theme, profile, and manager-only navigation | `src/context/AuthContext.js`, `src/context/ThemeContext.js`, `src/screens/ProfileScreen.js`, `src/navigation/AppNavigator.js` |
| 7 | Reducer-driven cart with all required actions, promo codes, notes, quantities, and tab badge | `src/reducers/cartReducer.js`, `src/context/CartContext.js`, `src/screens/CartScreen.js` |
| 8 | Dedicated order summary using memoization, service charge, sales tax, discount, grand total, favourites, and sorting | `src/screens/OrderSummaryScreen.js`, `src/components/CartItemRow.js`, `src/screens/MenuScreen.js` |
| 9 | Reservation form/custom hooks, date/party/phone validation, 12:00–22:00 slots, confirmation modal, and cancellation | `src/screens/ReservationScreen.js`, `src/hooks/useForm.js`, `src/hooks/useDebounce.js`, `src/hooks/useReservation.js` |
| 10 | Pending/Preparing/Ready/Served tracking, 10/20/30-second timers with cleanup, manager controls, and AsyncStorage persistence | `src/screens/OrdersScreen.js`, `src/screens/ManagerDashboardScreen.js`, `src/context/OrdersContext.js`, `src/context/RestaurantContext.js` |

## Navigation

Customers receive Menu, Cart, Reservation, Orders, and Profile tabs. Cart opens the dedicated Order Summary screen before an order is confirmed. Managers receive Dashboard and Profile tabs. The active role is read from `AuthContext`, so customer screens are not included in manager navigation.

## Hooks usage

| Hook/API | Where used | Purpose |
| --- | --- | --- |
| `useState` | Login, Menu, Cart, Reservation, Dashboard | Local form, search, filter, modal, loading, and UI state |
| `useEffect` | Menu, OrdersContext, OrdersScreen, RestaurantContext | Debounced history, persistence, timers, elapsed time, and cleanup |
| `useRef` | MenuScreen | TextInput focus, FlatList scrolling, render count, and refresh timer |
| `useContext` | All `useAuth`, `useTheme`, `useCart`, `useOrders`, and `useRestaurant` hooks | Shared app state without prop drilling |
| `useReducer` | CartContext and OrdersContext | Predictable action-based cart/order transitions |
| `useMemo` | Menu, Cart, Order Summary, Dashboard, contexts | Derived filters, sorting, totals, statistics, and stable context values |
| `useCallback` | Cart, Order Summary, contexts | Stable handlers for memoized children and shared actions |
| `React.memo` | MenuItemCard, CartItemRow, OrderLine | Avoid unnecessary child renders when props are unchanged |
| `useForm` | Login and Reservation | Reusable values, validation errors, submit, and reset behavior |
| `useDebounce` | Menu and Reservation | Delay search/date-derived work until input settles |
| `useReservation` | ReservationScreen | Availability, selected table/time, creation, history, and cancellation |

## Why Context instead of prop drilling?

Authentication, theme, cart, orders, reservations, and menu edits are needed by unrelated screens at different navigator levels. Passing them through every intermediate navigator/component would create prop drilling and tightly couple screens. Context exposes focused custom hooks such as `useCart()` and `useAuth()`, so consumers read only the shared domain they need.

## Why useReducer instead of useState for the cart?

Cart behavior contains related transitions: add, remove, increment, decrement, update note, clear, apply promo, and remove promo. A reducer keeps these rules in one pure function and makes each transition explicit and independently testable. `useState` remains appropriate for simple isolated values such as a search query or modal visibility.

## Why useMemo and useCallback?

`useMemo` prevents repeated calculation of filtered/sorted menu data and monetary totals unless their inputs change. `useCallback` keeps event-handler references stable so memoized item rows do not re-render only because a parent rendered. These hooks are used where derived work or reference stability matters, rather than on every function.

## Dependency-array explanation

A hook dependency array must include every changing value from component scope that the effect, memo, or callback reads. This prevents stale closures and ensures derived data is recalculated when its real inputs change.

- Menu filtering depends on category, debounced search, favourites, menu items, and sort mode.
- Order totals depend on cart items and discount percentage.
- Reservation availability depends on date, time, party size, reservations, and tables.
- AsyncStorage effects depend on initialization plus the persisted orders/menu/reservations.
- Order status timers depend on initialized order state and return cleanup functions that call `clearTimeout`.
- The elapsed counter has an empty array because it starts once on mount and returns `clearInterval` on unmount.
- The menu refresh timer also returns cleanup on unmount.

Omitting a required dependency can leave the UI using old state. Adding an unstable object unnecessarily can cause repeated effects, so stable state setters and memoized callbacks are used where appropriate.

## Cart reducer test cases

These cases can be executed by dispatching each action to `cartReducer` with the described starting state.

| # | Starting state/action | Expected result |
| --- | --- | --- |
| 1 | Empty cart + `ADD_ITEM` with an available dish | Dish is added with quantity 1 and an empty note |
| 2 | Existing dish + `ADD_ITEM` for the same ID | Existing quantity increases by 1; no duplicate row |
| 3 | Any cart + `ADD_ITEM` with `isAvailable: false` | State is unchanged |
| 4 | Two dishes + `REMOVE_ITEM` for one ID | Only the matching dish is removed |
| 5 | Quantity 1 + `INCREMENT` | Quantity becomes 2 |
| 6 | Quantity 2 + `DECREMENT` | Quantity becomes 1 |
| 7 | Quantity 1 + `DECREMENT` | Dish is removed instead of reaching zero |
| 8 | Cart item + `UPDATE_NOTE` | Only the matching item note changes |
| 9 | Populated cart + `CLEAR_CART` | Items and promo state return to initial values |
| 10 | `APPLY_PROMO` with `WELCOME10` | Promo code becomes WELCOME10 and discount becomes 10% |
| 11 | `APPLY_PROMO` with `FEAST20` | Promo code becomes FEAST20 and discount becomes 20% |
| 12 | Active promo + `REMOVE_PROMO` | Promo code and discount are cleared |

## Persistence

AsyncStorage persists:

- Orders under `@restaurant/orders`
- Reservations under `@restaurant/reservations`
- Menu additions, price edits, and availability under `@restaurant/menu`

Cart and authentication remain session-only mock state by design.

## Screenshots

Add final device screenshots before submission:

| Screen | Screenshot |
| --- | --- |
| Login / Sign Up | Add `docs/screenshots/login.png` |
| Customer Menu | Add `docs/screenshots/menu.png` |
| Cart / Order Summary | Add `docs/screenshots/order-summary.png` |
| Reservation | Add `docs/screenshots/reservation.png` |
| Order Tracking | Add `docs/screenshots/order-tracking.png` |
| Manager Dashboard | Add `docs/screenshots/manager-dashboard.png` |
| Dark Theme | Add `docs/screenshots/dark-theme.png` |

## Demo video

Demo video link: **ADD_DEMO_VIDEO_LINK_HERE**
