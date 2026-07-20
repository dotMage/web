import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { formatDate } from '../utils';
import { CmdChip } from '../components/CmdChip';
import {
  IconChevD,
  IconSearch,
  IconAudit as IconAuditIcon,
  IconUpload,
  IconDownload,
  IconUserCheck,
  IconRollback,
  IconDevices,
  IconBan,
  IconPlus,
} from '../components/Icons';
import type { AuditEvent, AppInfo } from '../api/client';

const ACTION_KIND: Record<string, string> = {
  auth: 'auth',
  push: 'write',
  pull: 'read',
  rollback: 'write',
  'device.registered': 'device',
  'device.revoked': 'danger',
  'app.created': 'create',
  'env.created': 'create',
};

const AUDIT_ICON: Record<string, typeof IconUpload> = {
  auth: IconUserCheck,
  push: IconUpload,
  pull: IconDownload,
  rollback: IconRollback,
  'device.registered': IconDevices,
  'device.revoked': IconBan,
  'app.created': IconPlus,
  'env.created': IconPlus,
};

export default function Audit() {
  const { client } = useAuth();
  const { t } = useI18n();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!client) return;
    client.getApps().then(setApps).catch(() => {});
  }, [client]);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    const appName = filter === 'all' ? undefined : filter;
    client
      .getAudit(appName ? { app: appName } : undefined)
      .then((data) => { if (!cancelled) setEvents(data); })
      .catch((e) => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [client, filter]);

  if (error) {
    return <div className="err-banner">{error}</div>;
  }

  return (
    <div>
      <div className="ph">
        <h1>{t('Audit log')}</h1>
        <span className="ct">{events.length}</span>
        <div className="selwrap" style={{ marginLeft: 'auto', marginRight: 12 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">{t('ALL APPS')}</option>
            {apps.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
          <IconChevD size={15} />
        </div>
        <CmdChip
          cmd={filter === 'all' ? 'dmage audit' : `dmage audit --app ${filter}`}
        />
      </div>
      {loading ? (
        <div className="loading-wrap"><span className="spin" /> {t('Loading...')}</div>
      ) : events.length === 0 ? (
        <div className="empty">
          <div className="eic"><IconAuditIcon size={26} /></div>
          <h3>{t('No events yet')}</h3>
          <p>
            {t('Every auth, push, pull, rollback and device change is recorded here as soon as it happens.')}
          </p>
        </div>
      ) : (
        <div className="tbl">
          <table>
            <thead>
              <tr>
                <th>{t('Time')}</th>
                <th>{t('Action')}</th>
                <th>{t('User')}</th>
                <th>{t('App')}</th>
                <th>{t('Env')}</th>
                <th>{t('Rev')}</th>
                <th>{t('Device')}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const kindClass = ACTION_KIND[ev.action] || '';
                const Ic = AUDIT_ICON[ev.action] || IconSearch;
                return (
                  <tr key={ev.id}>
                    <td className="faint">{formatDate(ev.at)}</td>
                    <td>
                      <span className={'chip ' + kindClass}>
                        <Ic size={12} /> {ev.action}
                      </span>
                    </td>
                    <td>{ev.user || <span className="faint">—</span>}</td>
                    <td>{ev.app_name || <span className="faint">--</span>}</td>
                    <td className="muted">
                      {ev.env_name || <span className="faint">--</span>}
                    </td>
                    <td className="muted">
                      {ev.rev_number ? '#' + ev.rev_number : <span className="faint">--</span>}
                    </td>
                    <td>
                      <span className="chip">
                        {ev.device_id ? ev.device_id.slice(0, 12) : '--'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
