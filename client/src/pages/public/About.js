import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const About = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await api.get('/public/about');
        setAboutData(res.data);
      } catch (error) {
        console.error('Failed to load about data');
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="public-page">
      <section className="page-header-section">
        <div className="container">
          <h1>About Us</h1>
          <p>Discover our story, mission, and values</p>
        </div>
      </section>

      <section className="about-intro">
        <div className="container">
          <div className="about-intro-grid">
            <div className="about-intro-content">
              <h2>{aboutData?.name || 'Excellence Academy'}</h2>
              <p className="about-motto">"{aboutData?.motto}"</p>
              <p>{aboutData?.description}</p>
              <div className="about-established">
                <strong>Established:</strong> {aboutData?.established} | <strong>Success Rate:</strong> {aboutData?.stats?.successRate}
              </div>
            </div>
            <div className="about-intro-stats">
              <div className="about-stat"><h3>{aboutData?.stats?.students}</h3><p>Students</p></div>
              <div className="about-stat"><h3>{aboutData?.stats?.teachers}</h3><p>Teachers</p></div>
              <div className="about-stat"><h3>{aboutData?.stats?.years}</h3><p>Years</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card">
              <h3>Our Mission</h3>
              <p>{aboutData?.mission}</p>
            </div>
            <div className="mission-card">
              <h3>Our Vision</h3>
              <p>{aboutData?.vision}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="container">
          <h2 className="section-title">Our Core Values</h2>
          <div className="values-grid">
            {aboutData?.values?.map((value, idx) => (
              <div key={idx} className="value-card">
                <div className="value-icon">{['🎯', '🤝', '💡', '🙏', '🏆', '❤️'][idx] || '⭐'}</div>
                <h4>{value}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="facilities-section">
        <div className="container">
          <h2 className="section-title">Our Facilities</h2>
          <div className="facilities-grid">
            {aboutData?.facilities?.map((facility, idx) => (
              <div key={idx} className="facility-card">
                <div className="facility-icon">{['🔬', '💻', '📚', '⚽', '🎨', '🎭'][idx] || '🏫'}</div>
                <p>{facility}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="achievements-section">
        <div className="container">
          <h2 className="section-title">Our Achievements</h2>
          <div className="achievements-list">
            {aboutData?.achievements?.map((achievement, idx) => (
              <div key={idx} className="achievement-item">
                <span className="achievement-icon">🏆</span>
                <span>{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
