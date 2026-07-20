import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { formatDate } from '../utils';
import { CmdChip, CmdLine } from '../components/CmdChip';
import { IconArrowL, IconClock, IconRollback, IconLock } from '../components/Icons';
import type { EnvInfo, RevisionMeta } from '../api/client';

export default function AppDetail() {
  const { name } = useParams<{ name: string }>();
  const { client } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [envs, setEnvs] = useState<EnvInfo[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<RevisionMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [revLoading, setRevLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!client || !name) return;
    client
      .getEnvs(name)
      .then((data) => {
        setEnvs(data);
        if (data.length > 0) {
          const prod = data.find((e) => e.name === 'prod');
          setSelectedEnv(prod ? prod.name : data[data.length - 1].name);
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [client, name]);

  useEffect(() => {
    if (!client || !name || !selectedEnv) return;
    let cancelled = false;
    client
      .getRevisions(name, selectedEnv)
      .then((data) => {
        if (!cancelled) {
          setRevisions(data);
          setRevLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(String(e));
          setRevLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [client, name, selectedEnv]);

  function selectEnv(envName: string) {
    setSelectedEnv(envName);
    setRevLoading(true);
    setRevisions([]);
  }

  if (loading) {
    return <div className="loading-wrap"><span className="spin" /> {t('Loading...')}</div>;
  }
  if (error) {
    return <div className="err-banner">{error}</div>;
  }

  return (
    <div>
      <div className="ph">
        <button
          className="btn ghost"
          onClick={() => navigate('/')}
          style={{ padding: '6px 9px' }}
        >
          <IconArrowL size={15} /> {t('Apps')}
        </button>
        <h1>
          {name && name.includes('/') && (
            <span className="folder-crumb">{name.substring(0, name.lastIndexOf('/'))}/</span>
          )}
          {name && name.includes('/') ? name.substring(name.lastIndexOf('/') + 1) : name}
        </h1>
        {selectedEnv && (
          <CmdChip cmd={`dmage pull ${name} --env ${selectedEnv}`} />
        )}
      </div>
      <div className="dgrid">
        <div className="envcol">
          <div className="envcol-lbl">{t('Environments')}</div>
          {envs.map((env) => (
            <button
              key={env.id}
              className={'envi' + (env.name === selectedEnv ? ' on' : '')}
              onClick={() => selectEnv(env.name)}
            >
              <span>{env.name}</span>
              <span className="rv">{env.latest_rev} {t('REV')}</span>
            </button>
          ))}
        </div>
        <div>
          {revLoading ? (
            <div className="loading-wrap"><span className="spin" /> {t('Loading revisions...')}</div>
          ) : selectedEnv && revisions.length === 0 ? (
            <div className="empty">
              <div className="eic"><IconClock size={26} /></div>
              <h3>{t('No revisions in')} {selectedEnv}</h3>
              <p>
                {t('This environment has no pushes yet. From a checkout with the right .env, run:')}
              </p>
              <CmdLine cmd={`dmage push ${name} --env ${selectedEnv}`} />
            </div>
          ) : (
            <div className="tbl">
              <table>
                <thead>
                  <tr>
                    <th>{t('Rev')}</th>
                    <th>{t('Created')}</th>
                    <th>{t('Device')}</th>
                    <th>{t('Hash')}</th>
                    <th>{t('Note')}</th>
                  </tr>
                </thead>
                <tbody>
                  {revisions.map((r) => (
                    <tr key={r.rev_number}>
                      <td><span className="nm-strong">#{r.rev_number}</span></td>
                      <td>{formatDate(r.created_at)}</td>
                      <td>
                        <span className="chip">{r.device_id.slice(0, 12)}</span>
                      </td>
                      <td className="muted">
                        {r.content_hash ? r.content_hash.slice(0, 12) : '--'}
                      </td>
                      <td>
                        {r.rollback_of ? (
                          <span className="rollback">
                            <IconRollback size={12} /> {t('rollback of')} #{r.rollback_of}
                          </span>
                        ) : (
                          <span className="faint">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="secnote">
            <div className="ic"><IconLock size={22} /></div>
            <div className="tx">
              <div className="t">{t('Secret values never appear here')}</div>
              <div className="d">
                {t('Revisions are encrypted on your devices before upload. The server stores only ciphertext + metadata and')}{' '}
                <b>{t('cannot decrypt them')}</b>. {t('To read values, decrypt locally:')}{' '}
                {selectedEnv && (
                  <CmdLine cmd={`dmage pull ${name} --env ${selectedEnv}`} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
