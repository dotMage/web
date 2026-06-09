import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils';
import { CmdChip } from '../components/CmdChip';
import { IconBan, IconClock } from '../components/Icons';
import { useToast } from '../context/ToastContext';
import type { DeviceInfo } from '../api/client';

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
        <CmdChip cmd="dmage devices" />
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
