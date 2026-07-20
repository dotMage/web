import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { Mark, IconApps, IconDevices, IconUsers, IconAudit, IconLogout, IconCpu } from './Icons';
import CmdSidebar from './CmdSidebar';
import UpdateBanner from './UpdateBanner';
import type { WhoamiInfo } from '../api/client';

const NAV_ITEMS: Array<{ to: string; icon: typeof IconApps; label: string; matchPrefix?: string }> = [
  { to: '/', icon: IconApps, label: 'Apps', matchPrefix: '/apps' },
  { to: '/devices', icon: IconDevices, label: 'Devices' },
  { to: '/users', icon: IconUsers, label: 'Users' },
  { to: '/audit', icon: IconAudit, label: 'Audit' },
  { to: '/settings', icon: IconCpu, label: 'Settings' },
];

export default function Layout() {
  const { client, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [me, setMe] = useState<WhoamiInfo | null>(null);
  const [serverName, setServerName] = useState<string>('');
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    if (!client) return;
    let alive = true;
    client.getWhoami().then((w) => alive && setMe(w)).catch(() => {});
    client
      .getHealth()
      .then((h) => {
        if (!alive) return;
        setServerName(h.server_name || '');
        setVersion(h.version || '');
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [client]);

  // Reflect which vault this tab is for — helps when several are open.
  useEffect(() => {
    document.title = serverName ? `${serverName} · dotMage Admin` : 'dotMage Admin';
  }, [serverName]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="shell">
      <div className="top">
        <NavLink to="/" className="brand">
          <span className="mark"><Mark /></span>
          <span className="bn">dot<b>Mage</b></span>
          {serverName && <span className="team-tag">{serverName}</span>}
        </NavLink>
        <div className="nav">
          {NAV_ITEMS.map(({ to, icon: Ic, label, matchPrefix }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => {
                const active = isActive || (matchPrefix && location.pathname.startsWith(matchPrefix));
                return 'navi' + (active ? ' on' : '');
              }}
            >
              <Ic size={15} /> {t(label)}
            </NavLink>
          ))}
        </div>
        <div className="right">
          <div className="who">
            <span className="sq"><IconCpu size={15} /></span>
            <span>
              <div className="nm">{me?.name ?? '…'}</div>
              <div className="lbl">{me ? `${me.role} · ${me.device_name}` : 'this device'}</div>
            </span>
          </div>
          <button className="who lo" title={t('Logout')} onClick={handleLogout}>
            <IconLogout size={16} />
          </button>
        </div>
      </div>
      <UpdateBanner current={version} />
      <div className="strip">
        <span className="seg">
          <span className="k">{t('server')}</span>
          <span className="v">{serverName ? `${serverName} · ${window.location.host}` : (window.location.host || 'localhost')}</span>
        </span>
        <span className="seg">
          <span className="k">{t('auth')}</span>
          <span className="dotlive">
            <i />
            <span className="v">{t('authenticated')}</span>
          </span>
        </span>
        <span className="seg" style={{ marginLeft: 'auto' }}>
          <span className="k">{t('encryption')}</span>
          <span className="v">e2e / aes-256-gcm</span>
        </span>
      </div>
      <div className="body">
        <div className="main-content">
          <Outlet />
        </div>
        <CmdSidebar />
      </div>
    </div>
  );
}
