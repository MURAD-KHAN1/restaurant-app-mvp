// ==================================================
// FILE: index.js
// PURPOSE: Registers App as the Expo starting component
// VIVA: Find the app entry registration here
// ==================================================

// ===== IMPORTS =====
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
// ===== APP ENTRY REGISTRATION =====
registerRootComponent(App);
