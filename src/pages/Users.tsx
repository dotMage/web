import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils';
import { CmdChip } from '../components/CmdChip';
import { IconUsers, IconClock } from '../components/Icons';
import type { UsersResponse } from '../api/client';

export default function Users() {
  const { client } = useAuth();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [soloMode, setSoloMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    client
      .getUsers()
      .then((res) => {
        if (cancelled) return;
        if (res === null) setSoloMode(true);
        else setData(res);
      })
      .catch((e) => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [client]);

  if (loading) {
    return <div className="loading-wrap"><span className="spin" /> Loading...</div>;
  }
  if (error) {
    return <div className="err-banner">{error}</div>;
  }

  if (soloMode) {
    return (
      <div>
        <div className="ph">
          <h1>Users</h1>
        </div>
        <div className="empty">
          <div className="eic"><IconUsers size={26} /></div>
          <h3>Team mode is off on this server</h3>
          <p>
            This server runs with DOTMAGE_MODE=solo, so there is a single
            implicit owner and no user list. Enable team mode on the server to
            invite teammates.
          </p>
        </div>
      </div>
    );
  }

  const users = data?.users ?? [];
  const invitations = (data?.invitations ?? []).filter(
    (i) => i.status === 'pending',
  );
  const activeCount = users.filter((u) => u.status !== 'removed').length;

  return (
    <div>
      <div className="ph">
        <h1>Users</h1>
        <span className="ct">{activeCount} active</span>
        <CmdChip cmd="dmage user list" />
      </div>
      {users.length === 0 ? (
        <div className="empty">
          <div className="eic"><IconUsers size={26} /></div>
          <h3>No users yet</h3>
          <p>Invite a teammate with dmage user invite from an owner device.</p>
        </div>
      ) : (
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Key gen</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const removed = u.status === 'removed';
                return (
                  <tr key={u.id} className={removed ? 'revoked' : ''}>
                    <td><span className="nm-strong">{u.name}</span></td>
                    <td>
                      <span className="chip">{u.role}</span>
                    </td>
                    <td>
                      <span className={'stat ' + (removed ? 'revoked' : 'active')}>
                        <i />{u.status}
                      </span>
                    </td>
                    <td className="muted">#{u.key_gen}</td>
                    <td className="faint">{formatDate(u.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {invitations.length > 0 && (
        <>
          <div className="ph" style={{ marginTop: 28 }}>
            <h1>Pending invitations</h1>
            <span className="ct">{invitations.length}</span>
          </div>
          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr key={inv.id}>
                    <td><span className="nm-strong">{inv.name}</span></td>
                    <td>
                      <span className="chip">{inv.role}</span>
                    </td>
                    <td>
                      <span className="chip auth">{inv.status}</span>
                    </td>
                    <td className="muted">
                      <IconClock size={12} /> {formatDate(inv.expires_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
