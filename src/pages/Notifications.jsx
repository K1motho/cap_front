import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom"; // ✅ added

const backendURL = import.meta.env.VITE_BACKEND_URL;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [processingIds, setProcessingIds] = useState([]);
  const token = localStorage.getItem("access_token");

  const navigate = useNavigate(); // ✅ added

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        console.warn("No token found in localStorage");
        toast.error("User not authenticated");
        return;
      }

      try {
        console.log("Fetching notifications...");
        const res = await axios.get(`${backendURL}/api/notifications/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Notifications fetched:", res.data);
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to load notifications:", err.response || err.message);
        toast.error(`Failed to load notifications: ${err.response?.data?.detail || err.message}`);
      }
    };

    fetchNotifications();
  }, [token]);

  const markAllAsRead = async () => {
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    try {
      console.log("Marking all notifications as read...");
      await axios.post(
        `${backendURL}/api/notifications/mark-all-read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all as read:", err.response || err.message);
      toast.error(`Failed to mark all as read: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleAccept = async (notif) => {
    if (processingIds.includes(notif.id)) return;
    setProcessingIds((prev) => [...prev, notif.id]);

    try {
      console.log("Accepting friend request from sender_id:", notif.sender_id);
      const res = await axios.post(
        `${backendURL}/api/friend-requests/accept/`,
        { sender_id: notif.sender_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Friend request accepted response:", res.data);
      toast.success("Friend request accepted");
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    } catch (err) {
      console.error("Failed to accept friend request:", err.response || err.message);
      toast.error(`Failed to accept friend request: ${err.response?.data?.detail || err.message}`);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== notif.id));
    }
  };

  const handleReject = async (notif) => {
    if (processingIds.includes(notif.id)) return;
    setProcessingIds((prev) => [...prev, notif.id]);

    try {
      console.log("Rejecting friend request from sender_id:", notif.sender_id);
      const res = await axios.post(
        `${backendURL}/api/friend-requests/reject/`,
        { sender_id: notif.sender_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Friend request rejected response:", res.data);
      toast.success("Friend request rejected");
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    } catch (err) {
      console.error("Failed to reject friend request:", err.response || err.message);
      toast.error(`Failed to reject friend request: ${err.response?.data?.detail || err.message}`);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== notif.id));
    }
  };

  return (
    <>
      <style>
        {`
          html, body, #root {
            margin: 0;
            padding: 0;
            height: 100%;
            background-color: #000;
            color: #fff;
            font-family: sans-serif;
          }
        `}
      </style>

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          padding: "20px",
          position: "relative", // ✅ needed for absolute positioning
        }}
      >
        {/* ✅ Top-right Button */}
        <button
          onClick={() => navigate("/friendprofile")}
          style={{
            position: "absolute",
            top: "20px",
            right: "60px",
            backgroundColor: "#ff4d6d",
            color: "#fff",
            padding: "10px 15px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          Friend Profile
        </button>

        <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>Notifications</h1>

        <button
          onClick={markAllAsRead}
          style={{
            backgroundColor: "#6c63ff",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            marginBottom: "20px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Mark All as Read
        </button>

        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                border: "1px solid #444",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
                backgroundColor: notif.is_read ? "#111" : "#222",
              }}
            >
              <p>{notif.content}</p>
              <small>{new Date(notif.timestamp).toLocaleString()}</small>
              {!notif.is_read && notif.type === "friend_request" && (
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => handleAccept(notif)}
                    style={{
                      backgroundColor: "#28a745",
                      color: "#fff",
                      padding: "8px 12px",
                      border: "none",
                      marginRight: "10px",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(notif)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      padding: "8px 12px",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        <ToastContainer />
      </div>
    </>
  );
};

export default Notifications;
