import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockUsers } from '../data/users';

const AuthContext = createContext(undefined);
const publicUser = ({ password, ...user }) => user;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sessionUsers, setSessionUsers] = useState(mockUsers);

  const login = useCallback((email, password) => {
    const match = sessionUsers.find(
      (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password,
    );
    if (!match) return false;
    setUser(publicUser(match));
    return true;
  }, [sessionUsers]);

  const signup = useCallback((details) => {
    const email = details.email.trim().toLowerCase();
    if (sessionUsers.some((candidate) => candidate.email.toLowerCase() === email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    const nextUser = { ...details, id: `usr-${Date.now()}`, email };
    setSessionUsers((current) => [...current, nextUser]);
    setUser(publicUser(nextUser));
    return { success: true };
  }, [sessionUsers]);

  const logout = useCallback(() => setUser(null), []);
  const value = useMemo(() => ({ user, login, signup, logout }), [user, login, signup, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider.');
  return context;
}
