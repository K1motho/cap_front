import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('access_token');
  const backendURL = import.meta.env.VITE_BACKEND_URL || '';

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        console.log('[DEBUG] No access token found in localStorage');
        setError('Please log in to view notifications.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const url = `${backendURL}/api/notifications/`;
      console.log('[DEBUG] Fetching notifications from:', url);

      try {
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('[DEBUG] Response received:', res);

        if (Array.isArray(res.data)) {
          setNotifications(res.data);
          console.log('[DEBUG] Notifications set:', res.data.length);
        } else {
          console.warn('[DEBUG] Unexpected notifications format:', res.data);
          setError('Invalid notifications format.');
        }
      } catch (err) {
        console.error('[DEBUG] Axios error fetching notifications:', err);
        if (err.response) {
          console.error('[DEBUG] Response data:', err.response.data);
          console.error('[DEBUG] Response status:', err.response.status);
          console.error('[DEBUG] Response headers:', err.response.headers);
          setError(`Failed to load notifications: ${err.response.status} ${err.response.statusText}`);
        } else if (err.request) {
          console.error('[DEBUG] No response received, request made:', err.request);
          setError('No response from server.');
        } else {
          console.error('[DEBUG] Error setting up request:', err.message);
          setError('Request setup error.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token, backendURL]);

  const markAllAsRead = async () => {
    if (!token) {
      console.log('[DEBUG] Cannot mark all as read without token');
      return;
    }

    try {
      console.log('[DEBUG] Marking all notifications as read...');
      await axios.post(
        `${backendURL}/api/notifications/mark-all-read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update UI locally for instant feedback:
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      console.log('[DEBUG] All notifications marked as read locally');
    } catch (err) {
      console.error('[DEBUG] Failed to mark all as read', err);
    }
  };

  const handleNotificationClick = notif => {
    console.log('[DEBUG] Clicked notification:', notif);
    // Future: navigate to related page or mark this notification read individually
  };

  return (
    <>
      {/* Global CSS Reset + Gradient Animation */}
      <style>{`
        html, body {
          margin: 0; padding: 0;
          background-color: #0a0a0a;
          font-family: 'Poppins', sans-serif;
          color: #f3f3f3;
          min-height: 100vh;
        }
        * {
          box-sizing: border-box;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div
        style={{
          maxWidth: '700px',
          margin: '40px auto',
          padding: '24px',
          background: 'linear-gradient(135deg, #030303, #3a003f, #1a002b)',
          color: '#dedcf5',
          borderRadius: '16px',
          boxShadow: '0 0 30px rgba(255,0,120,0.5)',
          animation: 'gradientShift 20s ease infinite',
          backgroundSize: '600% 600%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '80vh',
          userSelect: 'none',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '24px',
            color: '#ff4c98',
            textAlign: 'center',
            textShadow: '0 0 8px #ff4c98',
            userSelect: 'text',
          }}
        >
          Notifications
        </h1>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <button
            onClick={markAllAsRead}
            disabled={notifications.every(n => n.read) || loading}
            title={
              notifications.every(n => n.read)
                ? 'All notifications are already read'
                : 'Mark all as read'
            }
            style={{
              backgroundColor: '#c9004d',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: notifications.every(n => n.read) || loading ? 'not-allowed' : 'pointer',
              opacity: notifications.every(n => n.read) || loading ? 0.6 : 1,
              boxShadow: '0 0 10px #c9004daa',
              userSelect: 'none',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={e => {
              if (!(notifications.every(n => n.read) || loading)) {
                e.currentTarget.style.backgroundColor = '#8b0035';
              }
            }}
            onMouseLeave={e => {
              if (!(notifications.every(n => n.read) || loading)) {
                e.currentTarget.style.backgroundColor = '#c9004d';
              }
            }}
          >
            Mark all as read
          </button>
        </div>

        {loading && (
          <p style={{ textAlign: 'center', color: '#aaaaaa', userSelect: 'text' }}>
            Loading notifications...
          </p>
        )}
        {error && (
          <p style={{ textAlign: 'center', color: '#ff4c6d', fontWeight: '700', userSelect: 'text' }}>
            {error}
          </p>
        )}
        {!loading && notifications.length === 0 && (
          <p style={{ textAlign: 'center', color: '#aaaaaa', userSelect: 'text' }}>
            No notifications found.
          </p>
        )}

        <ul
          style={{
            listStyleType: 'none',
            padding: 0,
            margin: 0,
            overflowY: 'auto',
            flexGrow: 1,
          }}
        >
          {notifications.map((notif) => (
            <li
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              style={{
                border: '2px solid',
                borderColor: notif.read ? '#5f1d78' : '#ff4c98',
                backgroundColor: notif.read ? '#1a002b' : '#3a003f',
                color: notif.read ? '#aaa' : '#ff7eb9',
                padding: '18px 22px',
                marginBottom: '18px',
                borderRadius: '14px',
                cursor: 'pointer',
                boxShadow: notif.read
                  ? 'none'
                  : '0 0 15px 3px rgba(255, 76, 152, 0.6)',
                transition: 'background-color 0.3s, box-shadow 0.3s',
                userSelect: 'text',
              }}
              onMouseEnter={e => {
                if (!notif.read) e.currentTarget.style.backgroundColor = '#66004d';
                else e.currentTarget.style.backgroundColor = '#2a002a';
              }}
              onMouseLeave={e => {
                if (!notif.read) e.currentTarget.style.backgroundColor = '#3a003f';
                else e.currentTarget.style.backgroundColor = '#1a002b';
              }}
            >
              <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '10px' }}>
                {notif.title}
              </p>
              <p style={{ marginBottom: '10px', whiteSpace: 'pre-line', fontSize: '1rem' }}>
                {notif.message}
              </p>
              <small style={{ fontSize: '0.85rem', color: '#777' }}>
                {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Unknown time'}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Notifications;
