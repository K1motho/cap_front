import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const Landing = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0); // Ticketmaster starts from 0
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('Nairobi');
  const [keyword, setKeyword] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate(); // ✅ FIX 1: move useNavigate() inside the component

  const fetchEvents = async (pageNumber = 0, isNewSearch = false) => {
    console.log(`Fetching events: page=${pageNumber}, isNewSearch=${isNewSearch}`);
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
        params: {
          apikey: import.meta.env.VITE_TICKET_KEY, 
          keyword,
          city: location,
          page: pageNumber,
          size: ITEMS_PER_PAGE,
          sort: 'date,asc',
        },
      });

      const newEvents = res.data._embedded?.events || [];

      if (isNewSearch || pageNumber === 0) {
        setEvents(newEvents);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
      }

      const totalPages = res.data.page.totalPages;
      setHasMore(pageNumber + 1 < totalPages);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(0, true);
  }, []);

  const handleSearch = () => {
    setPage(0);
    fetchEvents(0, true);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage);
  };

  const toggleDescription = (id) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === id
          ? { ...event, showFullDesc: !event.showFullDesc }
          : event
      )
    );
  };

  return ( 
    <div>
      <h1>Upcoming Events</h1>

      <div>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Enter city"
        />
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="Enter keyword"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && events.length === 0 && <p>Loading events...</p>}
      {error && <p>{error}</p>}
      {!loading && events.length === 0 && <p>No upcoming events found.</p>}

      {events.map(event => {
        const desc = event.info || event.description || 'No description available.';
        const showFullDesc = event.showFullDesc || false;
        const displayedDesc = showFullDesc ? desc : desc.substring(0, 200);

        return (
          <div key={event.id} style={{ border: '1px solid #ccc', marginBottom: '20px', padding: '10px' }}>
            <img
              src={event.images?.[0]?.url || 'https://via.placeholder.com/800x300?text=No+Image'}
              alt={event.name}
              style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', cursor: 'pointer' }}
              onClick={() => navigate(`/event/${event.id}`)}
            />

            <div>
              <h2
                style={{ cursor: 'pointer', color: 'blue' }}
                onClick={() => navigate(`/event/${event.id}`)}
              >
                {event.name}
              </h2>

              <p>
                {displayedDesc}
                {desc.length > 200 && (
                  <button onClick={() => toggleDescription(event.id)}>
                    {showFullDesc ? ' Show Less' : ' Read More'}
                  </button>
                )}
              </p>

              <p><strong>Date:</strong> {new Date(event.dates?.start?.localDate).toLocaleString()}</p>
              <p><strong>Venue:</strong> {event._embedded?.venues?.[0]?.name || 'TBA'}</p>
              <p><strong>Location:</strong> {event._embedded?.venues?.[0]?.city?.name || 'Unknown'}, {event._embedded?.venues?.[0]?.country?.name || ''}</p>
              <p><strong>Status:</strong> {event.dates?.status?.code || 'TBA'}</p>
            </div>
          </div>
        );
      })}

      {hasMore && (
        <div>
          <button onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More Events'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Landing; 
