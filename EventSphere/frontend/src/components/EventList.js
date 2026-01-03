import React from 'react';

const EventList = ({ events, onRSVP }) => {
  return (
    <div className="event-list">
      {events.map(event => (
        <div key={event.id} className="event-card">
          <div className="event-header">
            <h4>{event.name}</h4>
            <span className="event-category">{event.category}</span>
          </div>
          
          <p className="event-description">{event.description}</p>
          
          <div className="event-details">
            <div className="detail-item">
              <span className="icon">📅</span>
              <div>
                <p className="detail-label">Date & Time</p>
                <p className="detail-value">{event.date} • {event.time}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="icon">📍</span>
              <div>
                <p className="detail-label">Location</p>
                <p className="detail-value">{event.location}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="icon">👤</span>
              <div>
                <p className="detail-label">Organizer</p>
                <p className="detail-value">{event.organizer}</p>
              </div>
            </div>
          </div>
          
          <div className="event-footer">
            <div className="event-stats">
              <span className="seats">🎟️ {event.seats} seats</span>
              <span className="price">{event.price}</span>
            </div>
            <button 
              className="rsvp-btn"
              onClick={() => onRSVP(event.id)}
            >
              RSVP Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;