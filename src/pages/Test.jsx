import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EventbriteEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('Nairobi');
  const [keyword, setKeyword] = useState('music');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const API_URL = import.meta.env.VITE_DJANGO_URL;

  const fetchEvents = async (pageNumber = 1, isNewSearch = false) => {
    console.log(`Starting fetchEvents: pageNumber=${pageNumber}, isNewSearch=${isNewSearch}`);
    setLoading(true);
    setError(null);

    try {
      console.log('Sending request to Django backend with params:', {
        location: location || 'Nairobi',
        keyword: keyword || 'events',
        page: pageNumber,
      });

      const response = await axios.get(`${API_URL}/api/eventbrite-events/`, {
        params: {
          location,
          keyword,
          page: pageNumber,
        },
      });

      console.log('Received response:', response.data);

      if (isNewSearch) {
        setEvents(response.data.events);
        console.log('Set events (new search). Count:', response.data.events.length);
      } else {
        setEvents(prev => [...prev, ...response.data.events]);
        console.log('Appended events. Total count:', events.length + response.data.events.length);
      }

      setHasMore(response.data.pagination.has_more_items);
      console.log('Has more events:', response.data.pagination.has_more_items);
    } catch (err) {
      console.error('Error fetching events:', err.response?.data || err.message || err);
      setError('Failed to fetch events. See console for details.');
    } finally {
      setLoading(false);
      console.log('FetchEvents finished.');
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching events...');
    fetchEvents(1, true);
  }, []);

  const handleSearch = () => {
    console.log('Search triggered');
    setPage(1);
    fetchEvents(1, true);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    console.log('Load more triggered, next page:', next);
    setPage(next);
    fetchEvents(next);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Eventbrite Events (via Django Proxy)</h2>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Location"
        />
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="Keyword"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && events.length === 0 && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && events.length === 0 && !error && <p>No events found.</p>}

      {events.map(event => (
        <div key={event.id} style={{ border: '1px solid #ccc', margin: '1rem 0', padding: '1rem' }}>
          <h3>{event.name.text}</h3>
          <p>{event.description?.text?.slice(0, 200)}...</p>
          <p><strong>Date:</strong> {new Date(event.start.local).toLocaleString()}</p>
          <p><strong>Venue:</strong> {event.venue?.address?.localized_address_display || 'TBA'}</p>
          <a href={event.url} target="_blank" rel="noopener noreferrer">
            View on Eventbrite
          </a>
        </div>
      ))}

      {hasMore && (
        <button onClick={handleLoadMore} disabled={loading}>
          {loading ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default EventbriteEvents;
