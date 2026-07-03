import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mark, IconApps, IconDevices, IconUsers, IconAudit, IconLogout, IconCpu } from './Icons';
import CmdSidebar from './CmdSidebar';

const NAV_ITEMS: Array<{ to: string; icon: typeof IconApps; label: string; matchPrefix?: string }> = [
  { to: '/', icon: IconApps, label: 'Apps', matchPrefix: '/apps' },
  { to: '/devices', icon: IconDevices, label: 'Devices' },
  { to: '/users', icon: IconUsers, label: 'Users' },
  { to: '/audit', icon: IconAudit, label: 'Audit' },
];

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

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
              <Ic size={15} /> {label}
            </NavLink>
          ))}
        </div>
        <div className="right">
          <div className="who">
            <span className="sq"><IconCpu size={15} /></span>
            <span>
              <div className="nm">admin</div>
              <div className="lbl">this device</div>
            </span>
          </div>
          <button className="who lo" title="Logout" onClick={handleLogout}>
            <IconLogout size={16} />
          </button>
        </div>
      </div>
      <div className="strip">
        <span className="seg">
          <span className="k">server</span>
          <span className="v">{window.location.host || 'localhost'}</span>
        </span>
        <span className="seg">
          <span className="k">auth</span>
          <span className="dotlive">
            <i />
            <span className="v">authenticated</span>
          </span>
        </span>
        <span className="seg" style={{ marginLeft: 'auto' }}>
          <span className="k">encryption</span>
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
