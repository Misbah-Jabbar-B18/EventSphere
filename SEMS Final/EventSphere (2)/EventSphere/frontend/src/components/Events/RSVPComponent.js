import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import './RSVPComponent.css';

// Backend API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RSVPComponent = ({ event, onClose }) => {
  const [rsvpStatus, setRsvpStatus] = useState('pending'); // pending, confirmed, cancelled
  const [qrCodeData, setQrCodeData] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEventPast, setIsEventPast] = useState(false);

  useEffect(() => {
    // Get current user info
    const userInfo = localStorage.getItem('currentUser');
    if (userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    }

    // Check if event date has passed
    const checkEventDate = () => {
      const currentDate = new Date();
      const eventDate = new Date(event.date);
      
      // Set time to start of day for accurate comparison
      currentDate.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      
      setIsEventPast(eventDate < currentDate);
    };

    checkEventDate();
  }, [event.date]);

  const generateQRCode = async (rsvpData) => {
    try {
      const qrData = JSON.stringify({
        // Use Mongo _id if present, otherwise fallback id
        eventId: event._id || event.id,
        eventTitle: event.title,
        eventDate: event.date,
        attendeeName: currentUser?.name || 'Guest',
        attendeeEmail: currentUser?.email || '',
        rsvpId: Date.now(),
        rsvpStatus: rsvpStatus,
        timestamp: new Date().toISOString()
      });

      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeData(qrCodeUrl);
      setShowQR(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code. Please try again.');
    }
  };

  const handleRSVP = async (status) => {
    setRsvpStatus(status);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to RSVP.');
        return;
      }

      if (status === 'confirmed') {
        // Create or update RSVP in backend as "going"
        const res = await fetch(`${API_URL}/rsvps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventId: event._id || event.id,
            status: 'going',
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(data.message || 'Failed to save RSVP. Please try again.');
          return;
        }
      } else if (status === 'cancelled') {
        // Call cancel endpoint to remove from MongoDB
        const res = await fetch(`${API_URL}/rsvps/event/${event._id || event.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(data.message || 'Failed to cancel RSVP. Please try again.');
          return;
        }
      }
    } catch (err) {
      console.error('Error saving RSVP to backend', err);
      alert('Failed to save RSVP to server. Please try again.');
      return;
    }

    // Also keep RSVP locally for UI features (QR, lists)
    const rsvpData = {
      eventId: event._id || event.id,
      eventTitle: event.title,
      eventDate: event.date,
      attendeeName: currentUser?.name || 'Guest',
      attendeeEmail: currentUser?.email || '',
      rsvpStatus: status,
      timestamp: new Date().toISOString()
    };

    const existingRSVPs = JSON.parse(localStorage.getItem('rsvps')) || [];
    const existingIndex = existingRSVPs.findIndex(
      rsvp => rsvp.eventId === (event._id || event.id) && rsvp.attendeeEmail === currentUser?.email
    );

    if (status === 'cancelled') {
      // Remove from local storage when cancelled
      if (existingIndex !== -1) {
        existingRSVPs.splice(existingIndex, 1);
      }
    } else {
      // Update or add RSVP
      if (existingIndex !== -1) {
        existingRSVPs[existingIndex] = rsvpData;
      } else {
        existingRSVPs.push(rsvpData);
      }
    }

    localStorage.setItem('rsvps', JSON.stringify(existingRSVPs));

    if (status === 'confirmed') {
      generateQRCode(rsvpData);
    } else {
      setShowQR(false);
    }

    const statusText = status === 'confirmed' ? 'confirmed' : 'cancelled';
    alert(`RSVP ${statusText} successfully for "${event.title}"!`);
    
    // Close modal and refresh parent component after cancellation
    if (status === 'cancelled' && onClose) {
      setTimeout(() => onClose(), 500); // Close modal to trigger refresh
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.download = `rsvp-${event.title}-${currentUser?.name}.png`;
    link.href = qrCodeData;
    link.click();
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>RSVP QR Code - ${event.title}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .qr-container { margin: 20px auto; }
            .qr-code { max-width: 300px; }
            .event-info { margin: 20px 0; }
          </style>
        </head>
        <body>
          <h2>🎫 Event RSVP QR Code</h2>
          <div class="event-info">
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p><strong>Attendee:</strong> ${currentUser?.name || 'Guest'}</p>
          </div>
          <div class="qr-container">
            <img src="${qrCodeData}" alt="RSVP QR Code" class="qr-code" />
          </div>
          <p><em>Present this QR code at the event entrance</em></p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="rsvp-overlay">
      <div className="rsvp-modal">
        <div className="rsvp-header">
          <h2>🎫 RSVP for Event</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="event-details">
          <h3>{event.title}</h3>
          <p><strong>📅 Date:</strong> {event.date}</p>
          <p><strong>📍 Venue:</strong> {event.venue}</p>
          <p><strong>🏷️ Category:</strong> {event.category}</p>
          <p><strong>👤 Attendee:</strong> {currentUser?.name || 'Guest'}</p>
        </div>

        {!showQR ? (
          <div className="rsvp-actions">
            {isEventPast ? (
              <div className="past-event-message">
                <h4>⏰ Event Has Passed</h4>
                <p>This event has already occurred. RSVP is no longer available for past events.</p>
                <div className="event-date-info">
                  <p><strong>Event Date:</strong> {event.date}</p>
                  <p><strong>Status:</strong> <span className="past-status">Past Event</span></p>
                </div>
                <button className="close-past-event-btn" onClick={onClose}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <h4>Will you attend this event?</h4>
                <div className="rsvp-buttons">
                  <button 
                    className="rsvp-confirm-btn"
                    onClick={() => handleRSVP('confirmed')}
                  >
                    ✅ Yes, I'll Attend
                  </button>
                  <button 
                    className="rsvp-cancel-btn"
                    onClick={() => handleRSVP('cancelled')}
                  >
                    ❌ No, I Can't Attend
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="qr-section">
            <h4>🎉 RSVP Confirmed!</h4>
            <p>Your QR code has been generated. Please save or print it for the event.</p>
            
            <div className="qr-code-container">
              <img src={qrCodeData} alt="RSVP QR Code" className="qr-code" />
            </div>

            <div className="qr-actions">
              <button className="download-btn" onClick={downloadQRCode}>
                📥 Download QR Code
              </button>
              <button className="print-btn" onClick={printQRCode}>
                🖨️ Print QR Code
              </button>
            </div>

            <div className="qr-info">
              <p><strong>📱 How to use:</strong></p>
              <ul>
                <li>Save this QR code to your phone</li>
                <li>Or print it and bring to the event</li>
                <li>Present it at the entrance for quick check-in</li>
              </ul>
            </div>

            <button className="new-rsvp-btn" onClick={() => setShowQR(false)}>
              🔄 RSVP for Another Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RSVPComponent; 