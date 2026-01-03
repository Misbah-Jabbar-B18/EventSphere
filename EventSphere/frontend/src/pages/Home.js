import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventList from '../components/Events/EventList';
import './Home.css';

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-container">
      {/* Header Navigation */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <div className="logo">
            <h1>🎉 Event Sphere</h1>
          </div>
          <nav className="nav-menu">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/register" className="nav-link">Register</Link>
            <Link to="/login" className="nav-link login-btn">Login</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Plan. Manage. 
              <span className="highlight"> Celebrate.</span>
            </h1>
            <p className="hero-subtitle">
              Discover amazing events or create your own. Join thousands of people 
              celebrating life's special moments.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn primary-btn">Get Started</Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card">
              <div className="card-icon">🎪</div>
              <h3>Create Events</h3>
              <p>Easy event management</p>
            </div>
            <div className="floating-card">
              <div className="card-icon">🎫</div>
              <h3>Discover Events</h3>
              <p>Find amazing experiences</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="events-section">
        <div className="section-header">
          <h2>🎪 Featured Events</h2>
          <p>Discover the latest and most exciting events happening around you</p>
        </div>
        <div className="events-container">
          <EventList mode="home" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>✨ Why Choose Event Sphere?</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Easy to Use</h3>
            <p>Create and manage events with our intuitive interface</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Friendly</h3>
            <p>Access your events from anywhere, anytime</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>Your data is safe with our secure platform</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🎉 Event Sphere</h3>
            <p>Making event management simple and fun</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: habibaashfaq8@gmail.com</p>
            <p>Phone: +92 312 8581577</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Event Sphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
