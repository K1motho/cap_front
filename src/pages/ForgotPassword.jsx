import React, { useState } from 'react';
import axios from '../utils';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/forgot-password/`, { email });
      setMessage(response.data.message || 'If an account with that email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
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
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              color: '#00bfff',
              textShadow: '0 0 8px #00bfff',
              marginBottom: '25px',
            }}
          >
            Forgot Password
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label htmlFor="email" style={{ textAlign: 'left' }}>
              Enter your email address:
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {message && (
            <p
              style={{
                marginTop: '20px',
                color: '#4CAF50',
                fontWeight: 'bold',
                textShadow: '0 0 5px #4CAF50',
              }}
            >
              {message}
            </p>
          )}

          {error && (
            <p
              style={{
                marginTop: '20px',
                color: '#ff4c4c',
                fontWeight: 'bold',
                textShadow: '0 0 5px #ff4c4c',
              }}
            >
              {error}
            </p>
          )}

          <button
            onClick={() => navigate('/login')}
            style={{
              marginTop: '30px',
              background: 'none',
              border: 'none',
              color: '#00bfff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
