import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Token is required');
      return;
    }
    login(trimmed);
    navigate('/');
  }

  return (
    <div style={{ maxWidth: 400, margin: '120px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>dotMage</h1>
      <p style={{ marginBottom: 24, color: 'var(--text)' }}>
        Enter your device token to access the admin panel.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Device token"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError('');
          }}
          style={{
            width: '100%',
            padding: 10,
            marginBottom: 8,
            border: '1px solid var(--border)',
            borderRadius: 6,
            background: 'var(--bg)',
            color: 'var(--text-h)',
            fontFamily: 'var(--mono)',
            fontSize: 14,
            boxSizing: 'border-box',
          }}
        />
        {error && (
          <p style={{ color: '#e53e3e', fontSize: 14, marginBottom: 8 }}>{error}</p>
        )}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: 10,
            border: 'none',
            borderRadius: 6,
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
