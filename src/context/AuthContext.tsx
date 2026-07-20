import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from 'react';
import { DotMageClient } from '../api/client';

const DEVICE_KEY = 'dotmage_device_token';
const REFRESH_KEY = 'dotmage_refresh_token';
// One-shot notice shown on the login page after a failed auto-login (read by Login.tsx).
const NOTICE_KEY = 'dotmage_login_notice';

function hashToken(): string | null {
  return new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token');
}

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

  // Auto-login from `#token=…` (dmage open). The token rides in the fragment,
  // not the query, so it never reaches the server; we strip it from the URL
  // immediately regardless of outcome. Ref-guarded to survive StrictMode's
  // double-invoke (the enrollment token is single-use).
  const [signingIn, setSigningIn] = useState(() => hashToken() !== null);
  const didBootstrap = useRef(false);
  useEffect(() => {
    if (didBootstrap.current) return;
    const enroll = hashToken();
    if (!enroll) return;
    didBootstrap.current = true;
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    login(enroll)
      .catch(() => {
        sessionStorage.setItem(
          NOTICE_KEY,
          'That login link expired or was already used. Run `dmage open` again.',
        );
      })
      .finally(() => setSigningIn(false));
  }, [login]);

  return (
    <AuthContext.Provider value={{ token, client, login, logout }}>
      {signingIn ? (
        <div className="login">
          <div className="lbox">
            <div className="bd" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="spin" /> Signing you in…
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
