import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils';
import { CmdChip, CmdLine } from '../components/CmdChip';
import { IconBan, IconClock, IconPlus, IconDownload } from '../components/Icons';
import { useToast } from '../context/ToastContext';
import type { DeviceInfo } from '../api/client';

interface TokenModal {
  title: string;
  note: string;
  cmd: string; //  shown in a copyable CmdLine
  link?: string; // optional clickable link (web login)
}

function daysUntil(dateStr: string): number {
  const cleaned = dateStr.replace(/\+00:00Z$/, 'Z').replace(/Z+$/, 'Z');
  const d = new Date(cleaned);
  const now = new Date();
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

export default function Devices() {
  const { client } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revoking, setRevoking] = useState<DeviceInfo | null>(null);
  const [tok, setTok] = useState<TokenModal | null>(null);
  const [busy, setBusy] = useState(false);
  const origin = window.location.origin;

  async function addDevice() {
    if (!client || busy) return;
    setBusy(true);
    try {
      const { token } = await client.createEnrollToken('new-device', '15m', 'enrollment');
      setTok({
        title: 'Add a device',
        note: 'One-time token, expires in 15 min. On the new machine, install dmage and run:',
        cmd: `dmage auth --server ${origin} --enroll ${token}`,
      });
    } catch (e) {
      toast('Could not create token', String(e), 'danger');
    } finally {
      setBusy(false);
    }
  }

  async function webLogin() {
    if (!client || busy) return;
    setBusy(true);
    try {
      const { token } = await client.createEnrollToken('web-admin', '5m', 'web-admin');
      const link = `${origin}/#token=${token}`;
      setTok({
        title: 'Web login link',
        note: 'One-time link, expires in 5 min. Open it in a browser to sign in:',
        cmd: link,
        link,
      });
    } catch (e) {
      toast('Could not create token', String(e), 'danger');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!client) return;
    client
      .getDevices()
      .then(setDevices)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [client]);

  function confirmRevoke() {
    if (!client || !revoking) return;
    client
      .revokeDevice(revoking.id)
      .then(() => {
        setDevices((prev) =>
          prev.map((d) => (d.id === revoking.id ? { ...d, revoked: true } : d)),
        );
        toast('Device revoked', revoking.name + ' can no longer sync', 'danger');
        setRevoking(null);
      })
      .catch((e) => setError(String(e)));
  }

  if (loading) {
    return <div className="loading-wrap"><span className="spin" /> Loading...</div>;
  }
  if (error) {
    return <div className="err-banner">{error}</div>;
  }

  const activeCount = devices.filter((d) => !d.revoked).length;

  return (
    <div>
      <div className="ph">
        <h1>Devices</h1>
        <span className="ct">{activeCount} active</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8 }}>
          <button className="btn ink" onClick={addDevice} disabled={busy}>
            <IconPlus size={13} /> Add a device
          </button>
          <button className="btn ghost" onClick={webLogin} disabled={busy}>
            <IconDownload size={13} /> Web login link
          </button>
        </span>
      </div>
      <div className="secnote" style={{ marginTop: 0, marginBottom: 18 }}>
        <span className="ic"><IconClock size={20} /></span>
        <div className="tx">
          <p className="sub" style={{ marginTop: 0 }}>
            Adding a machine mints a one-time token; you finish with your master password
            on that machine — the browser never holds your key. A scoped CI token needs the
            key too, so mint it from the CLI:
          </p>
          <CmdChip cmd="dmage gen-ci-token --app <app> --env <env>" />
        </div>
      </div>
      {devices.length === 0 ? (
        <div className="empty">
          <div className="eic"><IconBan size={26} /></div>
          <h3>No devices found</h3>
          <p>Pair a device by running dmage login on any machine.</p>
        </div>
      ) : (
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>Device</th>
                <th>Last seen</th>
                <th>Token expires</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => {
                const status = d.revoked ? 'revoked' : 'active';
                const days = !d.revoked ? daysUntil(d.expires_at) : null;
                const soon = days != null && days <= 30;
                return (
                  <tr key={d.id} className={status === 'revoked' ? 'revoked' : ''}>
                    <td>
                      <span className="nm-strong">
                        {d.name === 'unknown' ? d.id.slice(0, 12) : d.name}
                      </span>
                    </td>
                    <td>{formatDate(d.last_seen)}</td>
                    <td>
                      {d.revoked ? (
                        <span className="faint">--</span>
                      ) : soon ? (
                        <span className="warn">
                          <IconClock size={12} /> {formatDate(d.expires_at)} / {days}d
                        </span>
                      ) : (
                        <span className="muted">{formatDate(d.expires_at)}</span>
                      )}
                    </td>
                    <td>
                      <span className={'stat ' + status}>
                        <i />{status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!d.revoked && (
                        <button
                          className="btn danger"
                          onClick={() => setRevoking(d)}
                        >
                          <IconBan size={13} /> Revoke
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

      {tok && (
        <div className="scrim" onClick={() => setTok(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="mh"><IconPlus size={17} /> {tok.title}</div>
            <div className="mb">
              <p>{tok.note}</p>
              <CmdLine cmd={tok.cmd} />
              {tok.link && (
                <p className="sub">
                  or <a href={tok.link} target="_blank" rel="noreferrer">open the link</a> in a new tab
                </p>
              )}
              <div className="row">
                <button className="btn ghost" onClick={() => setTok(null)}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {revoking && (
        <div className="scrim" onClick={() => setRevoking(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="mh"><IconBan size={17} /> Revoke device</div>
            <div className="mb">
              <p>
                <b>{revoking.name}</b> loses access immediately. Its token is
                invalidated server-side; future push / pull is rejected until it
                re-authenticates with a new token.
              </p>
              <div className="row">
                <button className="btn ghost" onClick={() => setRevoking(null)}>
                  Cancel
                </button>
                <button className="btn danger" onClick={confirmRevoke}>
                  <IconBan size={13} /> Revoke
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
