import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils';

const ResetPassword = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/reset-password/${uidb64}/${token}/`,
        { password }
      );
      setMessage(response.data.message || 'Password reset successful. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired reset link.');
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
            Reset Password
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label htmlFor="password" style={{ textAlign: 'left' }}>
              New Password:
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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

            <label htmlFor="confirmPassword" style={{ textAlign: 'left' }}>
              Confirm New Password:
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
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
              {loading ? 'Resetting...' : 'Reset Password'}
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
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
