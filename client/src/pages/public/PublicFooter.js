import React from 'react';
import { Link } from 'react-router-dom';

const PublicFooter = () => {
  return (
    <footer className="public-footer">
      <div className="public-footer-container">
        <div className="public-footer-grid">
          <div className="public-footer-section">
            <h3>Excellence Academy</h3>
            <p>Empowering Future Leaders through quality education, innovation, and character development since 1995.</p>
            <div className="public-footer-social">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="YouTube">▶️</a>
            </div>
          </div>
          <div className="public-footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/admission">Admission</Link></li>
              <li><Link to="/news-events">News & Events</Link></li>
            </ul>
          </div>
          <div className="public-footer-section">
            <h4>Admissions</h4>
            <ul>
              <li><Link to="/admission">Apply Now</Link></li>
              <li><Link to="/admission#requirements">Requirements</Link></li>
              <li><Link to="/admission#fees">Fee Structure</Link></li>
              <li><Link to="/admission#status">Check Status</Link></li>
            </ul>
          </div>
          <div className="public-footer-section">
            <h4>Contact Us</h4>
            <ul className="contact-info">
              <li>📍 123 Education Street, City</li>
              <li>+254712091212</li>
              <li>✉️ info@mohaschool.au.kc</li>
              <li>🕐 Mon-Fri: 8:00 AM - 4:00 PM</li>
            </ul>
          </div>
        </div>
        <div className="public-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Excellence Academy. All rights reserved.</p>
          <div className="public-footer-bottom-links">
            <Link to="/login">Staff Login</Link>
            <span>|</span>
            <a href="#">Privacy Policy</a>
            <span>|</span>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
