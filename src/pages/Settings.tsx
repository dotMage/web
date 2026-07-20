import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n, type Lang } from '../i18n';
import { getScale, setScale, SCALES, type Scale } from '../lib/uiScale';
import { CmdLine } from '../components/CmdChip';
import { IconCpu, IconDownload, IconCheck } from '../components/Icons';
import {
  checkForUpdate,
  getChannel,
  setChannel,
  type Channel,
  type UpdateInfo,
} from '../lib/updateCheck';
import type { HealthInfo, WhoamiInfo } from '../api/client';

const INSTALL_CMD =
  'curl -fsSL https://raw.githubusercontent.com/dotMage/server/main/install.sh | bash';

const LANGS: Array<{ id: Lang; label: string }> = [
  { id: 'en', label: 'English' },
  { id: 'ru', label: 'Русский' },
];

export default function Settings() {
  const { client } = useAuth();
  const { t, lang, setLang } = useI18n();
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [me, setMe] = useState<WhoamiInfo | null>(null);
  const [channel, setChan] = useState<Channel>(getChannel());
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(true);
  const [scale, setScaleState] = useState<Scale>(getScale());

  useEffect(() => {
    if (!client) return;
    let alive = true;
    client.getHealth().then((h) => alive && setHealth(h)).catch(() => {});
    client.getWhoami().then((w) => alive && setMe(w)).catch(() => {});
    return () => { alive = false; };
  }, [client]);

  // Re-run the update check whenever the version is known or the channel flips.
  useEffect(() => {
    if (!health?.version) return;
    let alive = true;
    checkForUpdate(health.version)
      .then((u) => alive && setUpdate(u))
      .finally(() => alive && setChecking(false));
    return () => { alive = false; };
  }, [health?.version, channel]);

  function toggleChannel() {
    const next: Channel = channel === 'dev' ? 'stable' : 'dev';
    setChannel(next);
    setChan(next);
    setChecking(true);
  }

  function pickScale(s: Scale) {
    setScale(s);
    setScaleState(s);
  }

  const mode = health?.features.includes('team') ? 'team' : 'solo';

  return (
    <div>
      <div className="ph">
        <h1>{t('Settings')}</h1>
      </div>

      <div className="secnote">
        <span className="ic"><IconCpu size={22} /></span>
        <div className="tx">
          <div className="settings-rows">
            <div><span className="k">{t('server')}</span><span className="v">{health?.server_name || window.location.host}</span></div>
            <div><span className="k">{t('version')}</span><span className="v">{health?.version ?? '…'}</span></div>
            <div><span className="k">{t('mode')}</span><span className="v">{mode}</span></div>
            <div>
              <span className="k">{t('features')}</span>
              <span className="v">{(health?.features ?? []).map((f) => <span key={f} className="chip">{f}</span>)}</span>
            </div>
            <div><span className="k">{t('you')}</span><span className="v">{me ? `${me.name} · ${me.role} · ${me.device_name}` : '…'}</span></div>
          </div>
        </div>
      </div>

      <div className="ph" style={{ marginTop: 28 }}>
        <h2>{t('Interface')}</h2>
      </div>
      <div className="secnote">
        <span className="ic"><IconCpu size={22} /></span>
        <div className="tx">
          <div className="settings-rows">
            <div>
              <span className="k">{t('language')}</span>
              <span className="v seg-choice">
                {LANGS.map((l) => (
                  <button
                    key={l.id}
                    className={'btn ghost sm' + (lang === l.id ? ' on' : '')}
                    onClick={() => setLang(l.id)}
                  >
                    {l.label}
                  </button>
                ))}
              </span>
            </div>
            <div>
              <span className="k">{t('interface scale')}</span>
              <span className="v seg-choice">
                {SCALES.map((s) => (
                  <button
                    key={s}
                    className={'btn ghost sm' + (scale === s ? ' on' : '')}
                    onClick={() => pickScale(s)}
                  >
                    {Math.round(s * 100)}%
                  </button>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="ph" style={{ marginTop: 28 }}>
        <h2>{t('Updates')}</h2>
      </div>
      <div className="secnote">
        <span className="ic"><IconDownload size={22} /></span>
        <div className="tx">
          <div className="settings-rows">
            <div>
              <span className="k">{t('status')}</span>
              <span className="v">
                {checking
                  ? <><span className="spin" /> {t('checking…')}</>
                  : update
                    ? <>{t('update available:')} <b>v{update.latest}</b>{update.major ? ` ${t('(major — migration needed)')}` : ''}</>
                    : <><IconCheck size={14} /> {t('up to date')}{health?.version ? ` (v${health.version})` : ''}</>}
              </span>
            </div>
            <div>
              <span className="k">{t('channel')}</span>
              <span className="v">
                <label className="switch">
                  <input type="checkbox" checked={channel === 'dev'} onChange={toggleChannel} />
                  {t('follow dev channel (prereleases)')}
                </label>
              </span>
            </div>
          </div>
          <p className="sub">
            {t('Upgrade the server by re-running the installer (idempotent; the pinned major rides patches and minors):')}
          </p>
          <CmdLine cmd={INSTALL_CMD} />
          {update && (
            <p className="sub">
              {t('Release notes:')} <a href={update.htmlUrl} target="_blank" rel="noreferrer">{update.htmlUrl}</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
