// Cross-platform feedback: native alerts on mobile and browser dialogs on web.
import { Alert, Platform } from 'react-native';

export default {
  alert(title, message = '', buttons = [{ text: 'OK' }]) {
    if (Platform.OS !== 'web') return Alert.alert(title, message, buttons);
    const text = [title, message].filter(Boolean).join('\n\n');
    const cancel = buttons.find((button) => button.style === 'cancel');
    const action = buttons.find((button) => button.style !== 'cancel');
    if (cancel) {
      if (globalThis.window.confirm(text)) action?.onPress?.();
      else cancel.onPress?.();
    } else {
      globalThis.window.alert(text);
      action?.onPress?.();
    }
  },
};
