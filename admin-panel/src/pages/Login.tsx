import { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { username, password });
      login(res.data.token);
    } catch(err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#dc5b00' }}>
      <header style={{ marginBottom: '24px', textAlign: 'center' }}>
   <div> <img
        src="/aadhyalogo.png"
        alt="Hotel Aadhya"
        style={{
          height: '48px',
          objectFit: 'contain',
          marginRight: '16px',
          color: '#fff',
        }}
      />
      </div>
        <span style={{
          fontFamily: "'Great Vibes', cursive",
          fontSize: '32px',
          color: '#ffffff',       /* the red from the logo */
          letterSpacing: '1px',
        }}>
          Hotel Aadhya
        </span>
      <div style={{
        fontFamily: 'sans-serif',
        fontSize: '10px',
        color: '#ffffff',
        letterSpacing: '2px',
        textTransform: 'uppercase',
      }}>
        Take a seat have a treat
      </div>
      </header>
      <div style={{ background: '#ffff', padding: '32px', borderRadius: '10px', width: '320px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', padding: '10px', marginBottom: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
        />
        {error && <p style={{ color: '#c62828', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', background: '#dc5b00', color: '#fff', padding: '10px', borderRadius: '6px', fontWeight: 600 }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}