import React from 'react';
import EventList from '../Events/EventList';

const DiscoverEventsPage = ({ eventListKey, handleRSVP, userRSVPs }) => {
  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>🎪 Discover Confirmed Events</h2>
        <p className="section-subtitle">Browse and RSVP for upcoming confirmed events from MongoDB Atlas</p>
      </div>
      <EventList 
        key={`discover-${eventListKey}`}
        mode="attendee"
        showOnlyConfirmed={true}
        onRSVP={handleRSVP}
        userRSVPs={userRSVPs}
      />
    </div>
  );
};

export default DiscoverEventsPage;