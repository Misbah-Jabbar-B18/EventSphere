import React, { useState, useEffect, useRef } from 'react';
import CreateEvent from './CreateEvent';
import EventList from '../Events/EventList';
import OrganizerEventRSVPStats from './OrganizerEventRSVPStats';
import AdminDashboard from './AdminDashboard';
import ManageAttendees from './ManageAttendees';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [showManageAttendees, setShowManageAttendees] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [eventListKey, setEventListKey] = useState(0); // for force refresh
  const eventsSectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user info from localStorage
    const userInfo = localStorage.getItem('currentUser');
    if (userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    }
  }, []);

  // Fetch my RSVPs (attendee)
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  const scrollToEvents = () => {
    if (eventsSectionRef.current) {
      eventsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openMyRsvps = () => {
    navigate('/my-rsvps');
  };

  // Organizer Dashboard
  // Backend roles come as lowercase: "organizer", "admin", "user"
  if (currentUser && currentUser.role === 'organizer') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="user-info">
            <h2>🎪 Organizer Dashboard</h2>
            <p>Welcome back, <strong>{currentUser.name}</strong>!</p>
            <span className="role-badge organizer">Organizer</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="organizer-features">
          <div className="feature-card">
            <h3>📝 Event Management</h3>
            <p>Create, update, and delete events for your organization</p>
            <button className="create-btn" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Hide Event Form' : 'Create New Event'}
            </button>
          </div>
          
          <div className="feature-card">
            <h3>📊 Event Analytics</h3>
            <p>Track attendance, engagement, and event performance</p>
            <button className="analytics-btn" onClick={() => navigate('/organizer/analytics')}>View Analytics</button>
          </div>
          
          <div className="feature-card">
            <h3>👥 Attendee Management</h3>
            <p>Manage registrations and communicate with attendees</p>
            <button className="attendees-btn" onClick={() => setShowManageAttendees(true)}>Manage Attendees</button>
          </div>
        </div>

        {showForm && (
          <div className="create-event-section">
            <h3>Create New Event</h3>
            <CreateEvent />
          </div>
        )}
        
        <div className="events-section">
          <h3>My Events</h3>
          <EventList 
            key={eventListKey + '-my'}
            mode="organizer"
            filterByOrganizer={true}
            showUpdateDelete={true}
          onUpdateEvent={event => navigate(`/update-event/${event._id || event.id}`)}
            onDeleteEvent={() => setEventListKey(k => k + 1)}
          />
        </div>
        <div className="events-section">
          <h3>All Events</h3>
          <EventList 
            key={eventListKey + '-all'}
            mode="organizer"
            filterByOrganizer={false}
            showUpdateDelete={false}
          />
        </div>

        {/* RSVP Stats Section */}
        <OrganizerEventRSVPStats />

        {/* Manage Attendees Modal */}
        {showManageAttendees && (
          <ManageAttendees onClose={() => setShowManageAttendees(false)} />
        )}
      </div>
    );
  }

  // Admin Dashboard
  if (currentUser && currentUser.role === 'admin') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="user-info">
            <h2>⚙️ Admin Dashboard</h2>
            <p>Welcome back, <strong>{currentUser.name}</strong>!</p>
            <span className="role-badge admin">Admin</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // Attendee Dashboard (Default)
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
        <div className="feature-card">
          <h3>🎪 Discover Events</h3>
          <p>Browse and RSVP for exciting events</p>
          <button className="create-btn" onClick={scrollToEvents}>Browse Now</button>
        </div>
        
        <div className="feature-card">
          <h3>📅 My RSVPs</h3>
          <p>View events you've RSVP'd for</p>
          <button className="analytics-btn" onClick={openMyRsvps}>Open My RSVPs</button>
        </div>
        
        <div className="feature-card">
          <h3>📱 QR Codes</h3>
          <p>Access your event QR codes for check-in</p>
         <button className="attendees-btn" onClick={() => navigate('/my-qrs')}>
  Show QR Codes
</button>

        </div>
      </div>
      
      <div className="events-section" ref={eventsSectionRef}>
        <h3>Available Events</h3>
        <EventList />
      </div>

    </div>
  );
};

export default Dashboard;
