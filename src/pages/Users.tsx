import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils';
import { CmdChip } from '../components/CmdChip';
import { IconUsers, IconClock, IconBan } from '../components/Icons';
import { useToast } from '../context/ToastContext';
import type { UsersResponse, UserInfo, WhoamiInfo } from '../api/client';

const ROLES = ['owner', 'editor', 'viewer'];

export default function Users() {
  const { client } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [me, setMe] = useState<WhoamiInfo | null>(null);
  const [soloMode, setSoloMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState<UserInfo | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    client.getWhoami().then((w) => !cancelled && setMe(w)).catch(() => {});
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

  async function changeRole(u: UserInfo, role: string) {
    if (!client || role === u.role) return;
    try {
      await client.changeUserRole(u.id, role);
      setData((prev) => prev && {
        ...prev,
        users: prev.users.map((x) => (x.id === u.id ? { ...x, role } : x)),
      });
      toast('Role updated', `${u.name} is now ${role}`);
    } catch (e) {
      toast('Could not change role', String(e), 'danger');
    }
  }

  async function confirmRemove() {
    if (!client || !removing) return;
    setBusy(true);
    try {
      await client.removeUser(removing.id);
      setData((prev) => prev && {
        ...prev,
        users: prev.users.map((x) => (x.id === removing.id ? { ...x, status: 'removed' } : x)),
      });
      toast('User removed', `${removing.name} lost access; their devices are revoked`, 'danger');
      setRemoving(null);
    } catch (e) {
      toast('Could not remove user', String(e), 'danger');
    } finally {
      setBusy(false);
    }
  }

  const isOwner = me?.role === 'owner';

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
        {isOwner && <CmdChip cmd="dmage user invite <name> --role editor" />}
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
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const removed = u.status === 'removed';
                const manage = isOwner && !removed && u.id !== me?.user_id;
                return (
                  <tr key={u.id} className={removed ? 'revoked' : ''}>
                    <td><span className="nm-strong">{u.name}</span></td>
                    <td>
                      {manage ? (
                        <select
                          className="rolesel"
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value)}
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span className="chip">{u.role}</span>
                      )}
                    </td>
                    <td>
                      <span className={'stat ' + (removed ? 'revoked' : 'active')}>
                        <i />{u.status}
                      </span>
                    </td>
                    <td className="muted">#{u.key_gen}</td>
                    <td className="faint">{formatDate(u.created_at)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {manage && (
                        <button className="btn danger" onClick={() => setRemoving(u)}>
                          <IconBan size={13} /> Remove
                        </button>
                      )}
                    </td>
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

      {removing && (
        <div className="scrim" onClick={() => setRemoving(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="mh"><IconBan size={17} /> Remove user</div>
            <div className="mb">
              <p>
                <b>{removing.name}</b> loses access immediately: their key wraps are
                dropped and all their devices are revoked. Secrets they already pulled
                to disk are not recalled — rotate the account key if that matters.
              </p>
              <div className="row">
                <button className="btn ghost" onClick={() => setRemoving(null)}>Cancel</button>
                <button className="btn danger" onClick={confirmRemove} disabled={busy}>
                  <IconBan size={13} /> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
