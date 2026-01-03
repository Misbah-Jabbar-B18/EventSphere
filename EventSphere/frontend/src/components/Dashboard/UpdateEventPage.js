import React, { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import './Dashboard.css';

import './UpdateEventPage.css';



// Backend API base URL

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';



const UpdateEventPage = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const [form, setForm] = useState({

    title: '',

    date: '',

    category: '',

    description: '',

  });

  const [loading, setLoading] = useState(true);



  // Load event from backend (MongoDB Atlas)

  useEffect(() => {

    const fetchEvent = async () => {

      try {

        const res = await fetch(`${API_URL}/events/${id}`);

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {

          alert(data.message || 'Failed to load event');

          navigate(-1);

          return;

        }

        const event = data.event;

        setForm({

          title: event.title || '',

          date: event.date ? event.date.slice(0, 10) : '',

          category: event.category || '',

          description: event.description || '',

        });

      } catch (err) {

        console.error('Error loading event', err);

        alert('Failed to load event. Please try again.');

        navigate(-1);

      } finally {

        setLoading(false);

      }

    };



    if (id) {

      fetchEvent();

    } else {

      setLoading(false);

    }

  }, [id, navigate]);



  const handleChange = (e) => {

    setForm({ ...form, [e.target.name]: e.target.value });

  };



  // Save changes to backend (MongoDB Atlas)

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const token = localStorage.getItem('token');

      if (!token) {

        alert('You must be logged in as an organizer or admin to update events.');

        return;

      }



      const res = await fetch(`${API_URL}/events/${id}`, {

        method: 'PUT',

        headers: {

          'Content-Type': 'application/json',

          Authorization: `Bearer ${token}`,

        },

        body: JSON.stringify({

          title: form.title,

          date: form.date,

          category: form.category,

          description: form.description,

        }),

      });



      const data = await res.json().catch(() => ({}));

      if (!res.ok) {

        alert(data.message || 'Failed to update event');

        return;

      }



      alert('Event updated successfully.');

      navigate(-1); // Go back to previous page (dashboard)

    } catch (err) {

      console.error('Error updating event', err);

      alert('Failed to update event. Please try again.');

    }

  };



  if (loading) return <div>Loading...</div>;



  return (

    <div className="update-event-page">

      <div className="update-event-card">

        <h2 className="update-event-title">Edit Event</h2>

        <form onSubmit={handleSubmit} className="modal-form">

          <label>

            Title

            <input name="title" value={form.title} onChange={handleChange} required />

          </label>

          <label>

            Date

            <input name="date" type="date" value={form.date} onChange={handleChange} required />

          </label>

          <label>

            Category

            <select name="category" value={form.category} onChange={handleChange} required>

              <option value="Conference">Conference</option>

              <option value="Wedding">Wedding</option>

              <option value="Birthday">Birthday</option>

              <option value="Concert">Concert</option>

              <option value="Corporate Meeting">Corporate Meeting</option>

              <option value="Other">Other</option>

            </select>

          </label>

          <label>

            Description

            <textarea

              name="description"

              value={form.description}

              onChange={handleChange}

              rows={3}

            />

          </label>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>

            <button type="submit" className="approve-btn">

              Save

            </button>

            <button type="button" className="delete-btn" onClick={() => navigate(-1)}>

              Cancel

            </button>

          </div>

        </form>

      </div>

    </div>

  );

};



export default UpdateEventPage;

