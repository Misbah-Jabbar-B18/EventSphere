import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';

// Backend API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getToday = () => new Date().toISOString().slice(0, 10);

const AdminDashboard = () => {
  // State
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [feedback, setFeedback] = useState([]); // dummy for now
  const [refreshKey, setRefreshKey] = useState(0);
  const [showNewAdminModal, setShowNewAdminModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [analytics, setAnalytics] = useState({ ticketSales: 0, checkInRate: 0 });
  const navigate = useNavigate();

  // Load data
  useEffect(() => {
    // Feedback still local for now
    setFeedback(JSON.parse(localStorage.getItem('feedback')) || []);

    const token = localStorage.getItem('token');
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/users`, { headers: authHeaders });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error('Failed to load users for admin dashboard', data);
          setUsers([]);
          return;
        }
        setUsers(data.users || []);
      } catch (err) {
        console.error('Error loading users for admin dashboard', err);
        setUsers([]);
      }
    };

    const fetchRsvps = async () => {
      try {
        const res = await fetch(`${API_URL}/rsvps`, { headers: authHeaders });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error('Failed to load RSVPs for admin dashboard', data);
          setRsvps([]);
          return;
        }
        setRsvps(data.rsvps || []);
      } catch (err) {
        console.error('Error loading RSVPs for admin dashboard', err);
        setRsvps([]);
      }
    };

    // Events always come from backend (MongoDB Atlas)
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/events?all=true`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error('Failed to load events for admin dashboard', data);
          setEvents([]);
          return;
        }
        setEvents(data.events || []);
      } catch (err) {
        console.error('Error loading events for admin dashboard', err);
        setEvents([]);
      }
    };

    fetchUsers();
    fetchRsvps();
    fetchEvents();

    const interval = setInterval(() => {
      setFeedback(JSON.parse(localStorage.getItem('feedback')) || []);
      fetchUsers();
      fetchRsvps();
      fetchEvents();
    }, 10000); // refresh every 10s

    return () => clearInterval(interval);
  }, [refreshKey]);

  // Analytics calculation
  useEffect(() => {
    const totalRSVPs = rsvps.length;
    const confirmedRSVPs = rsvps.filter(
      (r) => r.status === 'going' || r.rsvpStatus === 'confirmed'
    ).length;
    setAnalytics({
      ticketSales: confirmedRSVPs,
      checkInRate: totalRSVPs
        ? Math.round((confirmedRSVPs / totalRSVPs) * 10000) / 100 // %
        : 0
    });
  }, [rsvps]);

  // Stats
  const totalOrganizers = users.filter(u => u.role === 'organizer' || u.role === 'Organizer').length;
  const totalAttendees = users.filter(u => u.role === 'user' || u.role === 'Attendee').length;
  const totalAdmins = users.filter(u => u.role === 'admin' || u.role === 'Admin').length;
  const totalUsers = users.length;
  const totalEvents = events.length;
  const approvedEvents = events.filter(e => e.status === 'approved').length;
  const pendingEvents = events.filter(e => e.status === 'pending').length;
  const bannedEvents = events.filter(e => e.status === 'banned').length;
  const isConfirmed = (r) => r.status === 'going' || r.rsvpStatus === 'confirmed';
  const todayRSVPs = rsvps.filter(r => {
    const ts = r.timestamp || r.createdAt || '';
    return ts && ts.slice(0, 10) === getToday();
  }).length;
  const totalRSVPs = rsvps.length;
  const confirmedRSVPs = rsvps.filter(isConfirmed).length;
  const categoryStats = events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});

  // User actions
  const handleDeleteUser = (email) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      let allUsers = JSON.parse(localStorage.getItem('users')) || [];
      allUsers = allUsers.filter(u => u.email !== email);
      localStorage.setItem('users', JSON.stringify(allUsers));
      setRefreshKey(k => k + 1);
    }
  };
  const handleBlockUser = (email, block) => {
    let allUsers = JSON.parse(localStorage.getItem('users')) || [];
    allUsers = allUsers.map(u => u.email === email ? { ...u, blocked: block } : u);
    localStorage.setItem('users', JSON.stringify(allUsers));
    setRefreshKey(k => k + 1);
  };
  const handleRoleChange = (email, newRole) => {
    let allUsers = JSON.parse(localStorage.getItem('users')) || [];
    allUsers = allUsers.map(u => u.email === email ? { ...u, role: newRole } : u);
    localStorage.setItem('users', JSON.stringify(allUsers));
    setRefreshKey(k => k + 1);
  };

  // Event actions
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in as an admin to delete events.');
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

      setEvents(prev => prev.filter(e => (e._id || e.id) !== eventId));
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Error deleting event from admin dashboard', err);
      alert('Failed to delete event. Please try again.');
    }
  };
  const handleApproveEvent = (eventId) => {
    // Status is local-only for now; backend does not track approved/banned
    setEvents(prev =>
      prev.map(e =>
        (e._id || e.id) === eventId ? { ...e, status: 'approved' } : e
      )
    );
  };
  const handleBanEvent = (eventId) => {
    setEvents(prev =>
      prev.map(e =>
        (e._id || e.id) === eventId ? { ...e, status: 'banned' } : e
      )
    );
  };
  const handleUpdateEvent = (event) => {
    navigate(`/update-event/${event._id || event.id}`);
  };

  // Activity log (recent RSVPs, event creation)
  const recentActivity = [
    ...rsvps.slice(-5).map(r => ({
      type: 'RSVP',
      text: `${r.user?.name || r.attendeeName || 'Someone'} RSVP'd for event ${r.event?.title || r.eventId}`,
      time: r.timestamp
    })),
    ...events.slice(-5).map(e => ({
      type: 'Event',
      text: `${e.organizer?.name || e.organizerName || 'Someone'} created event "${e.title}"`,
      time: e.createdAt
    }))
  ].sort((a, b) => (b.time || '').localeCompare(a.time || ''));

  // Export data as CSV
  const handleExport = (type) => {
    setExporting(true);
    let data = [];
    let filename = '';
    if (type === 'events') {
      data = events;
      filename = 'events.csv';
    } else if (type === 'rsvps') {
      data = rsvps;
      filename = 'rsvps.csv';
    }
    if (data.length === 0) {
      alert('No data to export.');
      setExporting(false);
      return;
    }
    const csv = [Object.keys(data[0]).join(','), ...data.map(row => Object.values(row).map(v => '"'+String(v).replace(/"/g,'""')+'"').join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setExporting(false);
  };

  // New Admin creation
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in as admin.');
        return;
      }
      const res = await fetch(`${API_URL}/auth/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.message || 'Failed to create admin');
        return;
      }
      alert('New admin created!');
      setShowNewAdminModal(false);
      setRefreshKey(k => k + 1);
      // optionally clear form
      form.reset();
    } catch (err) {
      console.error('Create admin error', err);
      alert('Failed to create admin. Please try again.');
    }
  };

  // System settings update (expanded)
  // Removed unused handleSaveSettings function

  // Load system settings for modal defaults
  // Removed unused effect

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {/* Stats Cards */}
      <div className="admin-stats-cards">
        <div className="admin-stat-card">👥 <strong>{totalUsers}</strong> Users<br/>(<span style={{color:'#2563eb'}}>O:</span> {totalOrganizers} <span style={{color:'#10b981'}}>A:</span> {totalAttendees} <span style={{color:'#f59e0b'}}>Ad:</span> {totalAdmins})</div>
        <div className="admin-stat-card">📅 <strong>{totalEvents}</strong> Events<br/>(Approved: {approvedEvents}, Pending: {pendingEvents}, Banned: {bannedEvents})</div>
        <div className="admin-stat-card">📈 <strong>{todayRSVPs}</strong> RSVPs Today</div>
        <div className="admin-stat-card">✅ <strong>{confirmedRSVPs}</strong> Confirmed RSVPs</div>
        <div className="admin-stat-card">🏷️ Categories:<br/>{Object.entries(categoryStats).map(([cat, count]) => (<span key={cat}>{cat}: {count} <br/></span>))}</div>
      </div>
      {/* User Management */}
      <h3>All Users</h3>
      <div className="admin-users-list">
        {users.length === 0 ? <p>No users found.</p> : users.map((user, idx) => (
          <div key={user.email || idx} className={`admin-user-card ${user.blocked ? 'blocked' : ''}`}>
            <span><strong>{user.name}</strong> ({user.email}) - <span className="admin-user-role">{user.role}</span> {user.blocked && <span className="blocked-label">[Blocked]</span>}</span>
            <div className="admin-user-actions">
              <button className="delete-btn" onClick={() => handleDeleteUser(user.email)}>🗑️ Delete</button>
              <button className="block-btn" onClick={() => handleBlockUser(user.email, !user.blocked)}>{user.blocked ? 'Unblock' : 'Block'}</button>
              <select value={user.role} onChange={e => handleRoleChange(user.email, e.target.value)} className="role-select">
                <option value="Admin">Admin</option>
                <option value="Organizer">Organizer</option>
                <option value="Attendee">Attendee</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      {/* Event Management */}
      <h3 style={{marginTop:'2rem'}}>All Events</h3>
      <div className="admin-events-list">
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          events.map((event) => {
            const eventId = event._id || event.id;
            return (
              <div key={eventId} className={`admin-event-card ${event.status || ''}`}>
                <div className="admin-event-info">
                  <strong>{event.title}</strong>{' '}
                  <span className="admin-event-date">({event.date})</span>
                  <span className="admin-event-meta">
                    By: {event.organizer?.name || event.organizerName || 'N/A'}
                  </span>
                  <span className="admin-event-status">
                    Status: {event.status || 'pending'}
                  </span>
                </div>
                <div className="admin-event-actions">
                  <button
                    className="approve-btn"
                    onClick={() => handleApproveEvent(eventId)}
                  >
                    ✅ Approve
                  </button>
                  <button
                    className="update-btn"
                    onClick={() => handleUpdateEvent(event)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteEvent(eventId)}
                  >
                    🗑️ Delete
                  </button>
                  <button
                    className="ban-btn"
                    onClick={() => handleBanEvent(eventId)}
                  >
                    🚫 Ban
                  </button>
                  <button
                    className="guests-btn"
                    onClick={() => navigate(`/event/${eventId}/guests`)}
                  >
                    📄 View Guests
                  </button>
                  <button
  className="guests-btn"
  onClick={() => navigate(`/event/${eventId}/qr`)}
>
  📎 Show Event QR
</button>

                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Feedback/Complaints */}
      <h3 style={{marginTop:'2rem'}}>Feedback & Complaints</h3>
      <div className="admin-feedback-list">
        {feedback.length === 0 ? <p>No feedback yet.</p> : feedback.map((f, idx) => (
          <div key={idx} className="admin-feedback-card">
            <span>{f.text}</span>
          </div>
        ))}
      </div>
      {/* Recent Activity Log */}
      <h3 style={{marginTop:'2rem'}}>Recent Activity</h3>
      <div className="admin-activity-log">
        {recentActivity.length === 0 ? <p>No recent activity.</p> : recentActivity.map((a, idx) => (
          <div key={idx} className="admin-activity-item">
            <span className="activity-type">[{a.type}]</span> {a.text} <span className="activity-time">{a.time && a.time.replace('T',' ').slice(0,16)}</span>
          </div>
        ))}
      </div>
      {/* Admin-Only Actions */}
      <div className="admin-only-actions" style={{margin:'2rem 0',padding:'1.5rem',background:'#f1f5f9',borderRadius:'12px'}}>
        <h3>Admin-Only Actions</h3>
        <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',marginBottom:'1rem'}}>
          <button className="approve-btn" onClick={()=>navigate('/new-admin')}>+ New Admin</button>
          <button className="update-btn" onClick={()=>navigate('/system-settings')}>⚙️ System Settings</button>
          <button className="ban-btn" disabled={exporting} onClick={()=>handleExport('events')}>⬇️ Export Events (CSV)</button>
          <button className="ban-btn" disabled={exporting} onClick={()=>handleExport('rsvps')}>⬇️ Export RSVPs (CSV)</button>
        </div>
        <div className="admin-analytics-cards" style={{display:'flex',gap:'2rem',flexWrap:'wrap'}}>
          <div className="admin-stat-card">🎟️ <strong>{analytics.ticketSales}</strong> Ticket Sales</div>
          <div className="admin-stat-card">✅ <strong>{analytics.checkInRate}</strong>% Check-in Rate</div>
        </div>
      </div>
      {/* New Admin Modal */}
      {showNewAdminModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth:'400px',maxHeight:'90vh',overflowY:'auto'}}>
            <h3>Create New Admin</h3>
            <form onSubmit={handleCreateAdmin} className="modal-form">
              <label>Name
                <input name="name" required />
              </label>
              <label>Email
                <input name="email" type="email" required />
              </label>
              <label>Password
                <input name="password" type="password" required />
              </label>
              <div style={{display:'flex',gap:'1rem',marginTop:'1rem'}}>
                <button type="submit" className="approve-btn">Create</button>
                <button type="button" className="delete-btn" onClick={()=>setShowNewAdminModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* System Settings Modal */}
      {/* Removed modal, now handled by page */}
    </div>
  );
};

export default AdminDashboard; 