import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode.react';

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

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Fetch friends list
  useEffect(() => {
    if (!token) return;
    setLoadingFriends(true);
    axios
      .get('/api/friends/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setFriends(res.data);
        setLoadingFriends(false);
      })
      .catch(() => {
        setErrorFriends('Failed to load friends.');
        setLoadingFriends(false);
      });
  }, [token]);

  // Fetch friend events
  useEffect(() => {
    if (!token) return;
    setLoadingEvents(true);
    axios
      .get('/api/friend-events/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setFriendEvents(res.data);
        setLoadingEvents(false);
      })
      .catch(() => {
        setErrorEvents('Failed to load friend events.');
        setLoadingEvents(false);
      });
  }, [token]);

  // Load profile data when selectedFriend changes
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

    setLoadingProfile(true);
    setErrorProfile(null);

    axios
      .get(`/api/friends/${selectedFriend.id}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setProfileData(res.data);
        setLoadingProfile(false);
      })
      .catch(() => {
        setErrorProfile('Failed to load friend profile.');
        setLoadingProfile(false);
      });
  }, [selectedFriend, token, navigate]);

  // Filter friends by search
  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUnfriend = async () => {
    if (!profileData) return;
    try {
      await axios.delete(`/api/friends/${profileData.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Friend removed.');
      setSelectedFriend(null);
      // Refresh friends list
      setLoadingFriends(true);
      const res = await axios.get('/api/friends/', { headers: { Authorization: `Bearer ${token}` } });
      setFriends(res.data);
      setLoadingFriends(false);
    } catch {
      alert('Failed to remove friend.');
    }
  };

  const handleChat = () => {
    if (!profileData) return;
    // Navigate to separate chat page with friend id in state
    navigate('/chat', { state: { chatWith: profileData.id } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Navbar */}
      <nav
        style={{
          padding: '10px',
          borderBottom: '1px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
        }}
      >
        <Link to="/" style={{ fontSize: '24px', textDecoration: 'none' }}>
          🏠 Home
        </Link>
        <input
          type="search"
          placeholder="Search friends..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flexGrow: 1, padding: '5px' }}
        />
      </nav>

      {/* Main content */}
      <div style={{ flexGrow: 1, display: 'flex', padding: '10px', gap: '20px' }}>
        {/* Left: QR Code Invite */}
        <div
          style={{
            width: '250px',
            border: '1px solid #ccc',
            padding: '15px',
            borderRadius: '8px',
          }}
        >
          <h3>Invite a Friend</h3>
          {userId ? (
            <>
              <QRCode value={`https://wapinalini.com/invite/${userId}`} size={200} />
              <p style={{ wordBreak: 'break-word', marginTop: '10px' }}>
                https://wapinalini.com/invite/{userId}
              </p>
            </>
          ) : (
            <p>User ID not found. Please login again.</p>
          )}
        </div>

        {/* Right: Friends List */}
        <div
          style={{
            flexGrow: 1,
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '15px',
            overflowY: 'auto',
          }}
        >
          <h3>Friends</h3>
          {loadingFriends ? (
            <p>Loading friends...</p>
          ) : errorFriends ? (
            <p>{errorFriends}</p>
          ) : filteredFriends.length === 0 ? (
            <p>No friends found.</p>
          ) : (
            filteredFriends.map(friend => (
              <div
                key={friend.id}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: selectedFriend?.id === friend.id ? '#f0f0f0' : '',
                }}
                onClick={() => setSelectedFriend(friend)}
              >
                {friend.avatar ? (
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    width={40}
                    height={40}
                    style={{ borderRadius: '50%' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: '#ccc',
                      borderRadius: '50%',
                    }}
                  />
                )}
                <div>
                  <strong>{friend.name}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Friend Profile / Chat Panel */}
      <div
        style={{
          borderTop: '1px solid #ccc',
          padding: '10px 15px',
          height: '250px',
          overflowY: 'auto',
          backgroundColor: '#fafafa',
        }}
      >
        {loadingProfile ? (
          <p>Loading friend profile...</p>
        ) : errorProfile ? (
          <p>{errorProfile}</p>
        ) : profileData ? (
          <div>
            <h2>{profileData.name}&apos;s Profile</h2>
            {profileData.avatar && (
              <img src={profileData.avatar} alt="Avatar" width="100" height="100" />
            )}
            <p>
              <strong>Email:</strong> {profileData.email}
            </p>

            <h3>Mutual Events</h3>
            {profileData.mutual_events?.length > 0 ? (
              <ul>
                {profileData.mutual_events.map(event => (
                  <li key={event.id}>
                    {event.name} - {event.date}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No mutual events.</p>
            )}

            <button onClick={handleChat} style={{ marginRight: '10px' }}>
              Message
            </button>
            <button onClick={handleUnfriend} style={{ marginRight: '10px' }}>
              Unfriend
            </button>
            <button onClick={() => setSelectedFriend(null)}>Back</button>
          </div>
        ) : (
          <p>Select a friend to see their profile.</p>
        )}
      </div>

      {/* Friend Events List */}
      <div
        style={{
          borderTop: '1px solid #ccc',
          padding: '10px 15px',
          height: '150px',
          overflowY: 'auto',
        }}
      >
        <h3>Friend Events</h3>
        {loadingEvents ? (
          <p>Loading events...</p>
        ) : errorEvents ? (
          <p>{errorEvents}</p>
        ) : friendEvents.length === 0 ? (
          <p>No shared events found.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {friendEvents.map(event => (
              <li key={event.id}>
                {event.name} - {event.date}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
