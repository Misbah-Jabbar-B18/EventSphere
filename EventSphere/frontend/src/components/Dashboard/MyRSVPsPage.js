import React from 'react';
import { useNavigate } from 'react-router-dom';

const MyRSVPsPage = ({ 
  userRSVPs, 
  qrCodes, 
  handleCancelRSVP, 
  handleViewEventDetails,
  refreshData 
}) => {
  const navigate = useNavigate();

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>📅 My RSVPs</h2>
        <p className="section-subtitle">Events you have registered for</p>
        <div className="stats-header">
          <span className="stat-item">
            <strong>{userRSVPs.filter(r => r.status === 'confirmed').length}</strong> Confirmed
          </span>
          <span className="stat-item">
            <strong>{userRSVPs.filter(r => r.status === 'cancelled').length}</strong> Cancelled
          </span>
          <span className="stat-item">
            <strong>{userRSVPs.filter(r => r.status === 'attended').length}</strong> Attended
          </span>
        </div>
      </div>
      
      {userRSVPs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No RSVPs Yet</h3>
          <p>You haven't RSVP'd to any events yet.</p>
          <button 
            className="primary-btn" 
            onClick={() => navigate('/dashboard/discover')}
          >
            Discover Events
          </button>
        </div>
      ) : (
        <div className="rsvp-list">
          {userRSVPs.map(rsvp => {
            const event = rsvp.event || {};
            const isPastEvent = new Date(event.date) < new Date();
            
            return (
              <div key={rsvp._id} className={`rsvp-item ${rsvp.status}`}>
                <div className="rsvp-header">
                  <div>
                    <h3>{event.title || rsvp.eventTitle || 'Event'}</h3>
                    <p className="event-category">{event.category || 'General'}</p>
                  </div>
                  <span className={`status-badge ${rsvp.status}`}>
                    {rsvp.status === 'confirmed' ? '✅ Confirmed' : 
                     rsvp.status === 'cancelled' ? '❌ Cancelled' : 
                     rsvp.status === 'attended' ? '🎉 Attended' : 
                     rsvp.status || 'Pending'}
                  </span>
                </div>
                <div className="rsvp-details">
                  <div className="detail-row">
                    <span className="detail-icon">📅</span>
                    <span>{new Date(event.date || rsvp.createdAt).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📍</span>
                    <span>{event.venue || rsvp.eventVenue || 'Venue not specified'}</span>
                  </div>
                  {event.time && (
                    <div className="detail-row">
                      <span className="detail-icon">⏰</span>
                      <span>{event.time}</span>
                    </div>
                  )}
                </div>
                <div className="rsvp-actions">
                  {rsvp.status === 'confirmed' && !isPastEvent && (
                    <>
                      <button 
                        className="view-ticket-btn"
                        onClick={() => navigate('/dashboard/mytickets')}
                      >
                        View Ticket
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={() => handleCancelRSVP(rsvp._id)}
                      >
                        Cancel RSVP
                      </button>
                    </>
                  )}
                  <button 
                    className="view-details-btn"
                    onClick={() => event._id && handleViewEventDetails(event._id)}
                  >
                    Event Details
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

export default MyRSVPsPage;