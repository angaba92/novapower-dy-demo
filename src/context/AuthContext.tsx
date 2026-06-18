import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// Lightweight demo auth for the NovaPower private area ("zona privada").
// Credentials are pre-filled on the login screen so reviewers can jump straight
// in. State is persisted to localStorage so the session survives reloads.

export interface NovaUser {
  name: string;
  email: string;
  memberSince: string;
}

export const DEMO_CREDENTIALS = {
  email: 'maria@novapower.demo',
  password: 'demo1234',
};

const DEMO_USER: NovaUser = {
  name: 'María',
  email: DEMO_CREDENTIALS.email,
  memberSince: '2022',
};

interface AuthContextValue {
  user: NovaUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'novapower_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NovaUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as NovaUser;
    } catch {
      /* ignore */
    }
    return null;
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [user]);

  const login = useCallback((email: string, password: string) => {
    if (
      email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password
    ) {
      setUser(DEMO_USER);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid credentials. Use the pre-filled demo login.' };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
