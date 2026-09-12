import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const News = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', excerpt: '', category: 'general', tags: '', isPublished: true });

  useEffect(() => { fetchNews(); }, []);

  const fetchNews = async () => {
    try { const res = await api.get('/news/admin/all'); setNews(res.data); }
    catch { toast.error('Failed to load news'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/news/${editing._id}`, formData); toast.success('Updated!'); }
      else { await api.post('/news', formData); toast.success('Added!'); }
      setShowModal(false); setEditing(null); resetForm(); fetchNews();
    } catch { toast.error('Operation failed'); }
  };

  const handleEdit = (item) => { setEditing(item); setFormData({ title: item.title, content: item.content, excerpt: item.excerpt, category: item.category, tags: item.tags?.join(', '), isPublished: item.isPublished }); setShowModal(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/news/${id}`); toast.success('Deleted!'); fetchNews(); } catch {} };
  const resetForm = () => setFormData({ title: '', content: '', excerpt: '', category: 'general', tags: '', isPublished: true });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">News Management</h1><p className="page-subtitle">Add and manage news articles</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}>+ Add News</button>
      </div>
      <div className="card"><div className="table-container"><table className="table">
        <thead><tr><th>Title</th><th>Category</th><th>Author</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>{news.length > 0 ? news.map(item => (
          <tr key={item._id}><td>{item.title}</td><td><span className="badge badge-info">{item.category}</span></td><td>{item.author?.name}</td><td><span className={`badge badge-${item.isPublished ? 'success' : 'warning'}`}>{item.isPublished ? 'Published' : 'Draft'}</span></td><td>{new Date(item.createdAt).toLocaleDateString()}</td>
            <td><button className="btn btn-sm btn-outline" onClick={() => handleEdit(item)}>Edit</button> <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item._id)}>Del</button></td>
          </tr>)) : <tr><td colSpan="6" className="text-center">No news found</td></tr>}</tbody>
      </table></div></div>
      {showModal && (<div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header"><h3>{editing ? 'Edit' : 'Add'} News</h3><button className="modal-close" onClick={() => setShowModal(false)}>X</button></div>
        <form onSubmit={handleSubmit}><div className="modal-body">
          <div className="form-group"><label className="form-label">Title *</label><input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required /></div>
          <div className="form-row"><div className="form-group"><label className="form-label">Category</label><select name="category" className="form-control" value={formData.category} onChange={handleChange}><option value="general">General</option><option value="announcement">Announcement</option><option value="achievement">Achievement</option><option value="urgent">Urgent</option></select></div>
            <div className="form-group"><label className="form-label">Status</label><select name="isPublished" className="form-control" value={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === 'true' })}><option value="true">Published</option><option value="false">Draft</option></select></div></div>
          <div className="form-group"><label className="form-label">Excerpt</label><textarea name="excerpt" className="form-control" rows="2" value={formData.excerpt} onChange={handleChange} /></div>
          <div className="form-group"><label className="form-label">Content *</label><textarea name="content" className="form-control" rows="5" value={formData.content} onChange={handleChange} required /></div>
          <div className="form-group"><label className="form-label">Tags (comma separated)</label><input type="text" name="tags" className="form-control" value={formData.tags} onChange={handleChange} /></div>
        </div><div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button></div></form>
      </div></div>)}
    </div>
  );
};

export default News;
