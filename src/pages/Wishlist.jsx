import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token'); // confirm your token key here
        const res = await axios.get('/api/wishlist', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Defensive: ensure res.data is an array
        if (Array.isArray(res.data)) {
          setWishlist(res.data);
        } else if (Array.isArray(res.data.wishlist)) {
          setWishlist(res.data.wishlist);
        } else {
          setWishlist([]); // fallback empty array
          console.warn('Wishlist data is not an array:', res.data);
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/wishlist/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWishlist((prev) => prev.filter((event) => event.id !== eventId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      alert('Could not remove event. Try again.');
    }
  };

  if (loading) return <p>Loading wishlist...</p>;
  if (error) return <p>{error}</p>;
  if (!Array.isArray(wishlist) || wishlist.length === 0) return <p>Your wishlist is empty.</p>;

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      <h2>Your Wishlist</h2>
      {wishlist.map((event) => (
        <div
          key={event.id}
          style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}
        >
          <img
            src={event.image || 'https://via.placeholder.com/600x200'}
            alt={event.name}
            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
          />
          <h3>{event.name}</h3>
          <p>
            <strong>Date:</strong> {event.date}
          </p>
          <p>
            <strong>Venue:</strong> {event.venue}
          </p>
          <div>
            <button
              onClick={() => navigate(`/event/${event.id}`)}
              style={{ marginRight: '10px' }}
            >
              View Details
            </button>
            <button
              onClick={() => removeFromWishlist(event.id)}
              style={{ backgroundColor: 'red', color: 'white' }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Wishlist;
