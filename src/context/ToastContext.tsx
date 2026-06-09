import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { IconCheck, IconBan } from '../components/Icons';

interface ToastItem {
  id: string;
  title: string;
  sub?: string;
  kind?: 'danger' | 'success';
}

interface ToastState {
  toast: (title: string, sub?: string, kind?: 'danger' | 'success') => void;
}

const ToastContext = createContext<ToastState>({
  toast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((title: string, sub?: string, kind?: 'danger' | 'success') => {
    const id = Math.random().toString(36).slice(2);
    setItems((t) => [...t, { id, title, sub, kind }]);
    setTimeout(() => setItems((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const dismiss = (id: string) => setItems((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toasts">
        {items.map((t) => (
          <div
            key={t.id}
            className={'toast' + (t.kind === 'danger' ? ' danger' : '')}
            onClick={() => dismiss(t.id)}
          >
            <span className="ti">
              {t.kind === 'danger' ? <IconBan size={15} /> : <IconCheck size={15} />}
            </span>
            <span>
              <div className="tt">{t.title}</div>
              {t.sub && <div className="td">{t.sub}</div>}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext);
}
