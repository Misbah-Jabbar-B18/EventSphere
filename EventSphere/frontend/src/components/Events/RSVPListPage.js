import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EventList.css';

// Backend API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RSVPListPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_URL}/events/${id}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error('Failed to load event for RSVP list', data);
          setEvent(null);
          return;
        }
        setEvent(data.event);
      } catch (err) {
        console.error('Error loading event for RSVP list', err);
        setEvent(null);
      }
    };

    const fetchRsvps = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No token found for RSVP list; cannot load RSVPs from backend');
          setRsvps([]);
          return;
        }

        const res = await fetch(`${API_URL}/rsvps/event/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error('Failed to load RSVPs from backend', data);
          setRsvps([]);
          return;
        }
        // Backend returns { rsvps: [...] }
        setRsvps(data.rsvps || []);
      } catch (err) {
        console.error('Error loading RSVPs from backend', err);
        setRsvps([]);
      }
    };

    if (id) {
      fetchEvent();
      fetchRsvps();
    }
  }, [id]);

  // Filtered by search
  const filtered = useMemo(() => {
    if (!search) return rsvps;
    return rsvps.filter((rsvp) =>
      (rsvp.user?.name || rsvp.attendeeName || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (rsvp.user?.email || rsvp.attendeeEmail || '')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [rsvps, search]);

  if (!event) return <div style={{padding:'2rem'}}>Event not found.</div>;

  return (
    <div className="rsvp-list-page" style={{minHeight:'100vh',background:'#f8fafc',padding:'2rem 0'}}>
      <div className="modal-content" style={{maxWidth:'600px',margin:'2rem auto',maxHeight:'90vh',overflowY:'auto'}}>
        <h2 style={{textAlign:'center',color:'#2563eb'}}>RSVP List for: {event.title}</h2>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{width:'100%',marginBottom:'1rem',padding:'0.5rem',borderRadius:'8px',border:'1.5px solid #cbd5e1'}}
        />
        <table className="rsvp-table" style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>RSVP Status</th>
              <th>Check-in Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} style={{textAlign:'center',color:'#888'}}>No guests found.</td></tr>
            ) : filtered.map((rsvp, idx) => (
              <tr key={idx}>
                <td>{rsvp.user?.name || rsvp.attendeeName || '-'}</td>
                <td>{rsvp.user?.email || rsvp.attendeeEmail || '-'}</td>
                <td>
                  {rsvp.rsvpStatus === 'confirmed' || rsvp.status === 'going' ? (
                    <span style={{color:'#10b981',fontWeight:600}}>Confirmed</span>
                  ) : rsvp.rsvpStatus === 'cancelled' || rsvp.status === 'not_going' ? (
                    <span style={{color:'#dc2626',fontWeight:600}}>Cancelled</span>
                  ) : (
                    <span style={{color:'#6b7280',fontWeight:600}}>Pending</span>
                  )}
                </td>
                <td>
                  {rsvp.checkedIn ? (
                    <span style={{color:'#2563eb',fontWeight:600}}>Checked-in</span>
                  ) : (
                    <span style={{color:'#6b7280'}}>Not checked-in</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:'1.5rem'}}>
          <button className="guests-btn" onClick={() => navigate(-1)}>Back</button>
          <button
            className="guests-btn"
            onClick={() => navigate(`/event/${id}/scan`)}
          >
            📷 Open QR Scanner
          </button>
        </div>
      </div>
    </div>
  );
};

export default RSVPListPage; 