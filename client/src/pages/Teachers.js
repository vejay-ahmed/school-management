import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Teachers = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({ name: '', employeeId: '', qualification: '', experience: '', phone: '', email: '' });

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try { const res = await api.get('/teachers', { params: { search } }); setTeachers(res.data); }
    catch { toast.error('Failed to load teachers'); } finally { setLoading(false); }
  };

  useEffect(() => { if (search) { const t = setTimeout(fetchTeachers, 500); return () => clearTimeout(t); } }, [search]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) { await api.put(`/teachers/${editingTeacher._id}`, formData); toast.success('Updated!'); }
      else { await api.post('/teachers', formData); toast.success('Added!'); }
      setShowModal(false); setEditingTeacher(null); resetForm(); fetchTeachers();
    } catch { toast.error('Operation failed'); }
  };

  const handleEdit = (t) => { setEditingTeacher(t); setFormData(t); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/teachers/${id}`); toast.success('Deleted!'); fetchTeachers(); } catch {}
  };

  const resetForm = () => setFormData({ name: '', employeeId: '', qualification: '', experience: '', phone: '', email: '' });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Teachers</h1><p className="page-subtitle">Manage all teachers</p></div>
        {user?.role === 'admin' && <button className="btn btn-primary" onClick={() => { setEditingTeacher(null); resetForm(); setShowModal(true); }}>+ Add Teacher</button>}
      </div>
      <div className="search-bar">
        <input type="text" className="form-control search-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Emp ID</th><th>Name</th><th>Qualification</th><th>Experience</th><th>Phone</th><th>Email</th>{user?.role === 'admin' && <th>Actions</th>}</tr></thead>
            <tbody>
              {teachers.length > 0 ? teachers.map(t => (
                <tr key={t._id}><td>{t.employeeId}</td><td>{t.name}</td><td>{t.qualification}</td><td>{t.experience} yrs</td><td>{t.phone}</td><td>{t.email}</td>
                  {user?.role === 'admin' && <td><button className="btn btn-sm btn-outline" onClick={() => handleEdit(t)}>Edit</button> <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t._id)}>Del</button></td>}
                </tr>
              )) : <tr><td colSpan="7" className="text-center">No teachers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editingTeacher ? 'Edit' : 'Add'} Teacher</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Name *</label><input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required /></div>
                  <div className="form-group"><label className="form-label">Employee ID *</label><input type="text" name="employeeId" className="form-control" value={formData.employeeId} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Qualification *</label><input type="text" name="qualification" className="form-control" value={formData.qualification} onChange={handleChange} required /></div>
                  <div className="form-group"><label className="form-label">Experience (Years)</label><input type="number" name="experience" className="form-control" value={formData.experience} onChange={handleChange} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Phone *</label><input type="tel" name="phone" className="form-control" value={formData.phone} onChange={handleChange} required /></div>
                  <div className="form-group"><label className="form-label">Email *</label><input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required /></div>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editingTeacher ? 'Update' : 'Add'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
