import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Home = () => {
  const [homeData, setHomeData] = useState({ featuredNews: [], upcomingEvents: [], featuredEvent: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/public/home');
        setHomeData(res.data);
      } catch (error) {
        console.error('Failed to load home data');
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="public-page">
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Welcome to Excellence Academy</h1>
          <p>Empowering Future Leaders Through Quality Education</p>
          <div className="hero-buttons">
            <Link to="/admission" className="btn btn-primary btn-lg">Apply for Admission</Link>
            <Link to="/about" className="btn btn-outline btn-lg hero-btn-outline">Learn More</Link>
          </div>
        </div>
      </section>
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item"><div className="stat-number">2000+</div><div className="stat-label">Students</div></div>
            <div className="stat-item"><div className="stat-number">150+</div><div className="stat-label">Teachers</div></div>
            <div className="stat-item"><div className="stat-number">30+</div><div className="stat-label">Years</div></div>
            <div className="stat-item"><div className="stat-number">98%</div><div className="stat-label">Success Rate</div></div>
          </div>
        </div>
      </section>
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card"><div className="feature-icon">🎓</div><h3>Academic Excellence</h3><p>Rigorous curriculum designed to challenge and inspire.</p></div>
            <div className="feature-card"><div className="feature-icon">👨‍🏫</div><h3>Expert Faculty</h3><p>Highly qualified and dedicated teachers.</p></div>
            <div className="feature-card"><div className="feature-icon">🏫</div><h3>Modern Facilities</h3><p>State-of-the-art labs and smart classrooms.</p></div>
            <div className="feature-card"><div className="feature-icon">🌟</div><h3>Holistic Development</h3><p>Academic, physical, and character growth.</p></div>
          </div>
        </div>
      </section>
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Join Our Community?</h2>
            <p>Begin your journey to excellence. Apply for admission today!</p>
            <Link to="/admission" className="btn btn-primary btn-lg">Apply Now</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
