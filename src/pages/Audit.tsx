import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils';
import type { AuditEvent } from '../api/client';

export default function Audit() {
  const { client } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appFilter, setAppFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | undefined>(undefined);

  const fetchAudit = useCallback((appName: string | undefined, c: typeof client) => {
    if (!c) return;
    c.getAudit(appName ? { app: appName } : undefined)
      .then(setEvents)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!client) return;
    fetchAudit(activeFilter, client);
  }, [client, activeFilter, fetchAudit]);

  function handleFilter(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setActiveFilter(appFilter.trim() || undefined);
  }

  if (error) return <p style={{ color: '#e53e3e' }}>{error}</p>;

  return (
    <div>
      <h2>Audit log</h2>
      <form onSubmit={handleFilter} style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Filter by app name"
          value={appFilter}
          onChange={(e) => setAppFilter(e.target.value)}
          style={{
            padding: '6px 10px',
            border: '1px solid var(--border)',
            borderRadius: 6,
            background: 'var(--bg)',
            color: 'var(--text-h)',
            fontSize: 14,
            flex: 1,
            maxWidth: 260,
          }}
        />
        <button
          type="submit"
          style={{
            padding: '6px 14px',
            border: '1px solid var(--border)',
            borderRadius: 6,
            background: 'transparent',
            color: 'var(--text-h)',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Filter
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : events.length === 0 ? (
        <p style={{ color: 'var(--text)' }}>No audit events.</p>
      ) : (
        <table className="dm-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>App</th>
              <th>Env</th>
              <th>Rev</th>
              <th>Device</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {formatDate(ev.at)}
                </td>
                <td>
                  <code style={{ fontSize: 13 }}>{ev.action}</code>
                </td>
                <td>{ev.app_name ?? '---'}</td>
                <td>{ev.env_name ?? '---'}</td>
                <td>{ev.rev_number ?? '---'}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
                  {ev.device_id ? ev.device_id.slice(0, 12) + '...' : '---'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
