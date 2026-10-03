import { useState, useEffect } from 'react';
import { setApiKey } from '../lib/tmdb';

interface Props {
  onSet: () => void;
}

export default function ApiSetup({ onSet }: Props) {
  const [key, setKey] = useState('7b554d8a68292aa314b114288a166cb0');
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);

  // تخطي الشاشة تلقائياً بمجرد فتح أي مستخدم للموقع
  useEffect(() => {
    const initializeApi = async () => {
      setTesting(true);
      try {
        const fixedKey = '7b554d8a68292aa314b114288a166cb0';
        const res = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${fixedKey}`);
        if (!res.ok) throw new Error('Invalid API key');
        
        localStorage.setItem('tmdb_api_key', fixedKey);
        setApiKey(fixedKey);
        onSet(); // الدخول الفوري للموقع
      } catch {
        setError('Failed to connect to the movie database automatically.');
      } finally {
        setTesting(false);
      }
    };

    initializeApi();
  }, [onSet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) { setError('Please enter your API key'); return; }
    setTesting(true);
    setError('');
    try {
      const res = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${key.trim()}`);
      if (!res.ok) throw new Error('Invalid API key');
      localStorage.setItem('tmdb_api_key', key.trim());
      setApiKey(key.trim());
      onSet();
    } catch {
      setError('Invalid API key. Please check and try again.');
    } finally {
      setTesting(false);
    }
  };

  // يظهر هذا المؤشر البسيط للحظات أثناء عملية التحقق التلقائي والدخول
  if (testing && !error) {
    return (
      <div style={{
        minHeight: '100vh', background: '#070a11',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#f0b430', fontFamily: 'sans-serif', fontSize: 18, fontWeight: 600
      }}>
        🎬 Connecting to CineVault...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#070a11',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        maxWidth: 480, width: '100%',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: 40,
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: '#f0eff4', marginBottom: 8 }}>
            <span style={{ color: '#f0b430' }}>Cine</span>Vault
          </h1>
          <p style={{ fontSize: 15, color: '#7a8499', lineHeight: 1.6 }}>
            Your cinematic universe awaits. Enter your TMDB API key to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#adb8cc', display: 'block', marginBottom: 8 }}>
            TMDB API Key
          </label>
          <input
            type="text"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="Enter your API key…"
            className="cinput"
            style={{ marginBottom: 8, fontSize: 14 }}
          />
          {error && <p style={{ fontSize: 13, color: '#e54b4b', marginBottom: 12 }}>{error}</p>}
          <button
            type="submit"
            disabled={testing}
            style={{
              width: '100%', padding: '13px', borderRadius: 10,
              background: testing ? 'rgba(240,180,48,0.4)' : '#f0b430',
              color: '#070a11', fontWeight: 700, fontSize: 15,
              border: 'none', cursor: testing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', marginTop: 4,
            }}
          >
            {testing ? 'Verifying…' : 'Connect to TMDB'}
          </button>
        </form>

        <div style={{ marginTop: 28, padding: '16px', background: 'rgba(240,180,48,0.06)', border: '1px solid rgba(240,180,48,0.15)', borderRadius: 10, textAlign: 'left' }}>
          <p style={{ fontSize: 12, color: '#adb8cc', lineHeight: 1.7, margin: 0 }}>
            Get a free API key at{' '}
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" style={{ color: '#f0b430' }}>
              themoviedb.org/settings/api
            </a>
            . Sign up for a free account, then request an API key under Settings → API.
          </p>
        </div>
      </div>
    </div>
  );
}
