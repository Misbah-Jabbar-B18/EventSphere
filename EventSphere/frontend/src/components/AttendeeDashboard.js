import React, { useState } from 'react';
import EventList from './EventList';
import './Dashboard.css';

const AttendeeDashboard = ({ currentUser, handleLogout }) => {
  const [activeTab, setActiveTab] = useState('discover');
  const [userRSVPs, setUserRSVPs] = useState([
    { 
      id: 1, 
      name: 'Tech Conference 2024', 
      date: '2024-12-15', 
      time: '10:00 AM',
      location: 'New York Convention Center',
      status: 'Confirmed'
    },
    { 
      id: 2, 
      name: 'Music Festival', 
      date: '2024-12-20', 
      time: '6:00 PM',
      location: 'Los Angeles Stadium',
      status: 'Confirmed'
    },
    { 
      id: 3, 
      name: 'Startup Workshop', 
      date: '2024-12-25', 
      time: '2:00 PM',
      location: 'San Francisco Hub',
      status: 'Pending'
    }
  ]);
  
  const [qrCodes, setQRCodes] = useState([
    { 
      eventId: 1, 
      eventName: 'Tech Conference 2024', 
      qrValue: 'TECH-2024-USER-' + Math.random().toString(36).substr(2, 9),
      eventDate: '2024-12-15',
      checkInCode: 'TC2024XYZ'
    },
    { 
      eventId: 2, 
      eventName: 'Music Festival', 
      qrValue: 'MUSIC-2024-USER-' + Math.random().toString(36).substr(2, 9),
      eventDate: '2024-12-20',
      checkInCode: 'MF2024ABC'
    }
  ]);

  const [allEvents, setAllEvents] = useState([
    {
      id: 1,
      name: 'Tech Conference 2024',
      description: 'Annual technology conference with industry leaders',
      date: '2024-12-15',
      time: '10:00 AM - 6:00 PM',
      location: 'New York Convention Center',
      category: 'Technology',
      seats: 150,
      price: '$299',
      organizer: 'Tech Org Inc.'
    },
    {
      id: 2,
      name: 'Music Festival',
      description: '3-day music festival with top artists',
      date: '2024-12-20',
      time: '6:00 PM - 12:00 AM',
      location: 'Los Angeles Stadium',
      category: 'Music',
      seats: 5000,
      price: '$149',
      organizer: 'Music Events Co.'
    },
    {
      id: 3,
      name: 'Startup Workshop',
      description: 'Hands-on workshop for startup founders',
      date: '2024-12-25',
      time: '2:00 PM - 8:00 PM',
      location: 'San Francisco Hub',
      category: 'Business',
      seats: 50,
      price: '$199',
      organizer: 'Startup Academy'
    },
    {
      id: 4,
      name: 'Art Exhibition',
      description: 'Modern art exhibition by contemporary artists',
      date: '2024-12-28',
      time: '11:00 AM - 7:00 PM',
      location: 'Chicago Art Museum',
      category: 'Art',
      seats: 200,
      price: '$49',
      organizer: 'Art Society'
    },
    {
      id: 5,
      name: 'Health & Wellness Summit',
      description: 'Wellness workshops and fitness sessions',
      date: '2024-12-30',
      time: '8:00 AM - 4:00 PM',
      location: 'Miami Beach Resort',
      category: 'Health',
      seats: 300,
      price: '$99',
      organizer: 'Wellness Group'
    }
  ]);

  // Function to handle RSVP
  const handleRSVP = (eventId) => {
    const event = allEvents.find(e => e.id === eventId);
    if (event && !userRSVPs.find(rsvp => rsvp.id === eventId)) {
      const newRSVP = {
        id: eventId,
        name: event.name,
        date: event.date,
        time: event.time,
        location: event.location,
        status: 'Confirmed'
      };
      
      const newQRCode = {
        eventId: eventId,
        eventName: event.name,
        qrValue: `${event.category.toUpperCase()}-${eventId}-USER-${Math.random().toString(36).substr(2, 9)}`,
        eventDate: event.date,
        checkInCode: `${event.name.substring(0, 2).toUpperCase()}${eventId}${Math.random().toString(36).substr(2, 3).toUpperCase()}`
      };
      
      setUserRSVPs([...userRSVPs, newRSVP]);
      setQRCodes([...qrCodes, newQRCode]);
      alert(`Successfully RSVP'd for ${event.name}!`);
    } else {
      alert('You have already RSVP\'d for this event!');
    }
  };

  // Function to cancel RSVP
  const handleCancelRSVP = (eventId) => {
    setUserRSVPs(userRSVPs.filter(rsvp => rsvp.id !== eventId));
    setQRCodes(qrCodes.filter(qr => qr.eventId !== eventId));
    alert('RSVP cancelled successfully!');
  };

  // Function to download QR code
  const handleDownloadQR = (qrCode) => {
    // In a real app, this would generate/download actual QR image
    alert(`QR Code for ${qrCode.eventName} downloaded!\nCode: ${qrCode.qrValue}`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-info">
          <h2>🎫 Attendee Dashboard</h2>
          <p>Welcome back, <strong>{currentUser?.name || 'User'}</strong>!</p>
          <span className="role-badge attendee">
            {currentUser?.role === 'admin'
              ? 'Admin'
              : currentUser?.role === 'organizer'
              ? 'Organizer'
              : 'Attendee'}
          </span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="attendee-features">
        <div 
          className={`feature-card ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          <h3>🎪 Discover Events</h3>
          <p>Browse and RSVP for exciting events</p>
          <span className="badge">{allEvents.length} events</span>
        </div>
        
        <div 
          className={`feature-card ${activeTab === 'myrsvps' ? 'active' : ''}`}
          onClick={() => setActiveTab('myrsvps')}
        >
          <h3>📅 My RSVPs</h3>
          <p>View events you've RSVP'd for</p>
          <span className="badge">{userRSVPs.length} RSVPs</span>
        </div>
        
        <div 
          className={`feature-card ${activeTab === 'qrcodes' ? 'active' : ''}`}
          onClick={() => setActiveTab('qrcodes')}
        >
          <h3>📱 QR Codes</h3>
          <p>Access your event QR codes for check-in</p>
          <span className="badge">{qrCodes.length} codes</span>
        </div>
      </div>
      
      <div className="content-section">
        {activeTab === 'discover' && (
          <div className="tab-content">
            <div className="section-header">
              <h3>🎪 Discover Events</h3>
              <p className="section-subtitle">Browse and RSVP for upcoming events</p>
            </div>
            <EventList events={allEvents} onRSVP={handleRSVP} />
          </div>
        )}
        
        {activeTab === 'myrsvps' && (
          <div className="tab-content">
            <div className="section-header">
              <h3>📅 My RSVPs</h3>
              <p className="section-subtitle">Events you have registered for</p>
            </div>
            
            {userRSVPs.length === 0 ? (
              <div className="empty-state">
                <p>You haven't RSVP'd to any events yet.</p>
                <button 
                  className="primary-btn" 
                  onClick={() => setActiveTab('discover')}
                >
                  Discover Events
                </button>
              </div>
            ) : (
              <div className="rsvp-list">
                {userRSVPs.map(rsvp => (
                  <div key={rsvp.id} className="rsvp-item">
                    <div className="rsvp-header">
                      <h4>{rsvp.name}</h4>
                      <span className={`status-badge ${rsvp.status.toLowerCase()}`}>
                        {rsvp.status}
                      </span>
                    </div>
                    <div className="rsvp-details">
                      <p><span>📅</span> {rsvp.date} at {rsvp.time}</p>
                      <p><span>📍</span> {rsvp.location}</p>
                    </div>
                    <div className="rsvp-actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => setActiveTab('qrcodes')}
                      >
                        View QR Code
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={() => handleCancelRSVP(rsvp.id)}
                      >
                        Cancel RSVP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'qrcodes' && (
          <div className="tab-content">
            <div className="section-header">
              <h3>📱 Your QR Codes</h3>
              <p className="section-subtitle">Scan these at event check-in</p>
            </div>
            
            {qrCodes.length === 0 ? (
              <div className="empty-state">
                <p>No QR codes available. RSVP to events to get QR codes.</p>
                <button 
                  className="primary-btn" 
                  onClick={() => setActiveTab('discover')}
                >
                  Discover Events
                </button>
              </div>
            ) : (
              <div className="qr-codes-container">
                {qrCodes.map(qr => (
                  <div key={qr.eventId} className="qr-code-card">
                    <div className="qr-header">
                      <h4>{qr.eventName}</h4>
                      <span className="event-date">{qr.eventDate}</span>
                    </div>
                    
                    <div className="qr-code-display">
                      <div className="qr-placeholder">
                        {/* QR Code Visualization */}
                        <div className="qr-pattern">
                          <div className="qr-corner top-left"></div>
                          <div className="qr-corner top-right"></div>
                          <div className="qr-corner bottom-left"></div>
                          <div className="qr-code-text">
                            {qr.qrValue.substring(0, 20)}...
                          </div>
                        </div>
                      </div>
                      <p className="qr-info">Scan this code at the event entrance</p>
                    </div>
                    
                    <div className="qr-details">
                      <p><strong>Check-in Code:</strong> {qr.checkInCode}</p>
                      <p><strong>Event ID:</strong> {qr.eventId}</p>
                    </div>
                    
                    <div className="qr-actions">
                      <button 
                        className="download-qr-btn"
                        onClick={() => handleDownloadQR(qr)}
                      >
                        Download QR Code
                      </button>
                      <button 
                        className="share-btn"
                        onClick={() => navigator.clipboard.writeText(qr.qrValue)}
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendeeDashboard;