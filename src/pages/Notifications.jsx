import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState([]);

  const token = localStorage.getItem('access_token');
  const backendURL = import.meta.env.VITE_BACKEND_URL || '';

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        setError('Please log in to view notifications.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(`${backendURL}/api/notifications/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(res.data)) {
          setNotifications(res.data);
        } else {
          setError('Invalid notifications format.');
        }
      } catch {
        setError('Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token, backendURL]);

  const markAllAsRead = async () => {
    if (!token) return;

    try {
      await axios.post(
        `${backendURL}/api/notifications/mark-all-read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      toast.error('Failed to mark notifications as read.');
    }
  };

  const handleAccept = async (notif) => {
    if (processingIds.includes(notif.id)) return;
    setProcessingIds((prev) => [...prev, notif.id]);

    try {
      await axios.post(
        `${backendURL}/api/friend-requests/accept/`,
        { sender_id: notif.sender_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notif.id)
      );
      toast.success('Friend request accepted!');
    } catch {
      toast.error('Failed to accept friend request');
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== notif.id));
    }
  };

  const handleReject = async (notif) => {
    if (processingIds.includes(notif.id)) return;
    setProcessingIds((prev) => [...prev, notif.id]);

    try {
      await axios.post(
        `${backendURL}/api/friend-requests/reject/`,
        { sender_id: notif.sender_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notif.id)
      );
      toast.info('Friend request rejected.');
    } catch {
      toast.error('Failed to reject friend request');
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== notif.id));
    }
  };

  return (
    <div style={{
      background: '#000',
      minHeight: '100vh',
      padding: '40px 20px',
      margin: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'start',
      boxSizing: 'border-box'
    }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div
        style={{
          maxWidth: '700px',
          width: '100%',
          padding: '24px',
          background: 'linear-gradient(135deg, #030303, #3a003f, #1a002b)',
          color: '#dedcf5',
          borderRadius: '16px',
          boxShadow: '0 0 30px rgba(255,0,120,0.5)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '80vh',
          userSelect: 'none',
        }}
      >
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          marginBottom: '24px',
          color: '#ff4c98',
          textAlign: 'center',
          textShadow: '0 0 8px #ff4c98',
          userSelect: 'text',
        }}>
          Notifications
        </h1>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <button
            onClick={markAllAsRead}
            disabled={notifications.every(n => n.read) || loading}
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

        {loading && <p style={{ textAlign: 'center', color: '#aaaaaa', userSelect: 'text' }}>Loading notifications...</p>}
        {error && <p style={{ textAlign: 'center', color: '#ff4c6d', fontWeight: '700', userSelect: 'text' }}>{error}</p>}
        {!loading && notifications.length === 0 && <p style={{ textAlign: 'center', color: '#aaaaaa', userSelect: 'text' }}>No notifications found.</p>}

        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, overflowY: 'auto', flexGrow: 1 }}>
          {notifications.map((notif) => (
            <li
              key={notif.id}
              style={{
                border: '2px solid',
                borderColor: notif.read ? '#5f1d78' : '#ff4c98',
                backgroundColor: notif.read ? '#1a002b' : '#3a003f',
                color: notif.read ? '#aaa' : '#ff7eb9',
                padding: '18px 22px',
                marginBottom: '18px',
                borderRadius: '14px',
                userSelect: 'text',
                position: 'relative',
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

              {notif.type === 'friend_request' && (
                <div style={{ marginTop: '12px' }}>
                  <button
                    disabled={processingIds.includes(notif.id)}
                    onClick={() => handleAccept(notif)}
                    style={{
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginRight: '12px',
                      opacity: processingIds.includes(notif.id) ? 0.6 : 1,
                    }}
                  >
                    Accept
                  </button>
                  <button
                    disabled={processingIds.includes(notif.id)}
                    onClick={() => handleReject(notif)}
                    style={{
                      backgroundColor: '#e53935',
                      color: 'white',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      opacity: processingIds.includes(notif.id) ? 0.6 : 1,
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Notifications;
