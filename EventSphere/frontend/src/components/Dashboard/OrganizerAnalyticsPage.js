import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import './Dashboard.css';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

const OrganizerAnalyticsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(JSON.parse(localStorage.getItem('currentUser')));
    setEvents(JSON.parse(localStorage.getItem('events')) || []);
    setRsvps(JSON.parse(localStorage.getItem('rsvps')) || []);
    setFeedbacks(JSON.parse(localStorage.getItem('feedback')) || []);
  }, []);

  // Only organizer's events
  const myEvents = useMemo(() => {
    if (!currentUser) return [];
    return events.filter(ev => ev.organizerEmail === currentUser.email);
  }, [events, currentUser]);

  // RSVP vs Check-in data
  const rsvpCheckinData = useMemo(() => {
    return myEvents.map(ev => {
      const eventRsvps = rsvps.filter(r => r.eventId === ev.id);
      const totalRSVP = eventRsvps.length;
      const totalCheckin = eventRsvps.filter(r => r.checkedIn).length;
      return { title: ev.title, totalRSVP, totalCheckin };
    });
  }, [myEvents, rsvps]);

  // Feedback rating average per event
  const feedbackAverages = useMemo(() => {
    return myEvents.map(ev => {
      const eventFeedbacks = feedbacks.filter(f => f.eventId === ev.id && typeof f.rating === 'number');
      const avg = eventFeedbacks.length ? (eventFeedbacks.reduce((a, b) => a + b.rating, 0) / eventFeedbacks.length).toFixed(2) : 'N/A';
      return { title: ev.title, avg };
    });
  }, [myEvents, feedbacks]);

  // Attendance trend (check-ins over time)
  const attendanceTrend = useMemo(() => {
    // For simplicity, show total check-ins per event date
    return myEvents.map(ev => {
      const eventRsvps = rsvps.filter(r => r.eventId === ev.id && r.checkedIn);
      return { title: ev.title, date: ev.date, count: eventRsvps.length };
    });
  }, [myEvents, rsvps]);

  // Export stats as CSV
  const handleExport = () => {
    let csv = 'Event,Total RSVP,Total Check-in,Feedback Avg\n';
    myEvents.forEach(ev => {
      const rsvp = rsvpCheckinData.find(d => d.title === ev.title);
      const fb = feedbackAverages.find(f => f.title === ev.title);
      csv += `${ev.title},${rsvp?.totalRSVP || 0},${rsvp?.totalCheckin || 0},${fb?.avg || 'N/A'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event_analytics.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="analytics-page" style={{minHeight:'100vh',background:'#f8fafc',padding:'2rem 0'}}>
      <div className="modal-content" style={{maxWidth:'900px',margin:'2rem auto',maxHeight:'95vh',overflowY:'auto'}}>
        <h2 style={{textAlign:'center',color:'#2563eb'}}>Event Analytics</h2>
        <button className="guests-btn" style={{marginBottom:'1.5rem'}} onClick={() => navigate(-1)}>Back</button>
        {/* RSVP vs Check-in Chart */}
        <h3>📊 RSVP vs Check-in</h3>
        <Bar
          data={{
            labels: rsvpCheckinData.map(d => d.title),
            datasets: [
              { label: 'RSVP', data: rsvpCheckinData.map(d => d.totalRSVP), backgroundColor: '#38bdf8' },
              { label: 'Check-in', data: rsvpCheckinData.map(d => d.totalCheckin), backgroundColor: '#10b981' },
            ],
          }}
          options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
        />
        {/* Feedback Rating Average */}
        <h3 style={{marginTop:'2rem'}}>👍 Feedback Rating Average</h3>
        <Pie
          data={{
            labels: feedbackAverages.map(f => f.title),
            datasets: [
              { label: 'Avg Rating', data: feedbackAverages.map(f => f.avg === 'N/A' ? 0 : Number(f.avg)), backgroundColor: ['#2563eb','#10b981','#f59e0b','#f87171','#38bdf8'] },
            ],
          }}
          options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
        />
        {/* Attendance Trend */}
        <h3 style={{marginTop:'2rem'}}>📈 Attendance Trend</h3>
        <Line
          data={{
            labels: attendanceTrend.map(a => a.title + ' (' + a.date + ')'),
            datasets: [
              { label: 'Check-ins', data: attendanceTrend.map(a => a.count), borderColor: '#2563eb', backgroundColor: '#93c5fd', tension: 0.3 },
            ],
          }}
          options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
        />
        {/* Export Stats */}
        <div style={{marginTop:'2.5rem',textAlign:'right'}}>
          <button className="guests-btn" onClick={handleExport}>📥 Export Stats (CSV)</button>
        </div>
      </div>
    </div>
  );
};

export default OrganizerAnalyticsPage; 