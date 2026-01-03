import React from 'react';
import { useNavigate } from 'react-router-dom';

const MyTicketsPage = ({ 
  qrCodes, 
  handleDownloadQR, 
  handleShareQRCode, 
  handleViewEventDetails 
}) => {
  const navigate = useNavigate();

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>📱 Your Event Tickets</h2>
        <p className="section-subtitle">Scan these QR codes at event check-in</p>
      </div>
      
      {qrCodes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <h3>No Tickets Available</h3>
          <p>RSVP to confirmed events to get your tickets.</p>
          <button 
            className="primary-btn" 
            onClick={() => navigate('/dashboard/discover')}
          >
            Discover Events
          </button>
        </div>
      ) : (
        <div className="qr-codes-container">
          {qrCodes.map(qr => {
            const isPastEvent = new Date(qr.eventDate) < new Date();
            
            return (
              <div key={qr.rsvpId} className={`qr-code-card ${isPastEvent ? 'past-event' : ''}`}>
                {isPastEvent && (
                  <div className="past-event-banner">
                    ⏰ This event has passed
                  </div>
                )}
                
                <div className="qr-header">
                  <div>
                    <h3>{qr.eventName}</h3>
                    <p className="event-category">{qr.eventCategory}</p>
                  </div>
                  <span className="event-date">
                    {new Date(qr.eventDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="qr-code-display">
                  <div className="qr-placeholder" id={`qr-${qr.rsvpId}`}>
                    <div className="qr-pattern">
                      <div className="qr-corner top-left"></div>
                      <div className="qr-corner top-right"></div>
                      <div className="qr-corner bottom-left"></div>
                      <div className="qr-code-text">
                        {qr.qrValue.substring(0, 25)}...
                      </div>
                    </div>
                  </div>
                  <p className="qr-info">🎫 Present this ticket at the event entrance</p>
                </div>
                
                <div className="qr-details">
                  <div className="detail-row">
                    <strong>Check-in Code:</strong>
                    <code className="checkin-code">{qr.checkInCode}</code>
                  </div>
                  <div className="detail-row">
                    <strong>Venue:</strong>
                    <span>{qr.eventVenue}</span>
                  </div>
                  {qr.eventTime && qr.eventTime !== 'Unknown Time' && (
                    <div className="detail-row">
                      <strong>Time:</strong>
                      <span>{qr.eventTime}</span>
                    </div>
                  )}
                </div>
                
                <div className="qr-actions">
                  <button 
                    className="download-qr-btn"
                    onClick={() => handleDownloadQR(qr)}
                  >
                    📥 Download Ticket
                  </button>
                  <button 
                    className="share-btn"
                    onClick={() => handleShareQRCode(qr)}
                  >
                    📤 Share Ticket
                  </button>
                  {!isPastEvent && (
                    <button 
                      className="view-event-btn"
                      onClick={() => qr.eventId && handleViewEventDetails(qr.eventId)}
                    >
                      🔍 Event Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;