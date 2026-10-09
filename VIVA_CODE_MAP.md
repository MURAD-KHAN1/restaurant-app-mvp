# Viva Code Map

Use Ctrl+F in a file, or Ctrl+Shift+F across the project, to search the CAPITAL section names below.
The `FILE`, `PURPOSE` and `VIVA` header explains each file. In JSX, section comments use `{/* ... */}` so they stay hidden in the app.

## Teacher asks: where do I edit?

| Teacher asks | Open this file | Search for |
| --- | --- | --- |
| Login change | [LoginScreen.js](src/screens/LoginScreen.js), [AuthContext.js](src/context/AuthContext.js) | LOGIN BUTTON / LOGIN FUNCTION |
| Register change | [LoginScreen.js](src/screens/LoginScreen.js), [AuthContext.js](src/context/AuthContext.js) | REGISTER BUTTON / REGISTER FUNCTION |
| Email or password input | [LoginScreen.js](src/screens/LoginScreen.js) | EMAIL INPUT / PASSWORD INPUT |
| Form errors | [LoginScreen.js](src/screens/LoginScreen.js), [useForm.js](src/hooks/useForm.js) | VALIDATION / ERROR MESSAGE |
| Menu change | [MenuScreen.js](src/screens/MenuScreen.js), [menu.js](src/data/menu.js) | FOOD ITEM LIST / MOCK / LOCAL MENU ITEMS |
| Search change | [MenuScreen.js](src/screens/MenuScreen.js), [useDebounce.js](src/hooks/useDebounce.js) | SEARCH BAR / SEARCH FUNCTION / WAIT BEFORE SEARCH |
| Category change | [MenuScreen.js](src/screens/MenuScreen.js), [CategoryChip.js](src/components/CategoryChip.js), [menu.js](src/data/menu.js) | CATEGORY FILTER / MENU CATEGORIES |
| Food name or price display | [MenuItemCard.js](src/components/MenuItemCard.js), [MenuScreen.js](src/screens/MenuScreen.js) | FOOD ITEM NAME / FOOD PRICE |
| Add to cart | [MenuItemCard.js](src/components/MenuItemCard.js), [MenuScreen.js](src/screens/MenuScreen.js), [CartContext.js](src/context/CartContext.js) | ADD TO CART BUTTON / ADD TO CART FUNCTION / DISPATCH CART ACTIONS |
| Favourite button or favourite filter | [MenuItemCard.js](src/components/MenuItemCard.js), [MenuScreen.js](src/screens/MenuScreen.js) | FAVORITE BUTTON / FAVOURITE FUNCTION / SORT |
| Cart quantity | [CartItemRow.js](src/components/CartItemRow.js), [CartScreen.js](src/screens/CartScreen.js), [cartReducer.js](src/reducers/cartReducer.js) | PLUS BUTTON / MINUS BUTTON / INCREASE ITEM QUANTITY / DECREASE ITEM QUANTITY |
| Remove cart item | [CartItemRow.js](src/components/CartItemRow.js), [cartReducer.js](src/reducers/cartReducer.js) | REMOVE ITEM BUTTON / REMOVE ITEM FROM CART |
| Kitchen notes | [CartItemRow.js](src/components/CartItemRow.js), [cartReducer.js](src/reducers/cartReducer.js) | NOTES INPUT / UPDATE ITEM NOTE |
| Empty cart or clear cart | [CartScreen.js](src/screens/CartScreen.js), [cartReducer.js](src/reducers/cartReducer.js) | EMPTY CART / CLEAR COMPLETE CART |
| Promo code | [CartScreen.js](src/screens/CartScreen.js), [CartContext.js](src/context/CartContext.js), [promoCodes.js](src/data/promoCodes.js), [cartReducer.js](src/reducers/cartReducer.js) | PROMO CODE / PROMO CODE VALIDATION / APPLY PROMO CODE |
| Total price, tax or service charge | [CartScreen.js](src/screens/CartScreen.js), [OrderSummaryScreen.js](src/screens/OrderSummaryScreen.js) | SUBTOTAL / DISCOUNT / TOTAL PRICE / PRICE CALCULATION RATES |
| Checkout button | [CartScreen.js](src/screens/CartScreen.js) | CHECKOUT / PLACE ORDER BUTTON |
| Place order | [OrderSummaryScreen.js](src/screens/OrderSummaryScreen.js), [OrdersContext.js](src/context/OrdersContext.js) | PLACE ORDER BUTTON / CONFIRM ORDER FUNCTION / CREATE ORDER |
| Dine-in, takeaway, table or pickup | [OrderSummaryScreen.js](src/screens/OrderSummaryScreen.js) | ORDER TYPE / TABLE / PICKUP TIME |
| Orders | [OrdersScreen.js](src/screens/OrdersScreen.js), [OrdersContext.js](src/context/OrdersContext.js) | ORDER LIST / ORDER DETAILS / LOAD ORDERS FROM ASYNCSTORAGE |
| Order status or tracking speed | [OrdersContext.js](src/context/OrdersContext.js), [OrdersScreen.js](src/screens/OrdersScreen.js), [OrderStatusStep.js](src/components/OrderStatusStep.js) | ORDER STATUS TIMER DELAYS / ORDER STATUS TIMERS / ORDER STATUS STEPS |
| Reservation | [ReservationScreen.js](src/screens/ReservationScreen.js), [useReservation.js](src/hooks/useReservation.js), [RestaurantContext.js](src/context/RestaurantContext.js) | RESERVATION BUTTON / VALIDATION / CREATE RESERVATION |
| Reservation date, time, guests or tables | [ReservationScreen.js](src/screens/ReservationScreen.js), [useReservation.js](src/hooks/useReservation.js), [tables.js](src/data/tables.js) | DATE / GUESTS / TIME SLOTS / AVAILABLE TABLES / LOCAL TABLE DATA |
| Cancel reservation | [ReservationScreen.js](src/screens/ReservationScreen.js), [useReservation.js](src/hooks/useReservation.js), [RestaurantContext.js](src/context/RestaurantContext.js) | CANCEL RESERVATION BUTTON / CANCEL RESERVATION |
| Profile | [ProfileScreen.js](src/screens/ProfileScreen.js) | USER INFORMATION / PROFILE UI |
| Dark/Light mode | [ThemeContext.js](src/context/ThemeContext.js), [ProfileScreen.js](src/screens/ProfileScreen.js), [colors.js](src/theme/colors.js) | DARK MODE / THEME TOGGLE / LIGHT THEME / DARK THEME |
| Logout | [AuthContext.js](src/context/AuthContext.js), [ProfileScreen.js](src/screens/ProfileScreen.js) | LOGOUT FUNCTION / LOGOUT BUTTON |
| Customer/Manager role | [AuthContext.js](src/context/AuthContext.js), [LoginScreen.js](src/screens/LoginScreen.js), [AppNavigator.js](src/navigation/AppNavigator.js) | CUSTOMER / MANAGER ROLE / CHECK USER LOGIN AND ROLE |
| Manager dashboard | [ManagerDashboardScreen.js](src/screens/ManagerDashboardScreen.js) | MANAGER DASHBOARD SECTIONS / DASHBOARD COUNTS |
| Manager order actions | [ManagerDashboardScreen.js](src/screens/ManagerDashboardScreen.js), [OrdersContext.js](src/context/OrdersContext.js) | MANAGER ACTION: UPDATE ORDER STATUS / UPDATE ORDER STATUS |
| Manager reservation actions | [ManagerDashboardScreen.js](src/screens/ManagerDashboardScreen.js), [RestaurantContext.js](src/context/RestaurantContext.js) | MANAGER ACTIONS: ACCEPT / DECLINE RESERVATION / MANAGER RESERVATION STATUS |
| Menu price change | [ManagerDashboardScreen.js](src/screens/ManagerDashboardScreen.js), [RestaurantContext.js](src/context/RestaurantContext.js) | MANAGER MENU PRICE CHANGE |
| Food availability | [ManagerDashboardScreen.js](src/screens/ManagerDashboardScreen.js), [RestaurantContext.js](src/context/RestaurantContext.js), [MenuItemCard.js](src/components/MenuItemCard.js) | AVAILABLE / UNAVAILABLE TOGGLE / FOOD AVAILABILITY |
| Add menu dish | [ManagerDashboardScreen.js](src/screens/ManagerDashboardScreen.js), [RestaurantContext.js](src/context/RestaurantContext.js) | ADD MENU ITEM FORM / ADD MENU ITEM |
| Navigation | [AppNavigator.js](src/navigation/AppNavigator.js) | CUSTOMER SCREENS / MANAGER SCREENS / BOTTOM TAB NAVIGATION / CUSTOMER STACK SCREENS |
| Cart reducer actions | [cartReducer.js](src/reducers/cartReducer.js) | ADD ITEM TO CART / INCREASE ITEM QUANTITY / APPLY PROMO CODE |
| Order reducer actions | [ordersReducer.js](src/reducers/ordersReducer.js) | LOAD ORDERS / PLACE ORDER / UPDATE ORDER STATUS |
| App starting point | [App.js](App.js), [index.js](index.js) | APP STARTS HERE / CONTEXT PROVIDERS / MAIN NAVIGATION / APP ENTRY REGISTRATION |
| Restaurant name or tagline | [brand.js](src/constants/brand.js) | RESTAURANT NAME AND TAGLINE |
| Price text, currency or colours | [colors.js](src/theme/colors.js) | FOOD PRICE / CURRENCY FORMAT / LIGHT THEME / DARK THEME |
| Button and screen animations | [Motion.js](src/components/Motion.js) | COMPONENT PROPS / BUTTON PRESS ANIMATION |
| Empty or loading display | [EmptyState.js](src/components/EmptyState.js), [LoadingScreen.js](src/components/LoadingScreen.js) | MAIN DISPLAY / OPTIONAL ACTION BUTTON |

## Important React Things For Viva

| Thing | Simple meaning |
| --- | --- |
| useState | Keeps a value and updates the screen when that value changes. |
| useEffect | Runs work after rendering and can clean up timers or other work. |
| useContext | Gets shared data from a Context provider. |
| useReducer | Updates related state using named actions and a reducer. |
| useMemo | Reuses a calculated value while its dependencies stay the same. |
| useCallback | Reuses a function reference while its dependencies stay the same. |
| useRef | Keeps a value or component reference without causing a render when it changes. |
| AsyncStorage | Saves local data on the device so it can be loaded again. |
| Context API | Shares values with components inside a provider. |
| Reducer | Takes the current state and an action, then returns the next state. |
| Navigation | Moves between named screens and tabs. |
| Props | Values and functions passed from a parent to a component. |
| State | Data that a component keeps and can update. |

## Important details in this frontend

- Login and registration share `LoginScreen.js`; the register function is named `signup`.
- `AuthContext.js` keeps login and new accounts in memory; it does not save or reload a login session with AsyncStorage.
- `OrdersContext.js` saves orders; `RestaurantContext.js` saves menu changes and reservations with AsyncStorage.
- `CartContext.js` shares cart items, promo values and item count; the two checkout screens each calculate prices.
- `CartItemRow.js` contains the actual quantity, remove and note controls.
- `MenuItemCard.js` contains the actual add-to-cart and favourite buttons, food name and price.
- Favourites stay in `MenuScreen.js` state; there is no profile favourites section.
- Order tracking moves to Preparing at 10 seconds, Ready at 20 seconds and Served at 30 seconds; manager actions can also move status forward.
- There is no cancel-order button in this frontend; reservations do have a cancel button.
- `useReservation.js` checks names, phone format, dates, advance time, guest count and table availability.
- The reservation debounce delays the displayed date hint; table checks use the current selected date.
- Customer tabs are Menu, Cart, Reserve, Orders and Profile; OrderSummary opens in the customer stack.
- Manager tabs are Dashboard and Profile. `AppNavigator.js` chooses screens using `user.role`.

