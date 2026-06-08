import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils';
import type { AppInfo } from '../api/client';

export default function Apps() {
  const { client } = useAuth();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!client) return;
    client
      .getApps()
      .then(setApps)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [client]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: '#e53e3e' }}>{error}</p>;

  if (apps.length === 0) {
    return (
      <div>
        <h2>Apps</h2>
        <p style={{ color: 'var(--text)' }}>No apps found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Apps</h2>
      <table className="dm-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Environments</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {apps.map((app) => (
            <tr key={app.id}>
              <td>
                <Link to={`/apps/${encodeURIComponent(app.name)}`}>{app.name}</Link>
              </td>
              <td>{app.environments.length}</td>
              <td>{formatDate(app.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
