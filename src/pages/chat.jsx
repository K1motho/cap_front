import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const friend = location.state?.chatWith;

  const [friendName, setFriendName] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const myId = localStorage.getItem('userId');
  const chatId = myId && friend ? [myId, friend].sort().join('_') : null;

  useEffect(() => {
    async function fetchFriendName() {
      if (!friend) return;
      try {
        const friendDoc = await getDoc(doc(db, 'users', friend.toString()));
        setFriendName(friendDoc.exists() ? friendDoc.data().name || 'Friend' : 'Friend');
      } catch {
        setFriendName('Friend');
      }
    }
    fetchFriendName();
  }, [friend]);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, snapshot => {
      const newMessages = [];
      snapshot.docChanges().forEach(change => {
        const msg = { id: change.doc.id, ...change.doc.data() };

        if (change.type === 'added') {
          newMessages.push(msg);

          if (msg.receiver === Number(myId) && !msg.seen) {
            updateDoc(doc(db, 'chats', chatId, 'messages', msg.id), {
              seen: true,
            });
          }

          if (msg.receiver === Number(myId) && !msg.seen && !msg.deleted) {
            toast.info(`${friendName}: ${msg.content}`, {
              onClick: () => navigate('/chat', { state: { chatWith: friend } }),
              position: 'top-right',
              autoClose: 6000,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              style: { cursor: 'pointer' },
            });
          }
        }
      });

      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [chatId, friend, friendName, myId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatId || !myId || !friend) return;

    const message = {
      sender: Number(myId),
      receiver: Number(friend),
      content: input.trim(),
      timestamp: serverTimestamp(),
      deleted: false,
      seen: false,
      delivered: true,
    };

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), message);
      await addDoc(collection(db, 'notifications'), {
        userId: friend,
        text: `New message from ${myId}`,
        timestamp: serverTimestamp(),
        read: false,
        link: `/chat`,
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }

    setInput('');
  };

  const handleDelete = (msg) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>Delete this message?</p>
          <div style={{ marginTop: 8, display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                deleteMessage(msg);
                closeToast();
              }}
              style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: 4 }}
            >
              Yes
            </button>
            <button
              onClick={closeToast}
              style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#7f8c8d', color: 'white', border: 'none', borderRadius: 4 }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  const deleteMessage = async (msg) => {
    if (!chatId || !msg?.id) return;

    try {
      const msgDocRef = doc(db, 'chats', chatId, 'messages', msg.id);
      await updateDoc(msgDocRef, {
        content: 'This message was deleted.',
        deleted: true,
        timestamp: serverTimestamp(),
      });

      await addDoc(collection(db, 'notifications'), {
        userId: msg.receiver,
        text: `A message was deleted in your chat.`,
        timestamp: serverTimestamp(),
        read: false,
      });
    } catch {
      toast.error('Failed to delete message.');
    }
  };

  if (!friend) {
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
        <div style={{ color: '#fff', padding: 20 }}>No friend selected</div>
      </>
    );
  }

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
      <ToastContainer />
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
          }}
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
          }}
        >
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.sender === Number(myId) ? 'flex-end' : 'flex-start',
                marginBottom: 10,
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                if (msg.sender === Number(myId) && !msg.deleted) handleDelete(msg);
              }}
            >
              <div style={{ maxWidth: '75%', textAlign: msg.sender === Number(myId) ? 'right' : 'left' }}>
                <div
                  style={{
                    backgroundColor: msg.sender === Number(myId) ? '#00cec9' : '#636e72',
                    color: msg.sender === Number(myId) ? '#23272a' : '#dfe6e9',
                    padding: '10px 18px',
                    borderRadius: '20px',
                    wordBreak: 'break-word',
                    fontStyle: msg.deleted ? 'italic' : 'normal',
                    opacity: msg.deleted ? 0.7 : 1,
                  }}
                >
                  {msg.content}
                </div>
                {msg.sender === Number(myId) && !msg.deleted && (
                  <small style={{ fontSize: '0.75rem', color: '#bbb', marginTop: 2, display: 'block' }}>
                    {msg.seen ? 'Seen' : 'Delivered'}
                  </small>
                )}
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
            }}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default Chat;
