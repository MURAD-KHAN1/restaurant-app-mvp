# Saffron Table — Restaurant App MVP

Saffron Table is a frontend-only restaurant mobile application built with **React Native and Expo**.

The app provides separate interfaces for **Customers** and **Restaurant Managers**. It uses mock/local data, React Hooks, Context API, reducers, React Navigation, and AsyncStorage.

There is **no backend, no real database, no real payment gateway, and no external API**.

---

## Technologies Used

- React Native
- Expo
- JavaScript
- React Navigation
- Context API
- React Hooks
- useReducer
- AsyncStorage
- Ionicons / Expo Vector Icons

---

## Main Features

### Customer

- Login and Sign Up
- Browse restaurant menu
- Food categories
- Search menu items
- Sort menu items
- Add favourites
- Add items to cart
- Change item quantity
- Add special instructions
- Apply promo codes
- View Order Summary
- Reserve a table
- Place Dine-In or Takeaway order
- Track order status
- Light / Dark Theme
- Profile and Logout

### Manager

- Manager Login
- View incoming orders
- Update order status
- View reservations
- Accept / Decline reservations
- Add menu items
- Edit menu prices
- Toggle item availability
- Profile and Logout

---

## Requirements

- Node.js 20.19 or newer
- npm
- Expo Go
- Android or iOS phone

---

## Installation

Open terminal in the project folder:

```powershell
cd C:\Users\LENOVO\Desktop\MAD\restaurant-app-mvp
```

Install packages:

```powershell
npm install
```

Run the app:

```powershell
npx.cmd expo start
```

Open **Expo Go** on your phone and scan the QR code.

If normal connection does not work:

```powershell
npx.cmd expo start --tunnel
```

---

## Test Login Accounts

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer@example.com` | `Password123` |
| Manager | `manager@example.com` | `Manager123` |

---

## Project Structure

```text
restaurant-app-mvp
│
├── A1
│   ├── SRS.pdf
│   └── UML
│
├── assets
│   └── menu
│
├── screenshots
│
├── src
│   ├── components
│   ├── context
│   ├── data
│   ├── hooks
│   ├── navigation
│   ├── reducers
│   ├── screens
│   └── theme
│
├── App.js
├── app.json
├── package.json
├── package-lock.json
└── README.md
```

---

## Assignment Questions 3–10

| Question | Work |
| --- | --- |
| Q3 | Login and Signup using `useState` |
| Q4 | Menu Browsing using `useState` and `useEffect` |
| Q5 | Search and Scroll Controls using `useRef` |
| Q6 | Authentication and Theme using `useContext` |
| Q7 | Cart Management using `useReducer` |
| Q8 | Order Summary using `useMemo`, `useCallback`, `React.memo` |
| Q9 | Table Reservation using Custom Hooks |
| Q10 | Order Tracking, Manager Dashboard and AsyncStorage |

---

## Hooks Used

| Hook | Purpose |
| --- | --- |
| `useState` | Forms, search, filters and local UI state |
| `useEffect` | Loading, timers and AsyncStorage |
| `useRef` | Search input, FlatList and render counter |
| `useContext` | Auth, Theme, Cart and Orders |
| `useReducer` | Cart and Order state management |
| `useMemo` | Menu filtering and total calculations |
| `useCallback` | Stable event handlers |
| `React.memo` | Reduce unnecessary component renders |
| `useForm` | Reusable form validation |
| `useDebounce` | Search delay |
| `useReservation` | Reservation logic |

---

## Why Context API?

Context API is used because user information, theme, cart, orders and restaurant data are required on different screens.

Without Context, the same data would need to be passed through many components using props.

One drawback is that Context consumers can re-render when the Context value changes.

---

## Why useReducer for Cart?

The cart has many related actions:

- Add Item
- Remove Item
- Increment
- Decrement
- Update Note
- Clear Cart
- Apply Promo
- Remove Promo

`useReducer` keeps these actions in one organized reducer.

For simple values like search text or modal visibility, `useState` is enough.

---

## useMemo and useCallback

`useMemo` is used for:

- Menu filtering
- Sorting
- Subtotal
- Service charge
- Tax
- Discount
- Grand total

`useCallback` is used to keep functions stable when they are passed to memoized components.

They should not be used unnecessarily because too much memoization can make code harder to understand.

---

## useEffect Dependency Array

If a filtering effect uses an empty dependency array:

```js
useEffect(() => {
  // filtering
}, []);
```

it will normally run only when the screen first loads.

If the category, search text, or menu items change later, the filtering will not update correctly.

That is why changing values must be included in the dependency array when required.

---

## Promo Codes

| Promo Code | Discount |
| --- | --- |
| `WELCOME10` | 10% |
| `FEAST20` | 20% |

---

## Order Summary

The app calculates:

```text
Subtotal
+ Service Charge (5%)
+ Sales Tax (15%)
- Promo Discount
= Grand Total
```

---

## Order Tracking

Order status changes as:

```text
Pending
↓
Preparing
↓
Ready
↓
Served
```

Demo timings:

- Preparing after 10 seconds
- Ready after 20 seconds
- Served after 30 seconds

---

## Table Reservation

Customers can:

- Select date
- Select party size
- Enter phone number
- Select available time
- Reserve a table
- Cancel reservation

Time slots are available from:

```text
12:00 to 22:00
```

Phone format:

```text
03XX-XXXXXXX
```

---

## AsyncStorage

AsyncStorage is used to save:

- Orders
- Reservations
- Menu edits

The app does not use a real database.

---

## Cart Reducer Test Cases

| # | Action | Expected Result |
| --- | --- | --- |
| 1 | `ADD_ITEM` | Item added to cart |
| 2 | Same `ADD_ITEM` again | Quantity increases |
| 3 | `REMOVE_ITEM` | Item removed |
| 4 | `INCREMENT` | Quantity +1 |
| 5 | `DECREMENT` | Quantity -1 |
| 6 | `UPDATE_NOTE` | Special note updated |
| 7 | `CLEAR_CART` | Cart becomes empty |
| 8 | `APPLY_PROMO` WELCOME10 | 10% discount |
| 9 | `APPLY_PROMO` FEAST20 | 20% discount |
| 10 | `REMOVE_PROMO` | Promo removed |





## Demo Video

[Watch Restaurant App MVP Demo Video](https://drive.google.com/file/d/1PTc2ZH0ywbBaXqZ7p5TU4G0FlmrPgYw0/view?usp=drive_link)

---

## GitHub Repository

https://github.com/MURAD-KHAN1/restaurant-app-mvp