## Files changed for viva comments

Only comments were added to these existing files:

- `App.js`
- `index.js`
- `src/navigation/AppNavigator.js`
- `src/screens/LoginScreen.js`
- `src/screens/MenuScreen.js`
- `src/screens/CartScreen.js`
- `src/screens/OrderSummaryScreen.js`
- `src/screens/OrdersScreen.js`
- `src/screens/ReservationScreen.js`
- `src/screens/ProfileScreen.js`
- `src/screens/ManagerDashboardScreen.js`
- `src/context/AuthContext.js`
- `src/context/CartContext.js`
- `src/context/OrdersContext.js`
- `src/context/RestaurantContext.js`
- `src/context/ThemeContext.js`
- `src/reducers/cartReducer.js`
- `src/reducers/ordersReducer.js`
- `src/hooks/useForm.js`
- `src/hooks/useDebounce.js`
- `src/hooks/useReservation.js`
- `src/components/CartItemRow.js`
- `src/components/MenuItemCard.js`
- `src/components/CategoryChip.js`
- `src/components/EmptyState.js`
- `src/components/LoadingScreen.js`
- `src/components/Motion.js`
- `src/components/OrderStatusStep.js`
- `src/data/menu.js`
- `src/data/users.js`
- `src/data/tables.js`
- `src/data/promoCodes.js`
- `src/data/reservations.js`
- `src/theme/colors.js`
- `src/constants/brand.js`

New documentation: `VIVA_CODE_MAP.md`.
