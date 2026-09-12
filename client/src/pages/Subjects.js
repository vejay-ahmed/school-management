import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Subjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({ name: '', code: '', teacher: '', class: '', creditHours: 1 });

  useEffect(() => { fetchSubjects(); fetchTeachers(); fetchClasses(); }, []);

  const fetchSubjects = async () => {
    try { const res = await api.get('/subjects'); setSubjects(res.data); }
    catch { toast.error('Failed to load subjects'); } finally { setLoading(false); }
  };

  const fetchTeachers = async () => {
    try { const res = await api.get('/teachers'); setTeachers(res.data); } catch {}
  };

  const fetchClasses = async () => {
    try { const res = await api.get('/classes'); setClasses(res.data); } catch {}
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) { await api.put(`/subjects/${editingSubject._id}`, formData); toast.success('Updated!'); }
      else { await api.post('/subjects', formData); toast.success('Added!'); }
      setShowModal(false); setEditingSubject(null); resetForm(); fetchSubjects();
    } catch { toast.error('Operation failed'); }
  };

  const handleEdit = (s) => { setEditingSubject(s); setFormData(s); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/subjects/${id}`); toast.success('Deleted!'); fetchSubjects(); } catch {}
  };

  const resetForm = () => setFormData({ name: '', code: '', teacher: '', class: '', creditHours: 1 });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Subjects</h1><p className="page-subtitle">Manage all subjects</p></div>
        {user?.role === 'admin' && <button className="btn btn-primary" onClick={() => { setEditingSubject(null); resetForm(); setShowModal(true); }}>+ Add Subject</button>}
      </div>
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Code</th><th>Name</th><th>Class</th><th>Teacher</th><th>Credits</th>{user?.role === 'admin' && <th>Actions</th>}</tr></thead>
            <tbody>
              {subjects.length > 0 ? subjects.map(s => (
                <tr key={s._id}><td>{s.code}</td><td>{s.name}</td><td>{s.class?.name} - {s.class?.section}</td><td>{s.teacher?.name || '-'}</td><td>{s.creditHours}</td>
                  {user?.role === 'admin' && <td><button className="btn btn-sm btn-outline" onClick={() => handleEdit(s)}>Edit</button> <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s._id)}>Del</button></td>}
                </tr>
              )) : <tr><td colSpan="6" className="text-center">No subjects found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editingSubject ? 'Edit' : 'Add'} Subject</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Name *</label><input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required /></div>
                  <div className="form-group"><label className="form-label">Code *</label><input type="text" name="code" className="form-control" value={formData.code} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Class *</label><select name="class" className="form-control" value={formData.class} onChange={handleChange} required><option value="">Select</option>{classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Teacher</label><select name="teacher" className="form-control" value={formData.teacher} onChange={handleChange}><option value="">Select</option>{teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
                </div>
                <div className="form-group"><label className="form-label">Credit Hours</label><input type="number" name="creditHours" className="form-control" value={formData.creditHours} onChange={handleChange} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editingSubject ? 'Update' : 'Add'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
