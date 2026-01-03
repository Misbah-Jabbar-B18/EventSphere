import React, { useState } from 'react';

// Backend API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    venue: '',
    guests: '',
    description: '',
    category: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in as an organizer or admin to create events.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          date: formData.date,
          location: formData.venue,
          image: formData.image,
          isPublic: true,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || 'Failed to create event');
        setLoading(false);
        return;
      }

      console.log('Event Created (MongoDB):', data.event);
      alert(`Event "${data.event?.title || formData.title}" created successfully!`);

      // Reset form
      setFormData({
        title: '',
        date: '',
        venue: '',
        guests: '',
        description: '',
        category: '',
        image: '',
      });
    } catch (err) {
      console.error(err);
      alert('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        placeholder="Event Title"
        required
        onChange={handleChange}
        value={formData.title}
      />
      <input
        type="date"
        name="date"
        required
        onChange={handleChange}
        value={formData.date}
      />
      <input
        type="text"
        name="venue"
        placeholder="Venue"
        required
        onChange={handleChange}
        value={formData.venue}
      />
      <input
        type="number"
        name="guests"
        placeholder="Number of Guests"
        required
        onChange={handleChange}
        value={formData.guests}
      />
      <textarea
        name="description"
        placeholder="Event Description"
        required
        onChange={handleChange}
        value={formData.description}
      />
      <select
        name="category"
        required
        onChange={handleChange}
        value={formData.category}
      >
        <option value="">Select Category</option>
        <option value="Conference">Conference</option>
        <option value="Wedding">Wedding</option>
        <option value="Concert">Concert</option>
        <option value="Corporate Meeting">Corporate Meeting</option>
      </select>
      <input
        type="text"
        name="image"
        placeholder="Image URL"
        onChange={handleChange}
        value={formData.image}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
};

export default CreateEvent;
