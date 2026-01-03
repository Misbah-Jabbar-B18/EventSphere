import React, { useState, useMemo } from 'react';
import './EventList.css';

const RSVPListModal = ({ event, onClose }) => {
  const [search, setSearch] = useState('');
  // Get all RSVPs for this event
  const rsvps = useMemo(() => {
    const all = JSON.parse(localStorage.getItem('rsvps')) || [];
    return all.filter(rsvp => rsvp.eventId === event.id);
  }, [event.id]);

  // Filtered by search
  const filtered = useMemo(() => {
    if (!search) return rsvps;
    return rsvps.filter(rsvp =>
      (rsvp.attendeeName || '').toLowerCase().includes(search.toLowerCase()) ||
      (rsvp.attendeeEmail || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [rsvps, search]);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{maxWidth:'500px',maxHeight:'90vh',overflowY:'auto'}}>
        <h3>RSVP List for: <span style={{color:'#2563eb'}}>{event.title}</span></h3>
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
                <td>{rsvp.attendeeName || '-'}</td>
                <td>{rsvp.attendeeEmail || '-'}</td>
                <td>
                  {rsvp.rsvpStatus === 'confirmed' ? (
                    <span style={{color:'#10b981',fontWeight:600}}>Confirmed</span>
                  ) : (
                    <span style={{color:'#dc2626',fontWeight:600}}>Cancelled</span>
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
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:'1.5rem'}}>
          <button className="delete-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default RSVPListModal; 