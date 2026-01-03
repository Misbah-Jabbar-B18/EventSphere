import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrganizerEventRSVPStats.css';

// Backend API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const OrganizerEventRSVPStats = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('currentUser'));
    const token = localStorage.getItem('token');
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/events?all=true`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error('Failed to load organizer events for stats', data);
          setEvents([]);
          return;
        }
        const allEvents = data.events || [];
        // Only show events created by this organizer (match MongoDB organizer id)
        const myEvents = allEvents.filter(
          (e) => String(e.organizer?._id || e.organizer) === String(userInfo?.id)
        );
        setEvents(myEvents);
      } catch (err) {
        console.error('Error loading organizer events for stats', err);
        setEvents([]);
      }
    };

    const fetchRsvps = async () => {
      try {
        const res = await fetch(`${API_URL}/rsvps/organizer`, { headers: authHeaders });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error('Failed to load RSVPs for organizer stats', data);
          setRsvps([]);
          return;
        }
        setRsvps(data.rsvps || []);
      } catch (err) {
        console.error('Error loading RSVPs for organizer stats', err);
        setRsvps([]);
      }
    };

    fetchEvents();
    fetchRsvps();

    const interval = setInterval(() => {
      fetchRsvps();
      fetchEvents();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getEventRSVPs = (eventId) => {
    return rsvps.filter(
      (rsvp) =>
        String(rsvp.event?._id || rsvp.eventId) === String(eventId) &&
        (rsvp.rsvpStatus === 'confirmed' || rsvp.status === 'going')
    );
  };
  const getEventRSVPCancelled = (eventId) => {
    return rsvps.filter(
      (rsvp) =>
        String(rsvp.event?._id || rsvp.eventId) === String(eventId) &&
        (rsvp.rsvpStatus === 'cancelled' || rsvp.status === 'not_going')
    );
  };

  return (
    <div className="organizer-rsvp-stats">
      <h3>RSVP Stats (Real-time)</h3>
      {events.length === 0 ? (
        <p>No events created yet.</p>
      ) : (
        <div className="rsvp-events-list">
          {events.map(event => {
            const eventId = event._id || event.id;
            const confirmed = getEventRSVPs(eventId);
            const cancelled = getEventRSVPCancelled(eventId);
            return (
              <div key={eventId} className="rsvp-event-card">
                <div className="rsvp-event-header" onClick={() => setExpandedEventId(expandedEventId === eventId ? null : eventId)}>
                  <div>
                    <strong>{event.title}</strong> <span className="rsvp-event-date">({event.date})</span>
                  </div>
                  <div className="rsvp-counts">
                    <span className="rsvp-confirmed">✅ {confirmed.length}</span>
                    <span className="rsvp-cancelled">❌ {cancelled.length}</span>
                  </div>
                  <button className="expand-btn">{expandedEventId === event.id ? 'Hide' : 'Show'} Details</button>
                </div>
                {expandedEventId === event.id && (
                  <div className="rsvp-details">
                    <h4>Confirmed Attendees ({confirmed.length})</h4>
                    {confirmed.length === 0 ? <p>No confirmed RSVPs yet.</p> : (
                      <ul>
                        {confirmed.map((rsvp, idx) => {
                          const attendeeName = rsvp.user?.name || rsvp.attendeeName || 'Unknown';
                          const attendeeEmail = rsvp.user?.email || rsvp.attendeeEmail || 'No email';
                          return (
                            <li key={idx}>
                              <span className="attendee-name">{attendeeName}</span> (<span className="attendee-email">{attendeeEmail}</span>)
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <h4>Cancelled RSVPs ({cancelled.length})</h4>
                    {cancelled.length === 0 ? <p>No cancellations.</p> : (
                      <ul>
                        {cancelled.map((rsvp, idx) => {
                          const attendeeName = rsvp.user?.name || rsvp.attendeeName || 'Unknown';
                          const attendeeEmail = rsvp.user?.email || rsvp.attendeeEmail || 'No email';
                          return (
                            <li key={idx}>
                              <span className="attendee-name">{attendeeName}</span> (<span className="attendee-email">{attendeeEmail}</span>)
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
                <button 
                  className="scan-qr-btn" 
                  onClick={() => navigate(`/scan-qr/${eventId}`)}
                  style={{
                    marginTop: '1rem',
                    padding: '8px 16px',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  📷 Scan QR
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrganizerEventRSVPStats; 