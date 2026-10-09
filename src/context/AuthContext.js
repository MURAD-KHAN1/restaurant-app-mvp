import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client';
import { clearSession, readSession, saveSession } from '../api/session';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const session = await readSession(AsyncStorage);
        if (active && session) { setUser(session.user); setToken(session.token); }
      } catch { /* Storage unavailable: show login rather than restoring partial data. */ }
      finally { if (active) setIsInitialized(true); }
    }
    restore();
    return () => { active = false; };
  }, []);
  const authenticate = useCallback(async (endpoint, body) => {
    const response = await apiRequest(endpoint, { method: 'POST', body });
    const session = await saveSession(AsyncStorage, response);
    setToken(session.token); setUser(session.user);
  }, []);
  const login = useCallback(async (email, password) => {
    await authenticate('/auth/login', { email: email.trim(), password });
    return true;
  }, [authenticate]);
  const signup = useCallback(async ({name, email, password}) => {
    await authenticate('/auth/register', { name: name.trim(), email: email.trim(), password });
    return { success: true };
  }, [authenticate]);
  const logout = useCallback(async () => {
    // Remove persisted data before completing logout so restart cannot restore it.
    await clearSession(AsyncStorage);
    setToken(null); setUser(null);
  }, []);
  const value = useMemo(() => ({user, token, isInitialized, login, signup, logout}),
    [user, token, isInitialized, login, signup, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider.');
  return context;
}
