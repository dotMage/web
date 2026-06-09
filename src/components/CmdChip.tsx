import { useState } from 'react';
import { IconCopy, IconCheck } from './Icons';
import { useToast } from '../context/ToastContext';

function copy(text: string) {
  try {
    navigator.clipboard?.writeText(text);
  } catch {
    /* ignore */
  }
}

export function CmdChip({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const run = () => {
    copy(cmd);
    setCopied(true);
    toast('Copied to clipboard', '$ ' + cmd);
    setTimeout(() => setCopied(false), 1100);
  };

  return (
    <button className={'cmd' + (copied ? ' copied' : '')} onClick={run} title="Click to copy">
      <span className="pmt">$</span> <b>{cmd}</b>
      <span className="cpy">{copied ? <IconCheck size={13} /> : <IconCopy size={13} />}</span>
    </button>
  );
}

export function CmdLine({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const run = () => {
    copy(cmd);
    setCopied(true);
    toast('Copied to clipboard', '$ ' + cmd);
    setTimeout(() => setCopied(false), 1100);
  };

  return (
    <button className={'cmdline' + (copied ? ' copied' : '')} onClick={run} title="Click to copy">
      <span className="pmt">$</span> {cmd}{' '}
      <span className="cpy">{copied ? <IconCheck size={13} /> : <IconCopy size={13} />}</span>
    </button>
  );
}
