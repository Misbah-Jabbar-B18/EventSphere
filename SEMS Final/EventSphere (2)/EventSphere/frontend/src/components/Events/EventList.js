// ✅ COMPONENT: EventList.js (public or registered user dashboard)
import React, { useEffect, useState, useMemo } from 'react';
import RSVPComponent from './RSVPComponent';
import './EventList.css';
import { useNavigate } from 'react-router-dom';

// Backend API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Public base URL for generating shareable links (set this in your environment for production)
// Example: REACT_APP_BASE_URL=https://events.example.com
const BASE_URL = process.env.REACT_APP_BASE_URL || (typeof window !== 'undefined' && window.location && window.location.origin) || 'https://example.com';

const EventList = ({ mode = 'attendee', onUpdateEvent, onDeleteEvent, showUpdateDelete = true, filterByOrganizer = false }) => {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showRSVP, setShowRSVP] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const eventsPerPage = 6;
  const navigate = useNavigate();

  // Available categories
  const categories = [
    'All Categories',
    'Conference',
    'Wedding',
    'Concert',
    'Corporate Meeting'
  ];

  // ✅ Load events from MongoDB Atlas via backend API
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('Failed to load events from API', data);
        return;
      }
      // Backend returns { events: [...] }
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching events from API', err);
    }
  };

  // Fetch and update user's RSVP data from backend
  const fetchUserRsvps = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_URL}/rsvps/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.rsvps) {
        // Convert backend RSVPs to localStorage format for consistency
        const rsvps = data.rsvps.map(rsvp => ({
          eventId: rsvp.event?._id || rsvp.eventId,
          eventTitle: rsvp.event?.title || 'Event',
          eventDate: rsvp.event?.date || '',
          attendeeName: rsvp.user?.name || currentUser?.name || 'Guest',
          attendeeEmail: rsvp.user?.email || currentUser?.email || '',
          rsvpStatus: rsvp.status === 'going' ? 'confirmed' : 'cancelled',
          timestamp: new Date().toISOString()
        }));
        localStorage.setItem('rsvps', JSON.stringify(rsvps));
      }
    } catch (err) {
      console.error('Error fetching user RSVPs', err);
    }
  };

  // Get current user info
  useEffect(() => {
    const userInfo = localStorage.getItem('currentUser');
    if (userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    }
  }, []);

  // Check if user has RSVP'd for an event (still using localStorage cache for quick UI)
  const getUserRSVPStatus = (eventId) => {
    const rsvps = JSON.parse(localStorage.getItem('rsvps')) || [];
    const userRSVP = rsvps.find(
      (rsvp) => rsvp.eventId === eventId && rsvp.attendeeEmail === currentUser?.email
    );
    return userRSVP?.rsvpStatus || null;
  };

  // Memoized filtered and sorted events (no flicker)
  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (mode === 'organizer' && currentUser && filterByOrganizer) {
      // Organizer view: show only events created by this organizer (match MongoDB organizer id)
      filtered = filtered.filter((event) => String(event.organizer?._id || event.organizer) === String(currentUser.id));
    }
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    // Sort events: Active events first, then past events
    filtered.sort((a, b) => {
      const currentDate = new Date();
      const eventDateA = new Date(a.date);
      const eventDateB = new Date(b.date);
      
      // Set time to start of day for accurate comparison
      currentDate.setHours(0, 0, 0, 0);
      eventDateA.setHours(0, 0, 0, 0);
      eventDateB.setHours(0, 0, 0, 0);
      
      const isEventAPast = eventDateA < currentDate;
      const isEventBPast = eventDateB < currentDate;
      
      // If one is past and one is active, active comes first
      if (isEventAPast && !isEventBPast) return 1;
      if (!isEventAPast && isEventBPast) return -1;
      
      // If both are active or both are past, sort by date (ascending for active, descending for past)
      if (!isEventAPast && !isEventBPast) {
        // Both active: sort by date ascending (earliest first)
        return eventDateA - eventDateB;
      } else {
        // Both past: sort by date descending (most recent first)
        return eventDateB - eventDateA;
      }
    });
    
    return filtered;
  }, [events, mode, currentUser, filterByOrganizer, selectedCategory]);

  useEffect(() => {
    fetchEvents();
    fetchUserRsvps();
  }, []);

  // Enhanced pagination logic - ensures current page is filled before moving to next
  const getCurrentPageEvents = () => {
    const totalEvents = filteredEvents.length;
    if (totalEvents === 0) return [];
    
    const indexOfFirst = (currentPage - 1) * eventsPerPage;
    
    // Calculate how many events should be on current page
    let eventsOnCurrentPage = eventsPerPage;
    
    // Check if we have enough events to fill the current page
    const remainingEvents = totalEvents - indexOfFirst;
    
    // If remaining events are less than eventsPerPage, show all remaining events
    if (remainingEvents < eventsPerPage) {
      eventsOnCurrentPage = remainingEvents;
    }
    
    const indexOfLast = indexOfFirst + eventsOnCurrentPage;
    
    return filteredEvents.slice(indexOfFirst, indexOfLast);
  };

  const currentEvents = getCurrentPageEvents();
  
  // Calculate total pages more intelligently
  const calculateTotalPages = () => {
    const totalEvents = filteredEvents.length;
    if (totalEvents === 0) return 0;
    
    // Calculate how many full pages we can have
    const fullPages = Math.floor(totalEvents / eventsPerPage);
    const remainingEvents = totalEvents % eventsPerPage;
    
    // If there are remaining events, we need one more page
    return remainingEvents > 0 ? fullPages + 1 : fullPages;
  };
  
  const totalPages = calculateTotalPages();

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // RSVP/Update/Delete handlers
  const handleRSVPClick = (event) => {
    setSelectedEvent(event);
    setShowRSVP(true);
  };
  const handleCardClick = (event) => {
    // Backend roles: "user" for attendees
    if (mode === 'attendee' && currentUser && currentUser.role === 'user') {
      // Check if event is past before allowing RSVP
      if (isEventPast(event)) {
        alert(`⏰ This event has already passed (${event.date}). RSVP is no longer available for past events.`);
        return;
      }
      handleRSVPClick(event);
    } else {
      // Just show details for home/organizer
      alert(`📍 ${event.title}\n📅 ${event.date}\n📍 ${event.location || event.venue}\n\n${event.description}`);
    }
  };
  const handleUpdate = (event) => {
    if (onUpdateEvent) onUpdateEvent(event);
  };
  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in as an organizer or admin to delete events.');
        return;
      }

      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.message || 'Failed to delete event');
        return;
      }

      await fetchEvents();

      // Adjust current page if needed after deletion
      setTimeout(() => {
        const newTotalPages = calculateTotalPages();
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      }, 100);

      if (onDeleteEvent) onDeleteEvent(eventId);
    } catch (err) {
      console.error('Error deleting event', err);
      alert('Failed to delete event. Please try again.');
    }
  };

  // Helper: get RSVP count for an event
  const getRSVPCount = (eventId) => {
    const rsvps = JSON.parse(localStorage.getItem('rsvps')) || [];
    return rsvps.filter(
      (rsvp) => rsvp.eventId === eventId && rsvp.rsvpStatus === 'confirmed'
    ).length;
  };

  // Helper: get event status
  const getEventStatus = (event) => {
    if (event.status && event.status.toLowerCase() === 'cancelled') return 'Cancelled';
    const today = new Date().toISOString().slice(0, 10);
    if (event.date < today) return 'Past';
    return 'Active';
  };

  // Helper: check if event is past
  const isEventPast = (event) => {
    const currentDate = new Date();
    const eventDate = new Date(event.date);
    
    // Set time to start of day for accurate comparison
    currentDate.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    return eventDate < currentDate;
  };

  // Update handleCategoryFilter to not setFilteredEvents
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when filtering
    
    // Ensure we don't end up on an empty page after filtering
    setTimeout(() => {
      const newTotalPages = calculateTotalPages();
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }
    }, 100);
  };

  // Generate a public, shareable link for an event
  const generateShareLink = (event) => {
    const id = event._id || event.id;
    return `${BASE_URL.replace(/\/+$/,'')}/event/${id}`;
  };

  // Open WhatsApp share URL in a new tab/window
  const handleWhatsAppShare = (shareLink, title) => {
    const message = `${title} - ${shareLink}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // Decide whether an event can be shared: only in organizer mode
  // and only for certain categories (birthday, party, wedding, meeting)
  const canShareEvent = (event) => {
    if (mode !== 'organizer') return false;
    const cat = (event.category || '').toString().toLowerCase();
    const allowed = ['birthday', 'birthday party', 'party', 'parties', 'wedding', 'meeting', 'corporate meeting', 'conference'];
    return allowed.some(keyword => cat.includes(keyword));
  };

  return (
    <div className="event-list-container">
      <div className="event-header">
        <h2>🎫 Events</h2>
        <div className="filter-section">
          <label htmlFor="category-filter">
            Filter by Category:
            {selectedCategory && selectedCategory !== 'All Categories' && (
              <span className="filter-active-indicator"> 🔍 Active</span>
            )}
          </label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className={`category-filter ${selectedCategory && selectedCategory !== 'All Categories' ? 'filter-active' : ''}`}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Results Info */}
      <div className="filter-info">
        <p>
          {selectedCategory && selectedCategory !== 'All Categories' ? (
            <>
              Showing <strong>{filteredEvents.length}</strong> event{filteredEvents.length !== 1 ? 's' : ''} 
              in <strong>{selectedCategory}</strong> category
              <button 
                onClick={() => handleCategoryFilter('All Categories')}
                className="clear-filter-btn-small"
              >
                ✕ Clear Filter
              </button>
            </>
          ) : (
            <>
              Showing all <strong>{filteredEvents.length}</strong> events
            </>
          )}
        </p>
      </div>

      <div className="event-grid">
        {currentEvents.length > 0 ? (
          currentEvents.map(event => {
            const rsvpStatus = getUserRSVPStatus(event._id || event.id);
            return (
              <div
                key={event._id || event.id}
                className={`event-card ${mode === 'attendee' && currentUser?.role === 'user' ? 'attendee-card' : ''} ${isEventPast(event) ? 'past-event' : ''}`}
                onClick={() => handleCardClick(event)}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                {isEventPast(event) && (
                  <div className="past-event-overlay">
                    ⏰ Event Has Passed
                  </div>
                )}
                {mode === 'attendee' && currentUser?.role === 'user' && !rsvpStatus && !isEventPast(event) && (
                  <div className="attendee-click-indicator">
                    🎫 Click to RSVP for this event
                  </div>
                )}
                {mode === 'attendee' && currentUser?.role === 'user' && isEventPast(event) && (
                  <div className="past-event-indicator">
                    ⏰ RSVP not available for past events
                  </div>
                )}
                <img src={event.image} alt={event.title} />
                <div className="event-card-content">
                  <h3>{event.title}</h3>
                  {/* Event Status Badge (Organizer only) */}
                  {mode === 'organizer' && (
                    <span className={`event-status-badge status-${getEventStatus(event).toLowerCase()}`}>
                      {getEventStatus(event)}
                    </span>
                  )}
                  <p className="event-date"><strong>📅 Date:</strong> {event.date}</p>
                  <p className="event-venue"><strong>📍 Venue:</strong> {event.venue}</p>
                  <p className="event-category"><strong>🏷️ Category:</strong> {event.category}</p>
                  <p className="event-description">{event.description}</p>
                  
                  {/* RSVP Count Badge (Organizer only, My Events only) */}
                  {mode === 'organizer' && showUpdateDelete && (
                    <span className="rsvp-count-badge">{getRSVPCount(event.id)} RSVPs</span>
                  )}
                  
                  {/* RSVP Status and Button */}
                  <div className="rsvp-section">
                    {/* Home: No actions, just info */}
                    {mode === 'home' ? null :
                      mode === 'organizer' ? null : (
                        rsvpStatus ? (
                          <div className={`rsvp-status ${rsvpStatus}`}>
                            {rsvpStatus === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}
                          </div>
                        ) : (
                          <div className="rsvp-action-hint">
                            <span className="click-hint">🎫 Click to RSVP</span>
                          </div>
                        )
                      )
                    }
                  </div>

                  {/* Share Button (WhatsApp) - shown only to organizers and for allowed categories */}
                  {canShareEvent(event) && (
                    <div style={{marginTop: '0.5rem'}}>
                      <button
                        className="share-btn"
                        onClick={e => { e.stopPropagation(); handleWhatsAppShare(generateShareLink(event), event.title); }}
                      >
                        📤 Share
                      </button>
                    </div>
                  )}

                  {/* Update/Delete Buttons for My Events (Organizer only) */}
                  {mode === 'organizer' && showUpdateDelete && (
                    <div className="organizer-actions" style={{display:'flex',gap:'0.5rem',marginTop:'0.5rem'}}>
                      <button className="update-btn" onClick={e => { e.stopPropagation(); handleUpdate(event); }}>✏️ Update</button>
                      <button className="delete-btn" onClick={e => { e.stopPropagation(); handleDelete(event._id || event.id); }}>🗑️ Delete</button>
                      <button className="guests-btn" onClick={e => { e.stopPropagation(); navigate(`/event/${event._id || event.id}/guests`); }}>📄 View Guests</button>
                      <button className="guests-btn" onClick={e => { e.stopPropagation(); navigate(`/event/${event._id || event.id}/scan`); }}>📷 Scan QR</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-events">
            <p>No events found in this category.</p>
            {selectedCategory && selectedCategory !== 'All Categories' && (
              <button 
                onClick={() => handleCategoryFilter('All Categories')}
                className="clear-filter-btn"
              >
                Show All Events
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}

      {/* RSVP Modal */}
      {mode === 'attendee' && showRSVP && selectedEvent && (
        <RSVPComponent 
          event={selectedEvent} 
          onClose={() => {
            setShowRSVP(false);
            setSelectedEvent(null);
            fetchEvents(); // Refresh to update RSVP status
            fetchUserRsvps(); // Fetch latest RSVPs from backend
          }} 
        />
      )}
    </div>
  );
};

export default EventList;
