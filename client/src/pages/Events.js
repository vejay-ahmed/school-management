import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'other', startDate: '', endDate: '', location: '', organizer: '', isPublished: true, featured: false });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try { const res = await api.get('/events/admin/all'); setEvents(res.data); }
    catch { toast.error('Failed to load events'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/events/${editing._id}`, formData); toast.success('Updated!'); }
      else { await api.post('/events', formData); toast.success('Added!'); }
      setShowModal(false); setEditing(null); resetForm(); fetchEvents();
    } catch { toast.error('Operation failed'); }
  };

  const handleEdit = (item) => { setEditing(item); setFormData({ title: item.title, description: item.description, category: item.category, startDate: item.startDate?.split('T')[0], endDate: item.endDate?.split('T')[0], location: item.location || '', organizer: item.organizer || '', isPublished: item.isPublished, featured: item.featured }); setShowModal(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/events/${id}`); toast.success('Deleted!'); fetchEvents(); } catch {} };
  const resetForm = () => setFormData({ title: '', description: '', category: 'other', startDate: '', endDate: '', location: '', organizer: '', isPublished: true, featured: false });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Events Management</h1><p className="page-subtitle">Add and manage school events</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}>+ Add Event</button>
      </div>
      <div className="card"><div className="table-container"><table className="table">
        <thead><tr><th>Title</th><th>Category</th><th>Start</th><th>End</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{events.length > 0 ? events.map(item => (
          <tr key={item._id}><td>{item.title}</td><td><span className="badge badge-info">{item.category}</span></td><td>{new Date(item.startDate).toLocaleDateString()}</td><td>{new Date(item.endDate).toLocaleDateString()}</td><td>{item.location || '-'}</td><td><span className={`badge badge-${item.isPublished ? 'success' : 'warning'}`}>{item.isPublished ? 'Published' : 'Draft'}</span></td>
            <td><button className="btn btn-sm btn-outline" onClick={() => handleEdit(item)}>Edit</button> <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item._id)}>Del</button></td>
          </tr>)) : <tr><td colSpan="7" className="text-center">No events found</td></tr>}</tbody>
      </table></div></div>
      {showModal && (<div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header"><h3>{editing ? 'Edit' : 'Add'} Event</h3><button className="modal-close" onClick={() => setShowModal(false)}>X</button></div>
        <form onSubmit={handleSubmit}><div className="modal-body">
          <div className="form-group"><label className="form-label">Title *</label><input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required /></div>
          <div className="form-row"><div className="form-group"><label className="form-label">Category</label><select name="category" className="form-control" value={formData.category} onChange={handleChange}><option value="academic">Academic</option><option value="sports">Sports</option><option value="cultural">Cultural</option><option value="holiday">Holiday</option><option value="meeting">Meeting</option><option value="other">Other</option></select></div>
            <div className="form-group"><label className="form-label">Location</label><input type="text" name="location" className="form-control" value={formData.location} onChange={handleChange} /></div></div>
          <div className="form-row"><div className="form-group"><label className="form-label">Start Date *</label><input type="date" name="startDate" className="form-control" value={formData.startDate} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">End Date *</label><input type="date" name="endDate" className="form-control" value={formData.endDate} onChange={handleChange} required /></div></div>
          <div className="form-group"><label className="form-label">Organizer</label><input type="text" name="organizer" className="form-control" value={formData.organizer} onChange={handleChange} /></div>
          <div className="form-group"><label className="form-label">Description *</label><textarea name="description" className="form-control" rows="4" value={formData.description} onChange={handleChange} required /></div>
          <div className="form-row"><div className="form-group"><label className="form-label">Status</label><select name="isPublished" className="form-control" value={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === 'true' })}><option value="true">Published</option><option value="false">Draft</option></select></div>
            <div className="form-group"><label className="form-label">Featured</label><select name="featured" className="form-control" value={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.value === 'true' })}><option value="false">No</option><option value="true">Yes</option></select></div></div>
        </div><div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button></div></form>
      </div></div>)}
    </div>
  );
};

export default Events;
