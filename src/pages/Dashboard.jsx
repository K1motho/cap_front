import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const SIDEBAR_LINKS = [
  { id: 'profile', label: 'Profile' },
  { id: 'attended', label: 'Attended Events' },
  { id: 'chatfriends', label: 'Chat & Friends' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'home', label: 'Home' },
];

const Profile = ({ onEdit, profile }) => {
  if (!profile) return <p style={{ color: '#ccc' }}>Loading profile...</p>;

  return (
    <div>
      <h2 style={{ color: '#00bfff' }}>Your Profile</h2>
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
      {profile.profile_pic && (
        <div>
          <strong>Profile Picture:</strong><br />
          <img
            src={profile.profile_pic}
            alt="Profile"
            style={{ width: '120px', borderRadius: '50%', marginTop: '10px' }}
          />
        </div>
      )}
      <button onClick={onEdit} style={buttonStyle}>Edit Profile</button>
    </div>
  );
};

const EditProfile = ({ profile, onSave, onCancel }) => {
  const [form, setForm] = useState({
    username: profile.username || '',
    email: profile.email || '',
    bio: profile.bio || '',
    profile_pic: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, profile_pic: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('No token found, please login again.');
      return;
    }

    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('email', form.email);
    formData.append('bio', form.bio);
    if (form.profile_pic) {
      formData.append('profile_pic', form.profile_pic);
    }

    try {
      const res = await axios.put(`${BASE_URL}/api/profile/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Profile saved:', res.data);
      onSave(res.data);
    } catch (err) {
      if (err.response) {
        console.error('Error response:', err.response.status, err.response.data);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Request setup error:', err.message);
      }
      alert('Failed to save profile. Check console for errors.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <h2 style={{ color: '#00bfff' }}>Edit Profile</h2>
      <label>
        Username:
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          style={inputStyle}
          required
        />
      </label>
      <label>
        Email:
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          style={inputStyle}
          type="email"
          required
        />
      </label>
      <label>
        Bio:
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows="4"
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </label>
      <label>
        Profile Picture:
        <input
          name="profile_pic"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={inputStyle}
        />
      </label>
      <div>
        <button type="submit" style={buttonStyle}>Save</button>
        <button type="button" onClick={onCancel} style={{ ...buttonStyle, backgroundColor: '#999' }}>Cancel</button>
      </div>
    </form>
  );
};

const AttendedEvents = () => {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    axios.get(`${BASE_URL}/api/attended-events/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setEvents(res.data))
      .catch(err => {
        if (err.response) {
          console.error('Attended Events Error:', err.response.status, err.response.data);
        } else {
          console.error('Attended Events Fetch Error:', err);
        }
      });
  }, []);

  if (!events) return <p style={{ color: '#ccc' }}>Loading attended events...</p>;
  if (events.length === 0) return <p style={{ color: '#ccc' }}>No attended events found.</p>;

  return (
    <div>
      <h2 style={{ color: '#00bfff' }}>Attended Events</h2>
      <ul>
        {events.map(ev => (
          <li key={ev.id} style={{ color: '#eee' }}>
            {ev.name} - {ev.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Dashboard = () => {
  const [selected, setSelected] = useState('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const token = localStorage.getItem('access_token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.warn('No access token found.');
      return;
    }

    axios.get(`${BASE_URL}/api/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setProfileData(res.data);
        console.log('Profile loaded:', res.data);
      })
      .catch(err => {
        if (err.response) {
          console.error('Profile Error:', err.response.status, err.response.data);
        } else {
          console.error('Profile Fetch Error:', err);
        }
      });
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;

  const handleSelect = (id) => {
    setEditingProfile(false);
    if (id === 'chatfriends') return navigate('/friendprofile');
    if (id === 'notifications') return navigate('/notifications');
    if (id === 'home') return (window.location.href = '/');
    setSelected(id);
  };

  const handleEditProfile = () => setEditingProfile(true);

  const handleSaveProfile = (updatedProfile) => {
    setProfileData(updatedProfile);
    setEditingProfile(false);
    setSelected('profile');
  };

  const handleCancelEdit = () => setEditingProfile(false);

  const renderContent = () => {
    if (selected === 'profile') {
      return editingProfile ? (
        <EditProfile
          profile={profileData}
          onSave={handleSaveProfile}
          onCancel={handleCancelEdit}
        />
      ) : (
        <Profile
          profile={profileData}
          onEdit={handleEditProfile}
        />
      );
    }
    if (selected === 'attended') return <AttendedEvents />;
    return <p style={{ color: '#ccc' }}>Section not found.</p>;
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
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{ width: '220px', backgroundColor: '#121212', boxShadow: '0 0 15px #00bfff' }}>
          <nav>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {SIDEBAR_LINKS.map(link => (
                <li key={link.id}>
                  <button
                    onClick={() => handleSelect(link.id)}
                    style={{
                      background: selected === link.id ? '#00bfff' : 'transparent',
                      color: selected === link.id ? '#121212' : '#f0f0f0',
                      border: 'none',
                      padding: '15px 20px',
                      width: '100%',
                      textAlign: 'left',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: selected === link.id ? '0 0 10px #00bfff' : 'none',
                      transition: '0.3s ease',
                    }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main style={{ flex: 1, padding: '2rem', color: '#f0f0f0' }}>
          {renderContent()}
        </main>
      </div>
    </>
  );
};

const inputStyle = {
  padding: '10px',
  borderRadius: '6px',
  border: '2px solid #00bfff',
  backgroundColor: '#222',
  color: '#f0f0f0',
  fontSize: '1rem',
  boxShadow: '0 0 10px #00bfff',
  outline: 'none',
};

const buttonStyle = {
  marginRight: '10px',
  padding: '10px 20px',
  backgroundColor: '#00bfff',
  color: '#121212',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow: '0 0 10px #00bfff',
};

export default Dashboard;
