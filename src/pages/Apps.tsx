import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils';
import { CmdChip } from '../components/CmdChip';
import { IconSearch, IconApps as IconAppsIcon, IconChevR } from '../components/Icons';
import type { AppInfo } from '../api/client';

export default function Apps() {
  const { client } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!client) return;
    client
      .getApps()
      .then(setApps)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [client]);

  if (loading) {
    return <div className="loading-wrap"><span className="spin" /> Loading...</div>;
  }
  if (error) {
    return <div className="err-banner">{error}</div>;
  }

  const rows = apps.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <div className="ph">
        <h1>Applications</h1>
        <span className="ct">{apps.length}</span>
        {apps.length > 0 && (
          <div className="search" style={{ marginLeft: 24 }}>
            <IconSearch size={15} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="filter apps..."
            />
          </div>
        )}
        <CmdChip cmd="dmage apps" />
      </div>
      {apps.length === 0 ? (
        <div className="empty">
          <div className="eic"><IconAppsIcon size={26} /></div>
          <h3>No apps yet</h3>
          <p>
            Apps appear here the moment you push your first .env from any paired
            device. Start one from your project folder.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="empty">
          <div className="eic"><IconSearch size={26} /></div>
          <h3>No matches</h3>
          <p>Nothing matches &quot;{query}&quot;. Clear the filter to see all {apps.length} apps.</p>
        </div>
      ) : (
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>App</th>
                <th>Environments</th>
                <th>Latest</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr
                  key={a.id}
                  className="click"
                  onClick={() => navigate(`/apps/${encodeURIComponent(a.name)}`)}
                >
                  <td><span className="nm-strong">{a.name}</span></td>
                  <td>
                    <div className="chips">
                      {a.environments.map((e) => (
                        <span
                          key={e.id}
                          className={'chip' + (e.name === 'prod' ? ' prod' : '')}
                        >
                          {e.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="muted">
                    {a.environments.length > 0
                      ? '#' + Math.max(...a.environments.map((e) => e.latest_rev))
                      : '--'}
                  </td>
                  <td className="faint">{formatDate(a.updated_at)}</td>
                  <td style={{ textAlign: 'right' }}><IconChevR size={16} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
