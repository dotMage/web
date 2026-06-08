import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils';
import type { DeviceInfo } from '../api/client';

export default function Devices() {
  const { client } = useAuth();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!client) return;
    client
      .getDevices()
      .then(setDevices)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [client]);

  function handleRevoke(id: string, name: string) {
    if (!client) return;
    if (!confirm(`Revoke device "${name}"?`)) return;
    client
      .revokeDevice(id)
      .then(() => {
        setDevices((prev) =>
          prev.map((d) => (d.id === id ? { ...d, revoked: true } : d)),
        );
      })
      .catch((e) => setError(String(e)));
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: '#e53e3e' }}>{error}</p>;

  return (
    <div>
      <h2>Devices</h2>
      {devices.length === 0 ? (
        <p style={{ color: 'var(--text)' }}>No devices found.</p>
      ) : (
        <table className="dm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Last seen</th>
              <th>Expires</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr
                key={d.id}
                style={{
                  opacity: d.revoked ? 0.5 : 1,
                  textDecoration: d.revoked ? 'line-through' : 'none',
                }}
              >
                <td>
                  {d.name === 'unknown' ? (
                    <span style={{ fontStyle: 'italic', fontFamily: 'var(--mono)', fontSize: 13 }}>
                      {d.id.slice(0, 12)}...
                    </span>
                  ) : (
                    d.name
                  )}
                </td>
                <td>{formatDate(d.last_seen)}</td>
                <td>{formatDate(d.expires_at)}</td>
                <td>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 13,
                      fontWeight: 600,
                      background: d.revoked ? '#fed7d7' : '#c6f6d5',
                      color: d.revoked ? '#c53030' : '#276749',
                    }}
                  >
                    {d.revoked ? 'revoked' : 'active'}
                  </span>
                </td>
                <td>
                  {!d.revoked && (
                    <button
                      onClick={() => handleRevoke(d.id, d.name)}
                      style={{
                        padding: '4px 10px',
                        border: '1px solid #e53e3e',
                        borderRadius: 4,
                        background: 'transparent',
                        color: '#e53e3e',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
