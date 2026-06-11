import { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils';
import { CmdChip } from '../components/CmdChip';
import { IconSearch, IconApps as IconAppsIcon, IconChevR } from '../components/Icons';
import type { AppInfo } from '../api/client';

interface FolderGroup {
  folder: string | null;
  apps: AppInfo[];
}

function groupByFolder(apps: AppInfo[]): FolderGroup[] {
  const groups = new Map<string | null, AppInfo[]>();
  for (const app of apps) {
    const idx = app.name.lastIndexOf('/');
    const folder = idx >= 0 ? app.name.substring(0, idx) : null;
    if (!groups.has(folder)) groups.set(folder, []);
    groups.get(folder)!.push(app);
  }
  const sorted: FolderGroup[] = [];
  const folders = [...groups.keys()].filter((k): k is string => k !== null).sort();
  for (const f of folders) sorted.push({ folder: f, apps: groups.get(f)! });
  if (groups.has(null)) sorted.push({ folder: null, apps: groups.get(null)! });
  return sorted;
}

function shortName(fullName: string, folder: string | null): string {
  return folder ? fullName.substring(folder.length + 1) : fullName;
}

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
              {groupByFolder(rows).map((group) => (
                <Fragment key={group.folder ?? '__root'}>
                  {group.folder && (
                    <tr className="folder-row">
                      <td colSpan={5}>
                        <span className="folder-icon">/</span> {group.folder}
                      </td>
                    </tr>
                  )}
                  {group.apps.map((a) => (
                    <tr
                      key={a.id}
                      className="click"
                      onClick={() => navigate(`/apps/${encodeURIComponent(a.name)}`)}
                    >
                      <td style={group.folder ? { paddingLeft: 32 } : {}}>
                        <span className="nm-strong">{shortName(a.name, group.folder)}</span>
                      </td>
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
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
