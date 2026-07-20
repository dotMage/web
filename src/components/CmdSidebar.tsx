import { useLocation } from 'react-router-dom';
import { CmdChip } from './CmdChip';
import { useI18n } from '../i18n';

interface CmdGroup {
  label: string;
  cmds: string[];
}

const ROUTE_CMDS: Record<string, CmdGroup[]> = {
  '/': [
    { label: 'Manage', cmds: ['dmage apps', 'dmage init <name>', 'dmage status'] },
    { label: 'Sync', cmds: ['dmage push <name>', 'dmage pull <name>'] },
  ],
  '/devices': [
    { label: 'Devices', cmds: ['dmage devices', 'dmage gen-token', 'dmage lock'] },
    { label: 'Admin', cmds: ['dmage token'] },
  ],
  '/audit': [
    { label: 'Audit', cmds: ['dmage audit', 'dmage history <name>'] },
  ],
};

const APP_DETAIL_CMDS: CmdGroup[] = [
  { label: 'Sync', cmds: ['dmage push {name}', 'dmage pull {name}', 'dmage diff {name}'] },
  { label: 'Environments', cmds: ['dmage env list {name}', 'dmage env new {name} <env>'] },
  { label: 'Execute', cmds: ['dmage exec {name} -- <cmd>'] },
];

export default function CmdSidebar() {
  const { pathname } = useLocation();
  const { t } = useI18n();

  let groups: CmdGroup[];
  let appName: string | null = null;

  if (pathname.startsWith('/apps/')) {
    appName = decodeURIComponent(pathname.slice(6));
    groups = APP_DETAIL_CMDS.map(g => ({
      label: g.label,
      cmds: g.cmds.map(c => c.replace(/\{name\}/g, appName!)),
    }));
  } else {
    groups = ROUTE_CMDS[pathname] || ROUTE_CMDS['/'];
  }

  return (
    <aside className="cmdsb">
      <div className="cmdsb-title">{t('Quick commands')}</div>
      {groups.map(g => (
        <div key={g.label} className="cmdsb-group">
          <div className="cmdsb-label">{t(g.label)}</div>
          {g.cmds.map(cmd => (
            <CmdChip key={cmd} cmd={cmd} />
          ))}
        </div>
      ))}
    </aside>
  );
}
