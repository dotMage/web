import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { EnvInfo, RevisionMeta } from '../api/client';

export default function AppDetail() {
  const { name } = useParams<{ name: string }>();
  const { client } = useAuth();
  const [envs, setEnvs] = useState<EnvInfo[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<RevisionMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [revLoading, setRevLoading] = useState(false);
  const [error, setError] = useState('');
  const [revKey, setRevKey] = useState(0);

  useEffect(() => {
    if (!client || !name) return;
    client
      .getEnvs(name)
      .then((data) => {
        setEnvs(data);
        if (data.length > 0) {
          setSelectedEnv(data[0].name);
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [client, name]);

  useEffect(() => {
    if (!client || !name || !selectedEnv) return;
    let cancelled = false;
    client
      .getRevisions(name, selectedEnv)
      .then((data) => { if (!cancelled) { setRevisions(data); setRevLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(String(e)); setRevLoading(false); } });
    return () => { cancelled = true; };
  }, [client, name, selectedEnv, revKey]);

  function selectEnv(envName: string) {
    setSelectedEnv(envName);
    setRevLoading(true);
    setRevisions([]);
    setRevKey((k) => k + 1);
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: '#e53e3e' }}>{error}</p>;

  return (
    <div>
      <p style={{ marginBottom: 8 }}>
        <Link to="/" style={{ color: 'var(--accent)' }}>Apps</Link>
        {' / '}
        <strong style={{ color: 'var(--text-h)' }}>{name}</strong>
      </p>

      <h2>Environments</h2>

      {envs.length === 0 ? (
        <p style={{ color: 'var(--text)' }}>No environments.</p>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {envs.map((env) => (
            <button
              key={env.id}
              onClick={() => selectEnv(env.name)}
              style={{
                padding: '6px 14px',
                border: '1px solid var(--border)',
                borderRadius: 6,
                background: selectedEnv === env.name ? 'var(--accent)' : 'transparent',
                color: selectedEnv === env.name ? '#fff' : 'var(--text-h)',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              {env.name}
              <span style={{
                marginLeft: 6,
                fontSize: 12,
                opacity: 0.7,
              }}>
                rev {env.latest_rev}
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedEnv && (
        <>
          <h2>Revision history — {selectedEnv}</h2>
          {revLoading ? (
            <p>Loading revisions...</p>
          ) : revisions.length === 0 ? (
            <p style={{ color: 'var(--text)' }}>No revisions.</p>
          ) : (
            <table className="dm-table">
              <thead>
                <tr>
                  <th>Rev</th>
                  <th>Timestamp</th>
                  <th>Device</th>
                  <th>Hash</th>
                  <th>Rollback of</th>
                </tr>
              </thead>
              <tbody>
                {revisions.map((r) => (
                  <tr key={r.rev_number}>
                    <td><strong>{r.rev_number}</strong></td>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
                      {r.device_id.slice(0, 12)}...
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
                      {r.content_hash ? r.content_hash.slice(0, 12) + '...' : '—'}
                    </td>
                    <td>{r.rollback_of ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
