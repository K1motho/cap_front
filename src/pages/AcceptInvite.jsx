import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const AcceptInvite = () => {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("access_token");
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }

    const fetchInvite = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/invitations/${inviteId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setInviteData(res.data);
        setError(null);

        if (import.meta.env.DEV) {
          console.log("Invite fetched successfully:", res.data);
        }

      } catch (err) {
        let msg = "Invite not found or already responded to.";
        if (err.response) {
          if (err.response.status === 403) {
            msg = "You are not authorized to view this invite.";
          } else if (err.response.status === 401) {
            msg = "Your session expired. Please log in again.";
            navigate("/login", { state: { from: location }, replace: true });
            return;
          }
        }

        setError(msg);

        if (import.meta.env.DEV) {
          console.error("Invite fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token, navigate, location, inviteId, API_BASE]);

  const sendAction = async (action) => {
    setActionLoading(true);
    try {
      const res = await axios.patch(
        `${API_BASE}/api/invitations/${inviteId}/`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(action === "accept" ? "Invite accepted!" : "Invite ignored.");
      setError(null);
      setInviteData(res.data);

      if (import.meta.env.DEV) {
        console.log("Invite action response:", res.data);
      }

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      let msg = `Failed to ${action} invite.`;
      if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      }
      setError(msg);
      if (import.meta.env.DEV) {
        console.error("Invite action error:", err);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return <div style={{ padding: 30, fontSize: 18 }}>Loading invite...</div>;

  if (error)
    return (
      <div style={{ padding: 30, color: "red", fontWeight: "600", textAlign: "center" }}>
        {error}
      </div>
    );

  if (!inviteData)
    return (
      <div style={{ padding: 30, fontSize: 18, textAlign: "center" }}>
        No invite data found.
      </div>
    );

  return (
    <div
      style={{
        maxWidth: 460,
        margin: "40px auto",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 6px 14px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f9fdf9",
        color: "#2d4a2d",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: 16 }}>You have been invited!</h2>

      <p style={{ marginBottom: 20, fontSize: 16 }}>
        <strong>From:</strong> {inviteData.sender_name || "Unknown"}
      </p>

      <p style={{ marginBottom: 20, fontSize: 16 }}>
        <strong>Status:</strong> {inviteData.status || "Pending"}
      </p>

      {message && (
        <p
          style={{
            marginBottom: 20,
            fontWeight: "600",
            color: message.includes("accepted") ? "#388e3c" : "#d32f2f",
          }}
        >
          {message}
        </p>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
        <button
          onClick={() => sendAction("accept")}
          disabled={actionLoading}
          style={{
            padding: "10px 24px",
            backgroundColor: "#4caf50",
            border: "none",
            borderRadius: 8,
            color: "white",
            fontWeight: "700",
            cursor: actionLoading ? "not-allowed" : "pointer",
            opacity: actionLoading ? 0.7 : 1,
          }}
        >
          Accept
        </button>

        <button
          onClick={() => sendAction("ignore")}
          disabled={actionLoading}
          style={{
            padding: "10px 24px",
            backgroundColor: "#e53935",
            border: "none",
            borderRadius: 8,
            color: "white",
            fontWeight: "700",
            cursor: actionLoading ? "not-allowed" : "pointer",
            opacity: actionLoading ? 0.7 : 1,
          }}
        >
          Ignore
        </button>
      </div>
    </div>
  );
};

export default AcceptInvite;
