import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { DotMageClient } from '../api/client';

const STORAGE_KEY = 'dotmage_token';

interface AuthState {
  token: string | null;
  client: DotMageClient | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  token: null,
  client: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });

  const client = token ? new DotMageClient(token) : null;

  const login = useCallback((t: string) => {
    localStorage.setItem(STORAGE_KEY, t);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
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
