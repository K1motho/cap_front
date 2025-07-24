import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`https://app.ticketmaster.com/discovery/v2/events/${id}.json`, {
          params: {
            apikey: import.meta.env.VITE_TICKET_KEY,
          },
        });
        setEvent(res.data);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleMpesaRedirect = () => {
    navigate(`/payment/mpesa/${id}`);
  };

  const handleCardRedirect = () => {
    navigate(`/payment/card/${id}`);
  };

  const handleAddToWishlist = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please login to add to wishlist.');
      navigate('/login');
      return;
    }

    try {
      const payload = {
        event_id: event.id,
        name: event.name,
        image: event.images?.[0]?.url || '',
        date: event.dates?.start?.localDate,
        time: event.dates?.start?.localTime,
        venue: event._embedded?.venues?.[0]?.name,
      };

      await axios.post('/api/wishlist/', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Event added to your wishlist!');
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      alert('Failed to add to wishlist.');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem', color: '#ddd' }}>Loading event details...</p>;
  if (error) return <p style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>{error}</p>;
  if (!event) return <p style={{ textAlign: 'center', marginTop: '2rem', color: '#ddd' }}>No event found.</p>;

  const desc = event.info || event.description || 'No description available.';
  const venue = event._embedded?.venues?.[0];
  const date = event.dates?.start;

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

      <div style={{ minHeight: '100vh', padding: '0' }}>
        <div
          style={{
            maxWidth: '800px',
            margin: 'auto',
            padding: '20px',
            backgroundColor: '#121212',
            color: '#f3f3f3',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(255, 0, 120, 0.5)',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              marginBottom: '20px',
              padding: '10px 15px',
              backgroundColor: '#ff4c98',
              color: '#121212',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ← Back to Events
          </button>

          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{event.name}</h1>

          <img
            src={event.images?.[0]?.url || 'https://via.placeholder.com/800x300?text=No+Image'}
            alt={event.name}
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'cover',
              borderRadius: '12px',
              marginBottom: '20px',
              boxShadow: '0 0 15px rgba(255, 0, 120, 0.7)',
            }}
          />

          <p style={{ lineHeight: '1.6', marginBottom: '20px', fontSize: '1.1rem' }}>{desc}</p>

          <p><strong>Date:</strong> {date?.localDate} {date?.localTime || ''}</p>
          <p><strong>Venue:</strong> {venue?.name || 'TBA'}</p>
          <p><strong>Address:</strong> {venue?.address?.line1 || ''}, {venue?.city?.name || ''}, {venue?.country?.name || ''}</p>
          <p><strong>Status:</strong> {event.dates?.status?.code || 'TBA'}</p>

          <h3 style={{ marginTop: '30px' }}>Tickets</h3>
          {event.priceRanges ? (
            <ul style={{ marginLeft: '20px' }}>
              {event.priceRanges.map((pr, i) => (
                <li key={i}>
                  {pr.type} — {pr.min} {pr.currency} to {pr.max} {pr.currency}
                </li>
              ))}
            </ul>
          ) : (
            <p>Ticket pricing info not available.</p>
          )}

          <div style={{ marginTop: '30px' }}>
            <h3>Buy Tickets</h3>
            <button
              onClick={handleMpesaRedirect}
              style={{
                marginRight: '15px',
                padding: '10px 20px',
                backgroundColor: '#1cd12e',
                color: '#121212',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Pay with M-Pesa
            </button>
            <button
              onClick={handleCardRedirect}
              style={{
                padding: '10px 20px',
                backgroundColor: '#673ab7',
                color: '#f3f3f3',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Pay with Card
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <a
              href={event.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#ff4c98', textDecoration: 'underline', fontWeight: 'bold' }}
            >
              Official Event Page
            </a>
          </div>

          <div style={{ marginTop: '30px' }}>
            <button
              onClick={handleAddToWishlist}
              style={{
                padding: '10px 25px',
                backgroundColor: '#1441d7',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              ❤️ Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
