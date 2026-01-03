import React, { useState } from 'react';
import './Dashboard.css';

const UpdateEventModal = ({ event, onClose, onUpdate }) => {
  const [form, setForm] = useState({
    title: event.title,
    date: event.date,
    category: event.category,
    description: event.description,
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    let allEvents = JSON.parse(localStorage.getItem('events')) || [];
    allEvents = allEvents.map(ev =>
      ev.id === event.id ? { ...ev, ...form } : ev
    );
    localStorage.setItem('events', JSON.stringify(allEvents));
    onUpdate();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{maxWidth:'400px',maxHeight:'90vh',overflowY:'auto'}}>
        <h3>Edit Event</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>
          <label>Date
            <input name="date" type="date" value={form.date} onChange={handleChange} required />
          </label>
          <label>Category
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="Conference">Conference</option>
              <option value="Wedding">Wedding</option>
              <option value="Birthday">Birthday</option>
              <option value="Concert">Concert</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label>Description
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </label>
          <div style={{display:'flex',gap:'1rem',marginTop:'1rem'}}>
            <button type="submit" className="approve-btn">Save</button>
            <button type="button" className="delete-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateEventModal; 