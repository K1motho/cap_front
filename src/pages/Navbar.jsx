import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      axios.get('/api/notifications/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        const unread = res.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      })
      .catch(err => console.error('Error fetching notifications:', err));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav>
      <div>
        <Link to="/">Wapi Na Lini</Link>
      </div>

      <div>
        <input type="text" placeholder="Search events..." />
      </div>

      <div>
        {isLoggedIn ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/notifications">
              Notifications{' '}
              {unreadCount > 0 && <span>{unreadCount}</span>}
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
