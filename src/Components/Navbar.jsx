import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Backend base URL from .env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const isLoggedIn = !!token;

  const [profilePic, setProfilePic] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Default avatar if user has no profile picture
  const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  useEffect(() => {
    const fetchProfile = async () => {
      if (isLoggedIn) {
        // Try to load profile picture from localStorage cache first
        const cachedPic = localStorage.getItem('profile_picture');
        if (cachedPic && cachedPic !== 'null' && cachedPic !== 'undefined') {
          setProfilePic(cachedPic);
        } else {
          try {
            // Fetch user profile from backend API
            const response = await axios.get(`${BACKEND_URL}/api/profile/`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });
            const picUrl = response.data.profile_picture;
            if (picUrl) {
              setProfilePic(picUrl);
              localStorage.setItem('profile_picture', picUrl);
            } else {
              setProfilePic(null);
            }
          } catch (error) {
            console.error('Failed to fetch profile picture:', error);
            setProfilePic(null);
          }
        }
      }
    };
    fetchProfile();
  }, [isLoggedIn, token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {!isLoggedIn ? (
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
        ) : (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <img
              src={profilePic || defaultAvatar}
              alt="Profile"
              onClick={() => setDropdownOpen((prev) => !prev)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                objectFit: 'cover',
                border: '2px solid #ffc107',
              }}
            />
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: 0,
                  backgroundColor: '#2a002a',
                  borderRadius: '8px',
                  boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  minWidth: '150px',
                  zIndex: 2000,
                }}
              >
                <Link
                  to="/dashboard"
                  style={{
                    display: 'block',
                    padding: '10px 15px',
                    color: '#f3f3f3',
                    textDecoration: 'none',
                    borderBottom: '1px solid #444',
                  }}
                  onClick={() => setDropdownOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '10px 15px',
                    background: 'none',
                    border: 'none',
                    color: '#ff4c98',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
