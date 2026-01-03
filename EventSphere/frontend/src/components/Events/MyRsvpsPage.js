import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MyRsvpsPage = () => {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState({ visible: false, url: '', label: '' });
  const navigate = useNavigate();

  const fetchRsvps = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to view your RSVPs.');
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/rsvps/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to load RSVPs');
        return;
      }
      setRsvps(data.rsvps || []);
    } catch (err) {
      console.error('Error loading RSVPs', err);
      alert('Failed to load RSVPs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRsvps(); }, []);

  const handleCancelRsvp = async (rsvpId, eventId) => {
    if (!window.confirm('Are you sure you want to cancel this RSVP?')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/rsvps/event/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to cancel RSVP');
        return;
      }

      alert('RSVP cancelled successfully');
      fetchRsvps(); // Refresh the list
    } catch (err) {
      console.error('Error cancelling RSVP', err);
      alert('Failed to cancel RSVP. Please try again.');
    }
  };

  const makeQr = async (rsvp) => {
    try {
      const payload = {
        eventId: rsvp.event?._id,
        eventTitle: rsvp.event?.title || 'Event',
        eventDate: rsvp.event?.date || '',
        attendeeName: rsvp.user?.name || 'Guest',
        attendeeEmail: rsvp.user?.email || 'unknown',
        rsvpId: rsvp._id,
        rsvpStatus: rsvp.status || 'going',
        timestamp: new Date().toISOString(),
      };
      const url = await QRCode.toDataURL(JSON.stringify(payload), { width: 220, margin: 2 });
      setQrData({ visible: true, url, label: payload.eventTitle });
    } catch (err) {
      console.error('QR generation error', err);
      alert('Failed to generate QR. Please try again.');
    }
  };

  const shareWhatsApp = () => {
    if (!qrData.url) return;
    const text = `🎫 My QR code for ${qrData.label}:\n${qrData.url}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '2rem 1rem', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h2 style={{ textAlign: 'center', color: '#1e40af', fontSize: '2rem', marginBottom: '2rem' }}>🎫 My RSVPs</h2>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#6b7280' }}>Loading...</p>
      ) : rsvps.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#6b7280' }}>No RSVPs yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {rsvps.map(rsvp => {
            const eventTitle = rsvp.event?.title || 'Event';
            const eventDate = rsvp.event?.date ? new Date(rsvp.event.date).toLocaleDateString() : '';
            const statusColors = {
              going: { bg: '#d1fae5', text: '#065f46', label: '✅ Confirmed' },
              not_going: { bg: '#fee2e2', text: '#b91c1c', label: '❌ Cancelled' },
              interested: { bg: '#fef3c7', text: '#78350f', label: '👀 Interested' },
            };
            const status = statusColors[rsvp.status] || { bg: '#e5e7eb', text: '#374151', label: rsvp.status };

            return (
              <div key={rsvp._id} style={{
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                padding: '1rem',
                textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h3 style={{ color: '#1e40af', marginBottom: '0.25rem' }}>{eventTitle}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '0.5rem' }}>{eventDate}</p>
                <span style={{
                  display: 'inline-block',
                  background: status.bg,
                  color: status.text,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}>{status.label}</span>

                <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem', marginTop:'0.5rem' }}>
                  <button
                    onClick={() => makeQr(rsvp)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#2563eb',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 600,
                      flex: 1
                    }}
                  >
                    Show QR
                  </button>
                  <button
                    onClick={() => handleCancelRsvp(rsvp._id, rsvp.event?._id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ef4444',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 600,
                      flex: 1
                    }}
                  >
                    Cancel RSVP
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {qrData.visible && (
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          background: '#fff',
          padding: '1rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          maxWidth: '250px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <h4 style={{ color: '#1e40af', marginBottom: '0.5rem' }}>{qrData.label}</h4>
          <img src={qrData.url} alt="QR Code" style={{ width: '200px', height: '200px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
          <p style={{ fontSize: '12px', color: '#555', marginTop: '0.5rem' }}>Present this QR at check-in.</p>

          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'0.5rem', gap:'0.5rem' }}>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = qrData.url;
                link.download = `QR-${qrData.label.replace(/\s+/g, '-')}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              style={{
                flex:1, padding:'6px 12px', borderRadius:'8px', border:'none',
                background:'#10b981', color:'#fff', cursor:'pointer', fontWeight:'600'
              }}
            >
              ⬇ Download
            </button>

            <button
              onClick={shareWhatsApp}
              style={{
                flex:1, padding:'6px 12px', borderRadius:'8px', border:'none',
                background:'#25D366', color:'#fff', cursor:'pointer', fontWeight:'600'
              }}
            >
              💬 WhatsApp
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '6px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'green',
            color: '#fff',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default MyRsvpsPage;
