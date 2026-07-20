import { useState } from 'react';
import { IconCopy, IconCheck } from './Icons';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n';

async function copy(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* clipboard API failed, try fallback */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function CmdChip({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();

  const run = async () => {
    const ok = await copy(cmd);
    if (ok) {
      setCopied(true);
      toast(t('Copied to clipboard'), '$ ' + cmd);
      setTimeout(() => setCopied(false), 1100);
    } else {
      toast(t('Failed to copy'), undefined, 'danger');
    }
  };

  return (
    <button className={'cmd' + (copied ? ' copied' : '')} onClick={run} title={t('Click to copy')}>
      <span className="pmt">$</span> <b>{cmd}</b>
      <span className="cpy">{copied ? <IconCheck size={13} /> : <IconCopy size={13} />}</span>
    </button>
  );
}

export function CmdLine({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();

  const run = async () => {
    const ok = await copy(cmd);
    if (ok) {
      setCopied(true);
      toast(t('Copied to clipboard'), '$ ' + cmd);
      setTimeout(() => setCopied(false), 1100);
    } else {
      toast(t('Failed to copy'), undefined, 'danger');
    }
  };

  return (
    <button className={'cmdline' + (copied ? ' copied' : '')} onClick={run} title={t('Click to copy')}>
      <span className="pmt">$</span> {cmd}{' '}
      <span className="cpy">{copied ? <IconCheck size={13} /> : <IconCopy size={13} />}</span>
    </button>
  );
}
