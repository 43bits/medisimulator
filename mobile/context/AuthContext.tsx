import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, getMe, type MeResponse } from '@/services/authService';
import { setTokenGetter } from '@/services/api';

const TOKEN_KEY = 'hms_access_token';

interface AuthContextValue {
  user: MeResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<MeResponse | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Wire the module-level token getter so apiFetch always has the current token
  useEffect(() => {
    setTokenGetter(() => token);
  }, [token]);

  const refreshMe = useCallback(async () => {
    const stored = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!stored) { setIsLoading(false); return; }
    setToken(stored);
    setTokenGetter(() => stored);
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refreshMe(); }, [refreshMe]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginUser(username, password);
    await SecureStore.setItemAsync(TOKEN_KEY, result.accessToken);
    setToken(result.accessToken);
    setTokenGetter(() => result.accessToken);
    // Fetch full me after login to get facility/branch scope
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      // Fallback to login response user shape
      setUser({
        userId: result.user.id,
        username: result.user.username,
        fullName: result.user.fullName,
        roleCode: result.user.roleCode ?? result.user.role?.code,
        role: result.user.role,
      });
    }
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token && !!user,
      login,
      logout,
      refreshMe,
    }),
    [user, token, isLoading, login, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
