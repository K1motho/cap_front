import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

// Sidebar links constants
const SIDEBAR_LINKS = [
  { id: 'profile', label: 'Profile' },
  { id: 'attended', label: 'Attended Events' },
  { id: 'chatfriends', label: 'Chat & Friends' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'home', label: 'Home' }, // Landing page link
];

// Dummy Profile component
const Profile = ({ onEdit }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Fetch user profile here
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get('/api/profile/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProfile(res.data))
      .catch(err => console.error('Error fetching profile:', err));
  }, []);

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div>
      <h2>Your Profile</h2>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      {/* Add more profile fields as needed */}
      <button onClick={onEdit}>Edit Profile</button>
    </div>
  );
};

// Dummy EditProfile component
const EditProfile = ({ profile, onSave, onCancel }) => {
  const [form, setForm] = useState(profile || { name: '', email: '' });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Call API to save profile
    const token = localStorage.getItem('token');
    axios.put('/api/profile/', form, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        onSave(res.data);
      })
      .catch(err => console.error('Error saving profile:', err));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Profile</h2>
      <label>
        Name:
        <input name="name" value={form.name} onChange={handleChange} />
      </label>
      <br />
      <label>
        Email:
        <input name="email" value={form.email} onChange={handleChange} />
      </label>
      <br />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

// Dummy Attended Events component
const AttendedEvents = () => {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/attended-events/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setEvents(res.data))
      .catch(err => console.error('Error fetching attended events:', err));
  }, []);

  if (!events) return <p>Loading attended events...</p>;

  if (events.length === 0) return <p>No attended events found.</p>;

  return (
    <div>
      <h2>Attended Events</h2>
      <ul>
        {events.map(ev => (
          <li key={ev.id}>{ev.name} - {ev.date}</li>
        ))}
      </ul>
    </div>
  );
};

// Dummy ChatFriends component
const ChatFriends = () => {
  return (
    <div>
      <h2>Chat & Friends</h2>
      <p>Chat and friend list functionality here.</p>
    </div>
  );
};

// Dummy Notifications component
const Notifications = () => {
  return (
    <div>
      <h2>Notifications</h2>
      <p>Notification history and details here.</p>
    </div>
  );
};

const Dashboard = () => {
  const [selected, setSelected] = useState('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const token = localStorage.getItem('token');
  if (!token) {
    // Redirect to login if not logged in
    return <Navigate to="/Login" />;
  }

  // Handler for clicking sidebar links
  const handleSelect = id => {
    setEditingProfile(false); // Reset edit mode when switching sections
    setSelected(id);
  };

  // Handler for starting profile edit
  const handleEditProfile = () => {
    setEditingProfile(true);
  };

  // Handler after profile save
  const handleSaveProfile = (updatedProfile) => {
    setProfileData(updatedProfile);
    setEditingProfile(false);
    setSelected('profile');
  };

  // Handler for cancelling edit
  const handleCancelEdit = () => {
    setEditingProfile(false);
  };

  // Main content rendering logic
  const renderContent = () => {
    if (selected === 'profile') {
      if (editingProfile) {
        return <EditProfile profile={profileData} onSave={handleSaveProfile} onCancel={handleCancelEdit} />;
      }
      return <Profile onEdit={handleEditProfile} />;
    }

    if (selected === 'attended') return <AttendedEvents />;
    if (selected === 'chatfriends') return <ChatFriends />;
    if (selected === 'notifications') return <Notifications />;

    if (selected === 'home') {
      // Redirect to Landing page
      window.location.href = '/';
      return null;
    }

    return <p>Section not found.</p>;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '200px', borderRight: '1px solid #ccc' }}>
        <nav>
          <ul>
            {SIDEBAR_LINKS.map(link => (
              <li key={link.id}>
                <button
                  onClick={() => handleSelect(link.id)}
                  style={{
                    background: selected === link.id ? '#ddd' : 'transparent',
                    border: 'none',
                    padding: '10px',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '1rem' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
