import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { toPng } from 'html-to-image';

const Payment = () => {
  const { id, method } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [event, setEvent] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [showQR, setShowQR] = useState(false);

  const qrRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`https://app.ticketmaster.com/discovery/v2/events/${id}.json`, {
          params: { apikey: import.meta.env.VITE_TICKET_KEY },
        });

        const ticketPrice = res.data?.priceRanges?.[0]?.min || 100;
        setEvent({ ...res.data, price: ticketPrice });
      } catch (err) {
        console.error('Failed to fetch event:', err);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg('');
    setShowQR(false);

    try {
      let payload = {
        eventId: id,
        name,
        paymentMethod: method,
        amount: event?.price || 1000,
      };

      if (method === 'mpesa') {
        const cleanedPhone = phone.trim().replace(/^(\+254|254|0)/, '254');
        payload.phone = cleanedPhone;
      } else if (method === 'card') {
        payload.cardNumber = cardNumber;
        payload.expiry = expiry;
        payload.cvv = cvv;
      }

      const token = localStorage.getItem('access_token');

      // Initiate payment request
      const response = await fetch(`${backendUrl}/api/payments/initiate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => null);
      if (!response.ok) {
        let message = 'Payment failed.';
        if (responseData) {
          message = responseData.message || JSON.stringify(responseData) || message;
        }
        throw new Error(message);
      }

      // Payment success - add attended event
      if (token && event) {
        const attendedPayload = {
          event_id: id,
          title: event.name,
          date: event.dates?.start?.localDate || '',
          image_url: event.images?.[0]?.url || '',
        };

        try {
          await axios.post(
            `${backendUrl}/api/attended-events/`,
            attendedPayload,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } catch (attendedErr) {
          console.error('Failed to save attended event:', attendedErr);
          // Optionally handle this error (show warning) but do not block user
        }
      }

      setSuccessMsg('Payment successful!');
      setShowQR(true);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Error processing payment.');
    } finally {
      setLoading(false);
    }
  };

  const qrValue = event
    ? `Event: ${event.name}\nDate: ${event.dates?.start?.localDate}\nTime: ${event.dates?.start?.localTime}\nVenue: ${event._embedded?.venues?.[0]?.name}\nName: ${name}`
    : '';

  const handleDownloadQR = async () => {
    if (qrRef.current === null) return;

    try {
      const dataUrl = await toPng(qrRef.current);
      const link = document.createElement('a');
      link.download = 'qr_code.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
  };

  return (
    <>
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: #1a001a;
        }
        *, *::before, *::after {
          box-sizing: border-box;
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          height: '100%',
          backgroundColor: '#1a001a',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '40px 20px',
          color: '#fff',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            backgroundColor: '#121212',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(255, 0, 120, 0.4)',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              marginBottom: '20px',
              background: '#ff4c98',
              color: '#fff',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ← Back
          </button>

          <h2 style={{ marginBottom: '10px' }}>
            Payment for: {event?.name || 'Loading...'}
          </h2>
          <p><strong>Payment Method:</strong> {method.toUpperCase()}</p>
          <p><strong>Amount:</strong> KES {event?.price || 100}</p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              marginTop: '20px',
            }}
          >
            <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
              Full Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #555',
                  marginTop: '5px',
                  backgroundColor: '#222',
                  color: '#fff',
                }}
              />
            </label>

            {method === 'mpesa' && (
              <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
                Phone Number:
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+2547XXXXXXXX"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #555',
                    marginTop: '5px',
                    backgroundColor: '#222',
                    color: '#fff',
                  }}
                />
              </label>
            )}

            {method === 'card' && (
              <>
                <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
                  Card Number:
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #555',
                      marginTop: '5px',
                      backgroundColor: '#222',
                      color: '#fff',
                    }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
                  Expiry Date:
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #555',
                      marginTop: '5px',
                      backgroundColor: '#222',
                      color: '#fff',
                    }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
                  CVV:
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #555',
                      marginTop: '5px',
                      backgroundColor: '#222',
                      color: '#fff',
                    }}
                  />
                </label>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                backgroundColor: '#1cd12e',
                color: '#121212',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '10px',
              }}
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </form>

          {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
          {successMsg && <p style={{ color: 'lightgreen', marginTop: '15px' }}>{successMsg}</p>}

          {showQR && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <h3>QR Code (Proof of Payment)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div
                  ref={qrRef}
                  style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    display: 'inline-block',
                  }}
                >
                  <QRCode value={qrValue} size={200} />
                </div>
                <button
                  onClick={handleDownloadQR}
                  style={{
                    background: '#5f1d78',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Download QR Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Payment;
