import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Classes = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({ name: '', section: '', classTeacher: '', roomNumber: '', capacity: 40, academicYear: '2024-2025' });

  useEffect(() => { fetchClasses(); fetchTeachers(); }, []);

  const fetchClasses = async () => {
    try { const res = await api.get('/classes'); setClasses(res.data); }
    catch { toast.error('Failed to load classes'); } finally { setLoading(false); }
  };

  const fetchTeachers = async () => {
    try { const res = await api.get('/teachers'); setTeachers(res.data); } catch {}
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) { await api.put(`/classes/${editingClass._id}`, formData); toast.success('Updated!'); }
      else { await api.post('/classes', formData); toast.success('Added!'); }
      setShowModal(false); setEditingClass(null); resetForm(); fetchClasses();
    } catch { toast.error('Operation failed'); }
  };

  const handleEdit = (c) => { setEditingClass(c); setFormData(c); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/classes/${id}`); toast.success('Deleted!'); fetchClasses(); } catch {}
  };

  const resetForm = () => setFormData({ name: '', section: '', classTeacher: '', roomNumber: '', capacity: 40, academicYear: '2024-2025' });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Classes</h1><p className="page-subtitle">Manage all classes</p></div>
        {user?.role === 'admin' && <button className="btn btn-primary" onClick={() => { setEditingClass(null); resetForm(); setShowModal(true); }}>+ Add Class</button>}
      </div>
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Class</th><th>Section</th><th>Class Teacher</th><th>Room</th><th>Capacity</th><th>Year</th>{user?.role === 'admin' && <th>Actions</th>}</tr></thead>
            <tbody>
              {classes.length > 0 ? classes.map(c => (
                <tr key={c._id}><td>{c.name}</td><td>{c.section}</td><td>{c.classTeacher?.name || '-'}</td><td>{c.roomNumber || '-'}</td><td>{c.capacity}</td><td>{c.academicYear}</td>
                  {user?.role === 'admin' && <td><button className="btn btn-sm btn-outline" onClick={() => handleEdit(c)}>Edit</button> <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id)}>Del</button></td>}
                </tr>
              )) : <tr><td colSpan="7" className="text-center">No classes found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editingClass ? 'Edit' : 'Add'} Class</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Class Name *</label><input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required /></div>
                  <div className="form-group"><label className="form-label">Section *</label><input type="text" name="section" className="form-control" value={formData.section} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Class Teacher</label><select name="classTeacher" className="form-control" value={formData.classTeacher} onChange={handleChange}><option value="">Select</option>{teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Room Number</label><input type="text" name="roomNumber" className="form-control" value={formData.roomNumber} onChange={handleChange} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Capacity</label><input type="number" name="capacity" className="form-control" value={formData.capacity} onChange={handleChange} /></div>
                  <div className="form-group"><label className="form-label">Academic Year *</label><input type="text" name="academicYear" className="form-control" value={formData.academicYear} onChange={handleChange} required /></div>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editingClass ? 'Update' : 'Add'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
