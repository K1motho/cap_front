import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code';

const FriendsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendEvents, setFriendEvents] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorFriends, setErrorFriends] = useState(null);
  const [errorEvents, setErrorEvents] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [errorProfile, setErrorProfile] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const [shareStatus, setShareStatus] = useState(''); // <-- For share feedback

  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!token) return;

    const fetchFriends = async () => {
      setLoadingFriends(true);
      try {
        const res = await axios.get(`${API_BASE}/api/friends/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API /api/friends/ response:', res.data);

        if (res.data && Array.isArray(res.data)) {
          setFriends(res.data);
          setErrorFriends(null);
        } else if (res.data && Array.isArray(res.data.friends)) {
          setFriends(res.data.friends);
          setErrorFriends(null);
        } else {
          setFriends([]);
          setErrorFriends('Invalid friends data format.');
          console.error('Invalid friends data format:', res.data);
        }
      } catch (error) {
        setErrorFriends('Failed to load friends.');
        setFriends([]);
        console.error('Error fetching friends:', error);
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchFriends();
  }, [token, API_BASE]);

  useEffect(() => {
    if (!token) return;

    const fetchFriendEvents = async () => {
      setLoadingEvents(true);
      try {
        const res = await axios.get(`${API_BASE}/api/friend-events/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API /api/friend-events/ response:', res.data);

        if (res.data && Array.isArray(res.data)) {
          setFriendEvents(res.data);
          setErrorEvents(null);
        } else if (res.data && Array.isArray(res.data.events)) {
          setFriendEvents(res.data.events);
          setErrorEvents(null);
        } else {
          setFriendEvents([]);
          setErrorEvents('Invalid friend events data format.');
          console.error('Invalid friend events data format:', res.data);
        }
      } catch (error) {
        setErrorEvents('Failed to load friend events.');
        setFriendEvents([]);
        console.error('Error fetching friend events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchFriendEvents();
  }, [token, API_BASE]);

  useEffect(() => {
    if (!selectedFriend) {
      setProfileData(null);
      setErrorProfile(null);
      setLoadingProfile(false);
      return;
    }

    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await axios.get(`${API_BASE}/api/friends/${selectedFriend.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`API /api/friends/${selectedFriend.id}/ response:`, res.data);
        setProfileData(res.data);
        setErrorProfile(null);
      } catch (error) {
        setErrorProfile('Failed to load friend profile.');
        setProfileData(null);
        console.error('Error fetching friend profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [selectedFriend, token, navigate, API_BASE]);

  const filteredFriends = Array.isArray(friends)
    ? friends.filter(f =>
        (f.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleUnfriend = async () => {
    if (!profileData) return;
    try {
      console.log('Unfriending user with id:', profileData.id);
      await axios.delete(`${API_BASE}/api/friends/${profileData.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Friend removed.');
      setSelectedFriend(null);
      const res = await axios.get(`${API_BASE}/api/friends/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API /api/friends/ (after unfriend) response:', res.data);
      setFriends(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert('Failed to remove friend.');
      console.error('Error unfriending:', error);
    }
  };

  const handleChat = () => {
    if (!profileData) return;
    console.log('Navigating to chat with user id:', profileData.id);
    navigate('/chat', { state: { chatWith: profileData.id } });
  };

  // Share button handler
  const inviteUrl = `https://wapinalini.com/invite/${userId}`;

  const handleShareInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wapi Na Lini - Friend Invite',
          text: 'Join me on Wapi Na Lini! Scan this QR code or use the link.',
          url: inviteUrl,
        });
        setShareStatus('Invite shared successfully!');
      } catch (err) {
        setShareStatus('Share canceled or failed.');
        console.error('Share error:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(inviteUrl);
        setShareStatus('Invite URL copied to clipboard!');
      } catch (err) {
        setShareStatus('Failed to copy invite URL.');
        console.error('Clipboard error:', err);
      }
    }

    // Clear status message after 3 seconds
    setTimeout(() => setShareStatus(''), 3000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: '#f0f6f0',
        color: '#2d4a2d',
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          padding: '12px 24px',
          borderBottom: '3px solid #4caf50',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          backgroundColor: '#e8f5e9',
          boxShadow: '0 2px 6px rgb(0 0 0 / 0.1)',
          fontWeight: '600',
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: '26px',
            textDecoration: 'none',
            color: '#2e7d32',
            fontWeight: '700',
            userSelect: 'none',
          }}
        >
          🏠 Home
        </Link>
        <input
          type="search"
          placeholder="Search friends..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            flexGrow: 1,
            padding: '9px 16px',
            borderRadius: '8px',
            border: '2px solid #4caf50',
            fontSize: '16px',
            outlineColor: '#66bb6a',
            transition: 'border-color 0.3s',
          }}
          onFocus={e => (e.target.style.borderColor = '#66bb6a')}
          onBlur={e => (e.target.style.borderColor = '#4caf50')}
        />
      </nav>

      {/* Content area */}
      <div
        style={{
          flexGrow: 1,
          display: 'flex',
          gap: '24px',
          padding: '20px 30px',
          overflow: 'hidden',
        }}
      >
        {/* Left panel: QR Code + Friends List */}
        <div
          style={{
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* QR Code box */}
          <div
            style={{
              borderRadius: '12px',
              backgroundColor: 'white',
              padding: '20px',
              boxShadow: '0 4px 14px rgba(76,175,80,0.2)',
              textAlign: 'center',
              userSelect: 'none',
            }}
          >
            <h3 style={{ color: '#388e3c', marginBottom: '18px', fontWeight: '700' }}>
              Invite a Friend
            </h3>
            {userId ? (
              <>
                <QRCode value={inviteUrl} size={220} />
                <p
                  style={{
                    marginTop: '16px',
                    fontSize: '13px',
                    color: '#4caf50',
                    wordBreak: 'break-word',
                    userSelect: 'text',
                  }}
                >
                  {inviteUrl}
                </p>

                <button
                  onClick={handleShareInvite}
                  style={{
                    marginTop: '12px',
                    padding: '10px 18px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.25s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#388e3c')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#4caf50')}
                >
                  Share Invite
                </button>

                {shareStatus && (
                  <p
                    style={{
                      marginTop: '10px',
                      fontSize: '13px',
                      color: '#2e7d32',
                      fontWeight: '600',
                      userSelect: 'none',
                    }}
                  >
                    {shareStatus}
                  </p>
                )}
              </>
            ) : (
              <p style={{ color: '#d32f2f', fontWeight: '600' }}>
                User ID not found. Please login again.
              </p>
            )}
          </div>

          {/* Friends list */}
          <div
            style={{
              flexGrow: 1,
              borderRadius: '12px',
              backgroundColor: 'white',
              boxShadow: '0 4px 14px rgba(76,175,80,0.2)',
              overflowY: 'auto',
              padding: '16px 20px',
            }}
          >
            <h3
              style={{
                marginBottom: '14px',
                color: '#388e3c',
                fontWeight: '700',
                userSelect: 'none',
              }}
            >
              Friends
            </h3>
            {loadingFriends ? (
              <p style={{ color: '#666' }}>Loading friends...</p>
            ) : errorFriends ? (
              <p style={{ color: '#d32f2f', fontWeight: '600' }}>{errorFriends}</p>
            ) : filteredFriends.length === 0 ? (
              <p style={{ color: '#555' }}>No friends found.</p>
            ) : (
              filteredFriends.map(friend => (
                <div
                  key={friend.id}
                  onClick={() => setSelectedFriend(friend)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor:
                      selectedFriend?.id === friend.id ? '#dcedc8' : 'transparent',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.backgroundColor =
                      selectedFriend?.id === friend.id ? '#dcedc8' : '#f1f8f1')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor =
                      selectedFriend?.id === friend.id ? '#dcedc8' : 'transparent')
                  }
                >
                  {friend.avatar ? (
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      width={44}
                      height={44}
                      style={{
                        borderRadius: '50%',
                        border: '2.5px solid #4caf50',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        backgroundColor: '#c8e6c9',
                        border: '2.5px solid #4caf50',
                      }}
                    />
                  )}
                  <div
                    style={{
                      fontWeight: '600',
                      fontSize: '16px',
                      color: '#2e7d32',
                      userSelect: 'none',
                    }}
                  >
                    {friend.name}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel: Profile + Friend Events */}
        <div
          style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            height: '100%',
          }}
        >
          {/* Friend Profile */}
          <section
            style={{
              flexBasis: '250px',
              flexShrink: 0,
              borderRadius: '12px',
              backgroundColor: 'white',
              boxShadow: '0 4px 20px rgba(76,175,80,0.15)',
              padding: '22px 28px',
              overflowY: 'auto',
            }}
          >
            {loadingProfile ? (
              <p style={{ color: '#666' }}>Loading friend profile...</p>
            ) : errorProfile ? (
              <p style={{ color: '#d32f2f', fontWeight: '600' }}>{errorProfile}</p>
            ) : profileData ? (
              <>
                <h2
                  style={{
                    color: '#388e3c',
                    marginBottom: '14px',
                    fontWeight: '700',
                    userSelect: 'none',
                  }}
                >
                  {profileData.name}&apos;s Profile
                </h2>
                {profileData.avatar && (
                  <img
                    src={profileData.avatar}
                    alt="Avatar"
                    width={110}
                    height={110}
                    style={{
                      borderRadius: '14px',
                      border: '3px solid #4caf50',
                      marginBottom: '14px',
                      objectFit: 'cover',
                    }}
                  />
                )}
                <p
                  style={{
                    fontSize: '15px',
                    marginBottom: '10px',
                    userSelect: 'text',
                  }}
                >
                  <strong>Email:</strong>{' '}
                  <span style={{ color: '#2e7d32' }}>{profileData.email}</span>
                </p>

                <h3
                  style={{
                    marginTop: '24px',
                    marginBottom: '12px',
                    color: '#388e3c',
                    fontWeight: '700',
                    userSelect: 'none',
                  }}
                >
                  Mutual Events
                </h3>
                {profileData.mutual_events?.length > 0 ? (
                  <ul
                    style={{
                      paddingLeft: '22px',
                      maxHeight: '90px',
                      overflowY: 'auto',
                      color: '#2e7d32',
                      fontSize: '14px',
                      marginBottom: '12px',
                      userSelect: 'text',
                    }}
                  >
                    {profileData.mutual_events.map(event => (
                      <li key={event.id}>
                        {event.name} — {event.date}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No mutual events.</p>
                )}

                <div style={{ marginTop: '18px', display: 'flex', gap: '14px' }}>
                  <button
                    onClick={handleChat}
                    style={{
                      flexGrow: 1,
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      padding: '12px 0',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'background-color 0.25s',
                      userSelect: 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#388e3c')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#4caf50')}
                  >
                    Message
                  </button>

                  <button
                    onClick={handleUnfriend}
                    style={{
                      flexGrow: 1,
                      backgroundColor: '#e53935',
                      color: 'white',
                      border: 'none',
                      padding: '12px 0',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'background-color 0.25s',
                      userSelect: 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#ab000d')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#e53935')}
                  >
                    Unfriend
                  </button>

                  <button
                    onClick={() => setSelectedFriend(null)}
                    style={{
                      flexGrow: 1,
                      backgroundColor: '#9e9e9e',
                      color: 'white',
                      border: 'none',
                      padding: '12px 0',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'background-color 0.25s',
                      userSelect: 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#707070')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#9e9e9e')}
                  >
                    Back
                  </button>
                </div>
              </>
            ) : (
              <p style={{ fontStyle: 'italic', color: '#555' }}>
                Select a friend to see their profile.
              </p>
            )}
          </section>

          {/* Friend Events */}
          <section
            style={{
              flexGrow: 1,
              borderRadius: '12px',
              backgroundColor: 'white',
              boxShadow: '0 4px 20px rgba(76,175,80,0.15)',
              padding: '22px 28px',
              overflowY: 'auto',
              userSelect: 'none',
            }}
          >
            <h3
              style={{
                marginBottom: '18px',
                fontWeight: '700',
                color: '#388e3c',
                userSelect: 'none',
              }}
            >
              Friend Events
            </h3>
            {loadingEvents ? (
              <p style={{ color: '#666' }}>Loading events...</p>
            ) : errorEvents ? (
              <p style={{ color: '#d32f2f', fontWeight: '600' }}>{errorEvents}</p>
            ) : friendEvents.length === 0 ? (
              <p style={{ color: '#555' }}>No shared events found.</p>
            ) : (
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '22px',
                  color: '#2e7d32',
                  fontSize: '14px',
                  userSelect: 'text',
                }}
              >
                {friendEvents.map(event => (
                  <li key={event.id}>
                    {event.name} — {event.date}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
