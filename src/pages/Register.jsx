import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');

  // JWT decoder
  const parseJwt = (token) => {
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
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
    if (e.target.name === 'username') setUsernameError('');
    if (e.target.name === 'email') setEmailError('');
  };

  // Check username availability onBlur
  const checkUsername = async () => {
    if (!formData.username) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/check-username/`, {
        params: { username: formData.username },
      });
      if (!res.data.available) {
        setUsernameError('Username is already taken');
      } else {
        setUsernameError('');
      }
    } catch {
      setUsernameError('Could not verify username availability');
    }
  };

  // Check email availability onBlur
  const checkEmail = async () => {
    if (!formData.email) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/check-email/`, {
        params: { email: formData.email },
      });
      if (!res.data.available) {
        setEmailError('Email is already registered');
      } else {
        setEmailError('');
      }
    } catch {
      setEmailError('Could not verify email availability');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (usernameError || emailError) {
      setError('Please fix the errors before registering');
      return;
    }

    try {
      const { username, email, password } = formData;
      const res = await axios.post(`${BACKEND_URL}/api/register/`, {
        username,
        email,
        password,
      });

      const { access, refresh } = res.data;

      if (access && refresh) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        const decoded = parseJwt(access);
        if (decoded && decoded.user_id) {
          localStorage.setItem('userId', decoded.user_id);
        }

        setSuccess('Registration successful! Redirecting...');
        navigate('/dashboard');
      } else {
        setSuccess('Registration successful! Please login.');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          'Registration failed.'
      );
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
            color: '#f0f0f0',
          }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#00bfff', textShadow: '0 0 8px #00bfff' }}>
            Register
          </h2>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label>Username:</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={checkUsername}
              required
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: usernameError ? '2px solid #ff4c4c' : '2px solid #00bfff',
                backgroundColor: '#222',
                color: '#f0f0f0',
                outline: 'none',
                fontSize: '1rem',
                boxShadow: usernameError ? '0 0 10px #ff4c4c' : '0 0 10px #00bfff',
                transition: 'border-color 0.3s ease',
              }}
            />
            {usernameError && <p style={{ color: '#ff4c4c', marginTop: '-10px' }}>{usernameError}</p>}

            <label>Email:</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={checkEmail}
              required
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: emailError ? '2px solid #ff4c4c' : '2px solid #00bfff',
                backgroundColor: '#222',
                color: '#f0f0f0',
                outline: 'none',
                fontSize: '1rem',
                boxShadow: emailError ? '0 0 10px #ff4c4c' : '0 0 10px #00bfff',
                transition: 'border-color 0.3s ease',
              }}
            />
            {emailError && <p style={{ color: '#ff4c4c', marginTop: '-10px' }}>{emailError}</p>}

            <label>Password:</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
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

            <label>Confirm Password:</label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
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
              disabled={!!usernameError || !!emailError}
              style={{
                marginTop: '20px',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#00bfff',
                color: '#121212',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 0 15px #00bfff',
                transition: 'background-color 0.3s ease',
                opacity: !!usernameError || !!emailError ? 0.6 : 1,
              }}
            >
              Register
            </button>
          </form>

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
          {success && (
            <p
              style={{
                marginTop: '15px',
                color: '#00ffea',
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: '0 0 8px #00bfff',
              }}
            >
              {success}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Register;
