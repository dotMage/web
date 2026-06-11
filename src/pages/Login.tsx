import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mark, IconBan, IconTerminal } from '../components/Icons';

export default function Login() {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setState('error');
      return;
    }
    setState('loading');
    try {
      const fullToken = trimmed.startsWith('dmage_etok_')
        ? trimmed
        : `dmage_etok_${trimmed}`;
      await login(fullToken);
      navigate('/');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="login">
      <div className="lbox">
        <div className="hd">
          <span className="mark"><Mark size={28} /></span>
          <span className="bn">dot<b>Mage</b></span>
          <span className="v">v0.1.0</span>
        </div>
        <div className="bd">
          <h2>Pair this device</h2>
          <div className="sub">
            dotMage has no password. You authorize this browser with a one-time login code from the CLI.
          </div>
          <label className="lbl-in">// login code</label>
          <div className={'tokfield' + (state === 'error' ? ' bad' : '')}>
            <span className="pre">dmage_etok_</span>
            <input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (state === 'error') setState('idle');
              }}
              placeholder="paste the rest..."
              spellCheck={false}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          {state === 'error' && (
            <div className="lerr">
              <IconBan size={15} /> Login code expired or invalid. Run <code>dmage token</code> again.
            </div>
          )}
          <div className="lhint">
            <IconTerminal size={16} style={{ flex: '0 0 auto' }} />
            <span>
              Run <code>dmage token</code> on any authenticated device. Copy the code it prints, paste it above.
              Server never sees your secrets -- only ciphertext.
            </span>
          </div>
          <button
            className="btn ink lbtn"
            onClick={handleSubmit}
            disabled={state === 'loading'}
          >
            {state === 'loading' ? (
              <>
                <span className="spin" /> Verifying...
              </>
            ) : (
              <>Verify device</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
