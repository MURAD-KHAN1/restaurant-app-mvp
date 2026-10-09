export const AUTH_KEYS = ['@restaurant/auth_token', '@restaurant/auth_user'];
export function normalizeSession(response) {
  const user = response?.user;
  if (typeof response?.token !== 'string' || !response.token || !user
    || typeof (user._id || user.id) !== 'string' || typeof user.name !== 'string'
    || typeof user.email !== 'string' || !['customer', 'manager'].includes(user.role)) {
    throw new Error('The server returned an invalid session. Please sign in again.');
  }
  return { token: response.token, user: { id: user._id || user.id,
    name: user.name, email: user.email, role: user.role } };
}
export async function saveSession(storage, response) {
  const session = normalizeSession(response);
  try {
    await storage.multiSet([[AUTH_KEYS[0], session.token], [AUTH_KEYS[1], JSON.stringify(session.user)]]);
  } catch {
    await storage.multiRemove(AUTH_KEYS).catch(() => {});
    throw new Error('Could not save your session. Please try again.');
  }
  return session;
}
export async function readSession(storage) {
  const entries = await storage.multiGet(AUTH_KEYS);
  const token = entries[0][1];
  const savedUser = entries[1][1];
  if (!token || !savedUser) {
    await storage.multiRemove(AUTH_KEYS);
    return null;
  }
  try { return normalizeSession({ token, user: JSON.parse(savedUser) }); }
  catch { await storage.multiRemove(AUTH_KEYS); return null; }
}
export async function clearSession(storage) { await storage.multiRemove(AUTH_KEYS); }
