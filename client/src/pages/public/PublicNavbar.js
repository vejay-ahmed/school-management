import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="public-navbar">
      <div className="public-nav-container">
        <Link to="/" className="public-nav-brand">
          <div className="public-nav-logo">E</div>
          <span>Excellence Academy</span>
        </Link>
        <button className="public-nav-toggle" onClick={() => setIsOpen(!isOpen)}>
          <span className={`hamburger ${isOpen ? 'open' : ''}`}></span>
        </button>
        <div className={`public-nav-links ${isOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link>
          <Link to="/admission" className={isActive('/admission') ? 'active' : ''}>Admission</Link>
          <Link to="/news-events" className={isActive('/news-events') ? 'active' : ''}>News & Events</Link>
          <Link to="/login" className="public-nav-login">Login</Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
