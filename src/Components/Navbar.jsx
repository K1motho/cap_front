import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 30px',
        backgroundColor: '#1a001a',
        borderBottom: '1px solid #2a002a',
        color: '#f3f3f3',
        fontFamily: "'Poppins', sans-serif",
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Link
        to="/"
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#ff4c98',
          textDecoration: 'none',
        }}
      >
        Wapi Na Lini
      </Link>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        {isLoggedIn && (
          <Link
            to="/dashboard"
            style={{
              color: '#f3f3f3',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s',
            }}
            onMouseOver={(e) => (e.target.style.color = '#ffc107')}
            onMouseOut={(e) => (e.target.style.color = '#f3f3f3')}
          >
            Dashboard
          </Link>
        )}

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff4c98',
              color: '#1a001a',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ffc107',
                color: '#1a001a',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#673ab7',
                color: '#f3f3f3',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
