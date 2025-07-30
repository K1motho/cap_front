import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FriendsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendEvents, setFriendEvents] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [errorFriends, setErrorFriends] = useState(null);
  const [errorEvents, setErrorEvents] = useState(null);
  const [requested, setRequested] = useState([]); // IDs of users with pending friend requests sent by current user

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  // Fetch pending friend requests sent by this user on component mount
  useEffect(() => {
    if (!token) return;

    const fetchPendingRequests = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/friend-requests/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const tokenData = JSON.parse(atob(token.split(".")[1]));
        const currentUserId = tokenData.user_id;

        // Filter requests where current user is sender, map to receiver IDs
        const sentRequests = res.data
          .filter((req) => req.sender.id === currentUserId && req.status === "pending")
          .map((req) => req.receiver.id);

        setRequested(sentRequests);
      } catch (err) {
        console.error("Failed to fetch pending friend requests", err.response?.data || err.message);
      }
    };

    fetchPendingRequests();
  }, [token, API_BASE]);

  // Fetch users matching search term
  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await axios.get(`${API_BASE}/api/users/search/`, {
          params: { q: searchTerm },
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(Array.isArray(res.data) ? res.data : []);
        setErrorUsers(null);
      } catch {
        setErrorUsers("Failed to load users");
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (searchTerm.trim().length > 0) {
      fetchUsers();
    } else {
      setUsers([]);
      setLoadingUsers(false);
      setErrorUsers(null);
    }
  }, [searchTerm, token, API_BASE]);

  // Fetch current friends
  useEffect(() => {
    if (!token) return;

    const fetchFriends = async () => {
      setLoadingFriends(true);
      try {
        const res = await axios.get(`${API_BASE}/api/friends/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(Array.isArray(res.data) ? res.data : []);
        setErrorFriends(null);
      } catch {
        setErrorFriends("Failed to load friends");
        setFriends([]);
      } finally {
        setLoadingFriends(false);
      }
    };
    fetchFriends();
    //auto refresh
  const interval = setInterval(() => {
     fetchFriends();
      }, 30000000);

      return()=> clearInterval(interval);

    
  }, [token, API_BASE]);

  

  // Fetch friend events
  useEffect(() => {
    if (!token) return;

    const fetchFriendEvents = async () => {
      setLoadingEvents(true);
      try {
        const res = await axios.get(`${API_BASE}/api/friend-events/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriendEvents(Array.isArray(res.data) ? res.data : []);
        setErrorEvents(null);
      } catch {
        setErrorEvents("Failed to load friend events");
        setFriendEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchFriendEvents();
  }, [token, API_BASE]);

  // Remove a friend
  const handleUnfriend = async (friendId) => {
    try {
      await axios.delete(`${API_BASE}/api/friends/${friendId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Friend removed");
      const res = await axios.get(`${API_BASE}/api/friends/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to remove friend");
    }
  };

  // Send or cancel friend request
  const handleFriendRequest = async (userId) => {
    if (requested.includes(userId)) {
      // Cancel existing friend request
      try {
        await axios.delete(`${API_BASE}/api/friend-requests/${userId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequested((prev) => prev.filter((id) => id !== userId));
        toast.info("Friend request canceled");
      } catch {
        toast.error("Failed to cancel request");
      }
    } else {
      // Send new friend request
      try {
        await axios.post(
          `${API_BASE}/api/friend-requests/`,
          {
            receiver: userId, // only send receiver, sender taken from backend auth
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRequested((prev) => [...prev, userId]);
        toast.success("Friend request sent 🎉");
      } catch (err) {
        console.error("Failed to send friend request:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        toast.error("Failed to send friend request ❌");
      }
    }
  };

  const handleChat = (friendId) => {
    navigate("/chat", { state: { chatWith: friendId } });
  };

  const isFriend = (userId) => friends.some((friend) => friend.id === userId);

  return (
    <>
      {/* Embedded global style for full height and reset */}
      <style>
        {`
          html, body, #root {
            margin: 0;
            padding: 0;
            height: 100%;
            background-color: #f0f6f0;
            font-family: 'Segoe UI', sans-serif;
            color: #2d4a2d;
          }
        `}
      </style>

      <div style={{ padding: "20px", minHeight: "100vh" }}>
        <input
          type="search"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            marginBottom: "24px",
            borderRadius: "8px",
            border: "2px solid #4caf50",
            fontSize: "16px",
          }}
        />

        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
          {/* Users */}
          <section
            style={{
              flex: "1 1 300px",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 14px rgba(76,175,80,0.2)",
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            <h2 style={{ color: "#388e3c", marginBottom: "16px" }}>Users</h2>
            {loadingUsers ? (
              <p>Loading users...</p>
            ) : errorUsers ? (
              <p style={{ color: "#d32f2f" }}>{errorUsers}</p>
            ) : users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #c8e6c9",
                    color: "#2e7d32",
                  }}
                >
                  <strong>{user.name || user.username}</strong>
                  <br />
                  <small>{user.email}</small>
                  {!isFriend(user.id) && (
                    <div style={{ marginTop: "8px" }}>
                      <button
                        onClick={() => handleFriendRequest(user.id)}
                        style={{
                          backgroundColor: requested.includes(user.id)
                            ? "#e53935"
                            : "#2196f3",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          marginTop: "6px",
                        }}
                      >
                        {requested.includes(user.id)
                          ? "Cancel Request"
                          : "Request Friend"}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </section>

          {/* Friends */}
          <section
            style={{
              flex: "1 1 300px",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 14px rgba(76,175,80,0.2)",
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            <h2 style={{ color: "#388e3c", marginBottom: "16px" }}>Friends</h2>
            {loadingFriends ? (
              <p>Loading friends...</p>
            ) : errorFriends ? (
              <p style={{ color: "#d32f2f" }}>{errorFriends}</p>
            ) : friends.length === 0 ? (
              <p>No friends found.</p>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    borderBottom: "1px solid #c8e6c9",
                    color: "#2e7d32",
                  }}
                >
                  <span>{friend.name || friend.username}</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleChat(friend.id)}
                      style={{
                        backgroundColor: "#4caf50",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => handleUnfriend(friend.id)}
                      style={{
                        backgroundColor: "#e53935",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Unfriend
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Friend Events */}
          <section
            style={{
              flex: "1 1 300px",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 14px rgba(76,175,80,0.2)",
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            <h2 style={{ color: "#388e3c", marginBottom: "16px" }}>
              Friend Events
            </h2>
            {loadingEvents ? (
              <p>Loading friend events...</p>
            ) : errorEvents ? (
              <p style={{ color: "#d32f2f" }}>{errorEvents}</p>
            ) : friendEvents.length === 0 ? (
              <p>No events to show.</p>
            ) : (
              friendEvents.map((event) => (
                <div
                  key={event.id}
                  style={{
                    borderBottom: "1px solid #c8e6c9",
                    padding: "10px 0",
                    color: "#2e7d32",
                  }}
                >
                  <strong>{event.name}</strong>
                  <p style={{ margin: 0, fontSize: "14px" }}>
                    {event.date} at {event.venue}
                  </p>
                </div>
              ))
            )}
          </section>
        </div>

        <ToastContainer />
      </div>
    </>
  );
};

export default FriendsPage;
