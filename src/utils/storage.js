import AsyncStorage from '@react-native-async-storage/async-storage';

const pendingWrites = new Map();

// Keep writes for each key in order so rapid updates cannot save stale state last.
export function saveStoredData(key, value) {
  const serialized = JSON.stringify(value);
  const pending = (pendingWrites.get(key) ?? Promise.resolve())
    .then(() => AsyncStorage.setItem(key, serialized))
    .catch((error) => console.warn('Could not save local data:', error));
  pendingWrites.set(key, pending);
  return pending;
}

// Validate saved collections before screens access their fields.
export function readStoredArray(saved, validate, fallback = []) {
  if (!saved) return fallback;
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error('Expected a saved list.');
    return parsed.filter(validate);
  } catch (error) {
    console.warn('Could not restore local data:', error);
    return fallback;
  }
}
