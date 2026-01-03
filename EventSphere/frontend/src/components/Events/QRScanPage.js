import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const MyQRs = () => {
  const [rsvps, setRsvps] = useState([]);
  const [qrCodes, setQrCodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user);
    
    const fetchConfirmedRsvps = async () => {
      if (!user) {
        setError("Please log in to view your QR codes");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(`${API_URL}/rsvps/my`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const confirmed = data.rsvps.filter(
          (r) => r.status === "going" && r.event
        );
        
        setRsvps(confirmed);

        const codes = {};
        for (const rsvp of confirmed) {
          const payload = {
            attendeeEmail: user.email,
            eventId: rsvp.event._id,
            eventName: rsvp.event.title,
            eventDate: rsvp.event.date,
            attendeeName: rsvp.attendeeName || user.name || "Guest",
            rsvpId: rsvp._id,
            rsvpStatus: rsvp.status,
          };
          
          const qr = await QRCode.toDataURL(JSON.stringify(payload), {
            width: 250,
            margin: 2,
            color: { dark: "#1e40af", light: "#ffffff" }
          });
          codes[rsvp._id] = qr;
        }
        setQrCodes(codes);
      } catch (err) {
        console.error("Error fetching RSVPs:", err);
        setError("Failed to load your RSVPs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmedRsvps();
  }, []);

  const handleDownloadQR = (rsvpId, eventTitle) => {
    const link = document.createElement('a');
    link.href = qrCodes[rsvpId];
    link.download = `QR-${eventTitle.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareWhatsApp = (rsvpId, eventTitle) => {
    const qrDataUrl = qrCodes[rsvpId];
    const text = `🎫 My QR code for ${eventTitle}:\n${qrDataUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleBackToDashboard = () => navigate("/dashboard");
  const formatDate = (dateString) => {
    if (!dateString) return "Date not specified";
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getAttendeeName = (rsvp) => {
    if (rsvp.attendeeName && rsvp.attendeeName !== "Guest") return rsvp.attendeeName;
    if (rsvp.user && rsvp.user.name) return rsvp.user.name;
    if (currentUser && currentUser.name) return currentUser.name;
    return "Guest";
  };

  if (loading) return <p>Loading QR codes...</p>;

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <button 
          onClick={handleBackToDashboard} 
          style={{
            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
            background: '#3b82f6', color: 'white', cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <h1 style={{ margin: 0, color: '#1e40af' }}>My Event QR Codes</h1>
      </div>

      {error && <p style={{color:'red'}}>{error}</p>}

      {rsvps.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <h3>No tickets yet</h3>
          <p>You haven't confirmed any events.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {rsvps.map((rsvp) => {
            const attendeeName = getAttendeeName(rsvp);
            return (
              <div key={rsvp._id} style={{
                background: 'white', borderRadius: '16px', padding: '1rem',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)', textAlign: 'center',
                transition: 'transform 0.3s', cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-5px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
              >
                <h3 style={{color:'#1e40af'}}>{rsvp.event.title}</h3>
                <p>📅 {formatDate(rsvp.event.date)}</p>
                <p>👤 {attendeeName}</p>

                <div style={{
                  width:'220px', height:'220px', margin:'1rem auto',
                  borderRadius:'12px', overflow:'hidden', border:'2px solid #3b82f6',
                  background:'white', display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                  {qrCodes[rsvp._id] && <img src={qrCodes[rsvp._id]} alt="QR Code" style={{width:'100%', height:'100%', objectFit:'contain'}} />}
                </div>

                <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem', marginTop:'1rem' }}>
                  <button 
                    onClick={() => handleDownloadQR(rsvp._id, rsvp.event.title)}
                    style={{
                      flex:1, padding:'0.5rem', borderRadius:'8px', border:'none',
                      background:'#10b981', color:'white', cursor:'pointer', fontWeight:'600'
                    }}
                  >
                    ⬇ Download
                  </button>

                  <button 
                    onClick={() => handleShareWhatsApp(rsvp._id, rsvp.event.title)}
                    style={{
                      flex:1, padding:'0.5rem', borderRadius:'8px', border:'none',
                      background:'#25D366', color:'white', cursor:'pointer', fontWeight:'600'
                    }}
                  >
                    💬 WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyQRs;
