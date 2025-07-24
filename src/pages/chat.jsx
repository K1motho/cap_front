import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils'; // assuming axios is configured with baseURL from .env

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const friend = location.state?.chatWith;

  const [friendName, setFriendName] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('access_token');
  const myId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchFriendAndMessages = async () => {
      if (!token || !friend) return;

      try {
        // Fetch friend name
        const friendRes = await axios.get(`/api/friends/${friend}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriendName(friendRes.data.name || 'Friend');

        // Fetch message history
        const msgRes = await axios.get(`/api/messages/${friend}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(msgRes.data)) {
          setMessages(msgRes.data);
        } else {
          console.warn('Invalid messages response:', msgRes.data);
          setMessages([]);
        }
      } catch (err) {
        console.error('Failed to fetch chat data:', err);
        setFriendName('Friend');
        setMessages([]);
      }
    };

    fetchFriendAndMessages();
  }, [friend, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!friend) {
    return (
      <div
        style={{
          padding: 20,
          maxWidth: 600,
          margin: 'auto',
          fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
          color: '#eee',
          backgroundColor: '#2c2f33',
          borderRadius: 12,
          textAlign: 'center',
          marginTop: 50,
        }}
      >
        <p>No friend selected.</p>
        <button
          onClick={() => navigate('/friendprofile')}
          style={{
            marginTop: 15,
            padding: '10px 20px',
            backgroundColor: '#7289da',
            border: 'none',
            borderRadius: 8,
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#5b6eae')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#7289da')}
        >
          Go to Friend Profile
        </button>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const messageToSend = {
      sender: myId,
      receiver: friend,
      content: input.trim(),
    };

    try {
      const res = await axios.post('/api/messages/', messageToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to send message:', err);
    }

    setInput('');
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '40px auto',
        padding: 20,
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        backgroundColor: '#23272a',
        borderRadius: 12,
        color: '#ddd',
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
      }}
    >
      <button
        onClick={() => navigate('/friendprofile')}
        style={{
          alignSelf: 'flex-start',
          marginBottom: 20,
          backgroundColor: '#99aab5',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 8,
          color: '#23272a',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#7f8c8d')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#99aab5')}
      >
        ← Back to Friend Profile
      </button>

      <h2 style={{ marginBottom: 15, color: '#00b894' }}>
        Chatting with {friendName}
      </h2>

      <div
        style={{
          flexGrow: 1,
          borderRadius: 12,
          backgroundColor: '#2c2f33',
          padding: 15,
          overflowY: 'auto',
          marginBottom: 15,
          boxShadow: 'inset 0 0 10px #00000088',
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.sender === Number(myId) ? 'flex-end' : 'flex-start',
              marginBottom: 10,
            }}
          >
            <div
              style={{
                backgroundColor: msg.sender === Number(myId) ? '#00cec9' : '#636e72',
                color: msg.sender === Number(myId) ? '#23272a' : '#dfe6e9',
                padding: '10px 18px',
                borderRadius: '20px',
                maxWidth: '70%',
                wordBreak: 'break-word',
                boxShadow:
                  msg.sender === Number(myId)
                    ? '0 2px 8px #00cec9aa'
                    : '0 2px 8px #636e7288',
                fontSize: '1rem',
                lineHeight: '1.3',
                userSelect: 'text',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          placeholder="Type a message"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          style={{
            flex: 1,
            padding: '14px 18px',
            borderRadius: 25,
            border: 'none',
            fontSize: '1rem',
            outline: 'none',
            boxShadow: '0 0 8px #00cec9aa',
            backgroundColor: '#2c2f33',
            color: '#dfe6e9',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            backgroundColor: input.trim() ? '#00cec9' : '#636e72',
            color: '#23272a',
            border: 'none',
            borderRadius: 25,
            padding: '14px 24px',
            fontWeight: '700',
            cursor: input.trim() ? 'pointer' : 'default',
            transition: 'background-color 0.3s',
            boxShadow: input.trim() ? '0 0 12px #00cec9cc' : 'none',
            userSelect: 'none',
          }}
          onMouseEnter={e => {
            if (input.trim()) e.currentTarget.style.backgroundColor = '#00b894';
          }}
          onMouseLeave={e => {
            if (input.trim()) e.currentTarget.style.backgroundColor = '#00cec9';
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
