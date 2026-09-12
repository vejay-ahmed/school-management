import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const NewsEvents = () => {
  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [n, e] = await Promise.all([api.get('/public/news'), api.get('/public/events')]);
        setNews(n.data.news || []);
        setEvents(e.data || []);
      } catch (error) { console.error('Failed to load'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="public-page">
      <section className="page-header-section"><div className="container"><h1>News & Events</h1><p>Stay updated with our latest news and upcoming events</p></div></section>
      <section className="news-events-section"><div className="container">
        <div className="news-events-tabs">
          <button className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>Latest News</button>
          <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>Upcoming Events</button>
        </div>
        {activeTab === 'news' && (
          <div className="news-grid">
            {news.length > 0 ? news.map(item => (
              <div key={item._id} className="news-card" onClick={() => setSelectedNews(item)}>
                <div className="news-category">{item.category}</div>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <div className="news-meta"><span>By {item.author?.name}</span><span>{new Date(item.createdAt).toLocaleDateString()}</span></div>
              </div>
            )) : <div className="empty-state"><p>No news available</p></div>}
          </div>
        )}
        {activeTab === 'events' && (
          <div className="events-grid">
            {events.length > 0 ? events.map(event => (
              <div key={event._id} className="event-card" onClick={() => setSelectedEvent(event)}>
                <div className="event-date">
                  <div className="event-day">{new Date(event.startDate).getDate()}</div>
                  <div className="event-month">{new Date(event.startDate).toLocaleDateString('en', { month: 'short' })}</div>
                </div>
                <div className="event-info">
                  <span className="event-category">{event.category}</span>
                  <h4>{event.title}</h4>
                  <p>{event.description?.substring(0, 100)}...</p>
                  {event.location && <p className="event-location">Location: {event.location}</p>}
                </div>
              </div>
            )) : <div className="empty-state"><p>No events available</p></div>}
          </div>
        )}
      </div></section>
      {selectedNews && (
        <div className="modal-overlay" onClick={() => setSelectedNews(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{selectedNews.title}</h3><button className="modal-close" onClick={() => setSelectedNews(null)}>X</button></div>
            <div className="modal-body"><p>{selectedNews.content}</p></div>
          </div>
        </div>
      )}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{selectedEvent.title}</h3><button className="modal-close" onClick={() => setSelectedEvent(null)}>X</button></div>
            <div className="modal-body">
              <p>{selectedEvent.description}</p>
              <p><strong>Date:</strong> {new Date(selectedEvent.startDate).toLocaleDateString()}</p>
              {selectedEvent.location && <p><strong>Location:</strong> {selectedEvent.location}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsEvents;
