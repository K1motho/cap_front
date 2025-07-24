import React from 'react';
import { useNavigate } from 'react-router-dom';

const Error404 = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.code}>404</h1>
      <p style={styles.message}>Oops! Page not found.</p>
      <button onClick={() => navigate('/')} style={styles.button}>
        Go to Landing Page
      </button>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '100px',
    color: '#ff4d4f',
    fontFamily: 'Arial, sans-serif',
  },
  code: {
    fontSize: '100px',
    marginBottom: '10px',
  },
  message: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  button: {
    fontSize: '18px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    border: 'none',
    color: '#fff',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default Error404;
