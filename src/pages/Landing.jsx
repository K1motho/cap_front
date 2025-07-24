import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

const Testing = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState("");
  const [keyword, setKeyword] = useState("music");
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  const fetchEvents = async (pageNumber = 0, isNewSearch = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        "https://app.ticketmaster.com/discovery/v2/events.json",
        {
          params: {
            apikey: import.meta.env.VITE_TICKET_KEY,
            keyword,
            city: location,
            page: pageNumber,
            size: ITEMS_PER_PAGE,
            sort: "date,asc",
          },
        }
      );

      const newEvents = res.data._embedded?.events || [];
      if (isNewSearch || pageNumber === 0) {
        setEvents(newEvents);
      } else {
        setEvents((prev) => [...prev, ...newEvents]);
      }

      const totalPages = res.data.page.totalPages;
      setHasMore(pageNumber + 1 < totalPages);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
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
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id
          ? { ...event, showFullDesc: !event.showFullDesc }
          : event
      )
    );
  };

  const handleNavigate = (e, id) => {
    e.stopPropagation(); // prevent bubbling to parent div's onClick
    navigate(`/event/${id}`);
  };

  return (
    <>
      {/* Global CSS Reset */}
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background-color: #0a0a0a;
          font-family: 'Poppins', sans-serif;
          color: #f3f3f3;
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

      <div style={{ backgroundColor: "#0a0a0a", color: "#f3f3f3", minHeight: "100vh", padding: "20px" }}>
        {/* Hero Section */}
        <section
          style={{
            maxWidth: "1000px",
            margin: "40px auto",
            padding: "40px 20px",
            background: "linear-gradient(135deg, #030303, #3a003f, #1a002b)",
            color: "#dedcf5",
            textAlign: "center",
            borderRadius: "16px",
            animation: "gradientShift 20s ease infinite",
            backgroundSize: "600% 600%",
            boxShadow: "0 0 30px rgba(255,0,120,0.5)",
          }}
        >
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "20px" }}>
            Welcome to Wapi Na Lini
          </h1>
          <p style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto", color: "#ddd" }}>
            Discover amazing events happening near you. Search by city or keyword and find your next adventure!
          </p>
        </section>

        {/* Search Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter city"
            style={{
              padding: "12px",
              backgroundColor: "#3a003f",
              border: "none",
              borderRadius: "8px",
              color: "white",
              width: "200px",
            }}
          />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter keyword"
            style={{
              padding: "12px",
              backgroundColor: "#3a003f",
              border: "none",
              borderRadius: "8px",
              color: "white",
              width: "200px",
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "12px 24px",
              backgroundColor: "#c9004d",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>

        {/* Events Grid */}
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {loading && events.length === 0 && <p>Loading events...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && events.length === 0 && <p>No upcoming events found.</p>}

          {events.map((event) => {
            const desc = event.info || event.description || "No description available.";
            const showFullDesc = event.showFullDesc || false;
            const displayedDesc = showFullDesc ? desc : desc.substring(0, 200);
            const status = event.dates?.status?.code || "TBA";
            const isOnSale = status.toLowerCase() === "onsale";

            return (
              <div
                key={event.id}
                style={{
                  backgroundColor: "#1a1a1a",
                  border: "2px solid #5f1d78",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={() => navigate(`/event/${event.id}`)}
              >
                <img
                  src={event.images?.[0]?.url || "https://via.placeholder.com/800x300?text=No+Image"}
                  alt={event.name}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "10px",
                  }}
                />
                {/* Make title clickable */}
                <h2
                  onClick={(e) => handleNavigate(e, event.id)}
                  style={{
                    fontSize: "1.5rem",
                    color: "#ff4c98",
                    marginBottom: "10px",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNavigate(e, event.id);
                  }}
                >
                  {event.name}
                </h2>
                <p style={{ fontStyle: "italic", color: "#ccc" }}>
                  {displayedDesc}
                  {desc.length > 200 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDescription(event.id);
                      }}
                      style={{
                        marginLeft: "8px",
                        background: "none",
                        border: "none",
                        color: "#a85fff",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      {showFullDesc ? "Show Less" : "Read More"}
                    </button>
                  )}
                </p>
                <p><strong>Date:</strong> {new Date(event.dates?.start?.localDate).toLocaleString()}</p>
                <p><strong>Venue:</strong> {event._embedded?.venues?.[0]?.name || "TBA"}</p>
                <p><strong>Location:</strong> {event._embedded?.venues?.[0]?.city?.name || "Unknown"}, {event._embedded?.venues?.[0]?.country?.name || ""}</p>
                {/* Make status clickable */}
                <div
                  onClick={(e) => handleNavigate(e, event.id)}
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    marginTop: "10px",
                    border: `2px solid ${isOnSale ? "#00ffb3" : "#ff073a"}`,
                    color: isOnSale ? "#00ffb3" : "#ff073a",
                    fontWeight: "bold",
                    borderRadius: "999px",
                    fontSize: "0.9rem",
                    backgroundColor: "#121212",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNavigate(e, event.id);
                  }}
                >
                  {status.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button
              onClick={handleLoadMore}
              disabled={loading}
              style={{
                padding: "14px 32px",
                fontSize: "1rem",
                backgroundColor: "#5f1d78",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Loading..." : "Load More Events"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Testing;
