import React, { useState, useEffect } from 'react';
import './ManageAttendees.css';

// Backend API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ManageAttendees = ({ onClose }) => {
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user info
    const userInfo = localStorage.getItem('currentUser');
    if (userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    }

    const token = localStorage.getItem('token');
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchRsvps = async () => {
      try {
        // Organizer-only RSVPs for their events
        const res = await fetch(`${API_URL}/rsvps/organizer`, { headers: authHeaders });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error('Failed to load RSVPs for ManageAttendees', data);
          setRsvps([]);
          return;
        }
        setRsvps(data.rsvps || []);
      } catch (err) {
        console.error('Error loading RSVPs for ManageAttendees', err);
        setRsvps([]);
      }
    };

    // Load events from backend (MongoDB Atlas)
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/events?all=true`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error('Failed to load events for ManageAttendees', data);
          setEvents([]);
          return;
        }
        setEvents(data.events || []);
      } catch (err) {
        console.error('Error loading events for ManageAttendees', err);
        setEvents([]);
      }
    };

    fetchEvents();
    fetchRsvps();
  }, []);

  // Get organizer's events
  const organizerEvents = events.filter(event => 
    String(event.organizer?._id || event.organizer) === String(currentUser?.id)
  );

  // Get attendees for selected event
  const getEventAttendees = (eventId) => {
    return rsvps.filter(rsvp => {
      const rsvpEventId = rsvp.event?._id || rsvp.eventId;
      return String(rsvpEventId) === String(eventId);
    });
  };

  // Get user details for attendee
  const getUserDetails = (attendeeEmail) => {
    return users.find(user => user.email === attendeeEmail);
  };

  // Filter attendees based on search and status
  const getFilteredAttendees = () => {
    if (!selectedEvent) return [];
    
    let attendees = getEventAttendees(selectedEvent._id || selectedEvent.id);
    
    // Filter by search term
    if (searchTerm) {
      attendees = attendees.filter(attendee => 
        attendee.attendeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.attendeeEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      attendees = attendees.filter(attendee => attendee.rsvpStatus === filterStatus);
    }
    
    return attendees;
  };

  // Get attendee statistics
  const getAttendeeStats = (eventId) => {
    const eventAttendees = getEventAttendees(eventId);
    const isConfirmed = (r) => (r.status === 'going' || r.rsvpStatus === 'confirmed');
    const isCancelled = (r) => (r.status === 'not_going' || r.rsvpStatus === 'cancelled');
    const isInterested = (r) => (r.status === 'interested');
    return {
      total: eventAttendees.length,
      confirmed: eventAttendees.filter(isConfirmed).length,
      cancelled: eventAttendees.filter(isCancelled).length,
      interested: eventAttendees.filter(isInterested).length
    };
  };

  // Export attendees to CSV
  const exportAttendees = () => {
    if (!selectedEvent) return;
    
    const attendees = getFilteredAttendees();
    if (attendees.length === 0) {
      alert('No attendees to export.');
      return;
    }
    
    const csvData = [
      ['Name', 'Email', 'RSVP Status', 'RSVP Date', 'Event Title'],
      ...attendees.map(attendee => [
        attendee.attendeeName || 'N/A',
        attendee.attendeeEmail || 'N/A',
        attendee.rsvpStatus || 'N/A',
        attendee.timestamp ? new Date(attendee.timestamp).toLocaleDateString() : 'N/A',
        selectedEvent.title
      ])
    ];
    
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEvent.title}_attendees.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Send email to attendees (placeholder)
  const sendEmailToAttendees = () => {
    if (!selectedEvent) return;
    
    const attendees = getFilteredAttendees();
    if (attendees.length === 0) {
      alert('No attendees to email.');
      return;
    }
    
    const emailList = attendees.map(a => a.attendeeEmail).join(', ');
    alert(`Email functionality would open with recipients: ${emailList}\n\nThis would integrate with your email service.`);
  };

  const filteredAttendees = getFilteredAttendees();
  const stats = selectedEvent ? getAttendeeStats(selectedEvent._id || selectedEvent.id) : null;

  return (
    <div className="manage-attendees-overlay">
      <div className="manage-attendees-modal">
        <div className="manage-attendees-header">
          <h2>👥 Manage Attendees</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="manage-attendees-content">
          {/* Event Selection */}
          <div className="event-selection">
            <h3>Select Event</h3>
            {organizerEvents.length === 0 ? (
              <p>No events found. Create an event first.</p>
            ) : (
              <div className="event-list">
                {organizerEvents.map(event => {
                  const eventId = event._id || event.id;
                  return (
                  <div
                    key={eventId}
                    className={`event-option ${selectedEvent && (selectedEvent._id || selectedEvent.id) === eventId ? 'selected' : ''}`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="event-option-info">
                      <h4>{event.title}</h4>
                      <p>📅 {event.date} | 📍 {event.venue || event.location}</p>
                      <div className="event-stats">
                        {(() => {
                          const eventStats = getAttendeeStats(eventId);
                          return (
                            <>
                              <span className="stat-item">👥 {eventStats.total} Total</span>
                              <span className="stat-item">✅ {eventStats.confirmed} Confirmed</span>
                              <span className="stat-item">❌ {eventStats.cancelled} Cancelled</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>

          {/* Attendee Management */}
          {selectedEvent && (
            <div className="attendee-management">
              <div className="attendee-header">
                <h3>Attendees for "{selectedEvent.title}"</h3>
                <div className="attendee-actions">
                  <button className="export-btn" onClick={exportAttendees}>
                    📊 Export CSV
                  </button>
                  <button className="email-btn" onClick={sendEmailToAttendees}>
                    📧 Email Attendees
                  </button>
                </div>
              </div>

              {/* Statistics */}
              {stats && (
                <div className="attendee-stats">
                  <div className="stat-card">
                    <span className="stat-number">{stats.total}</span>
                    <span className="stat-label">Total RSVPs</span>
                  </div>
                  <div className="stat-card confirmed">
                    <span className="stat-number">{stats.confirmed}</span>
                    <span className="stat-label">Confirmed</span>
                  </div>
                  <div className="stat-card cancelled">
                    <span className="stat-number">{stats.cancelled}</span>
                    <span className="stat-label">Cancelled</span>
                  </div>
                  <div className="stat-card interested">
                    <span className="stat-number">{stats.interested}</span>
                    <span className="stat-label">Interested</span>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="attendee-filters">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="status-filter">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="status-select"
                  >
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="interested">Interested</option>
                  </select>
                </div>
              </div>

              {/* Attendee List */}
              <div className="attendee-list">
                {filteredAttendees.length === 0 ? (
                  <div className="no-attendees">
                    <p>No attendees found for the selected filters.</p>
                  </div>
                ) : (
                  filteredAttendees.map((attendee, index) => {
                    const attendeeName = attendee.user?.name || attendee.attendeeName || 'Unknown';
                    const attendeeEmail = attendee.user?.email || attendee.attendeeEmail || 'No email';
                    const rsvpStatus = attendee.rsvpStatus || attendee.status || 'unknown';
                    const userDetails = getUserDetails(attendeeEmail);
                    return (
                      <div key={index} className="attendee-item">
                        <div className="attendee-info">
                          <div className="attendee-avatar">
                            {attendeeName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="attendee-details">
                            <h4>{attendeeName}</h4>
                            <p>{attendeeEmail}</p>
                            <span className="rsvp-date">
                              RSVP'd: {attendee.timestamp ? new Date(attendee.timestamp).toLocaleDateString() : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div className="attendee-status">
                          <span className={`status-badge ${rsvpStatus}`}>
                            {rsvpStatus === 'confirmed' || rsvpStatus === 'going' ? '✅ Confirmed' :
                             rsvpStatus === 'cancelled' || rsvpStatus === 'not_going' ? '❌ Cancelled' :
                             rsvpStatus === 'interested' ? '👀 Interested' : '❓ Unknown'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAttendees;
