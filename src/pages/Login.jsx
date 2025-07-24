import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils';

// Simple JWT decode function
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('auth/login/', { username, password });

      if (response.data.access && response.data.refresh) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        const decoded = parseJwt(response.data.access);
        if (decoded && decoded.user_id) {
          localStorage.setItem('userId', decoded.user_id);
        } else {
          console.warn('Could not extract userId from token');
        }

        navigate('/dashboard', { replace: true });
      } else {
        setError('Login failed: Invalid response');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed: Check your credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background-color: #1a001a;
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          color: '#f0f0f0',
        }}
      >
        <div
          style={{
            backgroundColor: '#121212',
            padding: '30px 40px',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(0, 150, 255, 0.7)',
            width: '100%',
            maxWidth: '450px',
          }}
        >
          <h2
            style={{
              textAlign: 'center',
              marginBottom: '25px',
              color: '#00bfff',
              textShadow: '0 0 8px #00bfff',
            }}
          >
            Login
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            <label>Username:</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: '2px solid #00bfff',
                backgroundColor: '#222',
                color: '#f0f0f0',
                outline: 'none',
                fontSize: '1rem',
                boxShadow: '0 0 10px #00bfff',
                transition: 'border-color 0.3s ease',
              }}
            />

            <label>Password:</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: '2px solid #00bfff',
                backgroundColor: '#222',
                color: '#f0f0f0',
                outline: 'none',
                fontSize: '1rem',
                boxShadow: '0 0 10px #00bfff',
                transition: 'border-color 0.3s ease',
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '10px',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#00bfff',
                color: '#121212',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 15px #00bfff',
                transition: 'background-color 0.3s ease',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate('/register', { replace: true })}
            style={{
              width: '100%',
              marginTop: '15px',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#222',
              color: '#00bfff',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 0 10px #00bfff',
              transition: 'background-color 0.3s ease',
            }}
          >
            Don't have an account? Sign Up
          </button>

          {error && (
            <p
              style={{
                marginTop: '15px',
                color: '#ff4c4c',
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: '0 0 5px #ff4c4c',
              }}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
