import { useEffect, useState } from 'react';
import { IconDownload } from './Icons';
import { CmdLine } from './CmdChip';
import { checkForUpdate, type UpdateInfo } from '../lib/updateCheck';

// Canonical upgrade path: re-run the (idempotent) installer. It rewrites the
// compose file and rides the `:2` image pin, so a minor/patch arrives on the
// next `docker compose pull`. See dotmage-spec — server upgrade path.
const INSTALL_CMD =
  'curl -fsSL https://raw.githubusercontent.com/dotMage/server/main/install.sh | bash';
const DISMISS_KEY = 'dotmage:update_dismissed';

export default function UpdateBanner({ current }: { current: string }) {
  const [info, setInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    if (!current) return;
    let alive = true;
    checkForUpdate(current)
      .then((u) => {
        if (!alive || !u) return;
        let dismissed: string | null = null;
        try {
          dismissed = localStorage.getItem(DISMISS_KEY);
        } catch {
          /* ignore */
        }
        if (dismissed === u.latest) return; // this exact release was dismissed
        setInfo(u);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [current]);

  if (!info) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, info.latest);
    } catch {
      /* ignore */
    }
    setInfo(null);
  };

  return (
    <div className={'update-banner' + (info.major ? ' major' : '')}>
      <span className="ic">
        <IconDownload size={17} />
      </span>
      <div className="msg">
        <div className="hd">
          {info.major ? (
            <>
              Major update <b>v{info.latest}</b> available — review the migration notes
              before upgrading (the pinned major won&rsquo;t update on its own).
            </>
          ) : (
            <>
              dotMage <b>v{info.latest}</b> is available (you run v{current}).
            </>
          )}{' '}
          <a href={info.htmlUrl} target="_blank" rel="noreferrer">
            release notes
          </a>
        </div>
        <CmdLine cmd={INSTALL_CMD} />
      </div>
      <button className="x" title="Dismiss" onClick={dismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
