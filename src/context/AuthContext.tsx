import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import { DotMageClient } from '../api/client';

const DEVICE_KEY = 'dotmage_device_token';
const REFRESH_KEY = 'dotmage_refresh_token';

interface AuthState {
  token: string | null;
  client: DotMageClient | null;
  login: (enrollmentToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  token: null,
  client: null,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Migrate old storage key (one-time)
  useEffect(() => {
    const old = localStorage.getItem('dotmage_token');
    if (old) localStorage.removeItem('dotmage_token');
  }, []);

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(DEVICE_KEY),
  );

  const logout = useCallback(() => {
    localStorage.removeItem(DEVICE_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setToken(null);
  }, []);

  const client = useMemo(() => token
    ? new DotMageClient(
        token,
        '',
        (dt, rt) => {
          localStorage.setItem(DEVICE_KEY, dt);
          localStorage.setItem(REFRESH_KEY, rt);
          setToken(dt);
        },
        logout,
      )
    : null,
    [token, logout],
  );

  const login = useCallback(async (enrollmentToken: string) => {
    const resp = await fetch('/api/v1/auth/device', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${enrollmentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ device_name: 'web-admin' }),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Auth failed: HTTP ${resp.status}: ${text}`);
    }
    const data = await resp.json();
    localStorage.setItem(DEVICE_KEY, data.device_token);
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
    setToken(data.device_token);
  }, []);

  return (
    <AuthContext.Provider value={{ token, client, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
