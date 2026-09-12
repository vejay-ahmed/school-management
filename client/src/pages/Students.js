import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({ name: '', rollNo: '', class: '', section: '', dateOfBirth: '', gender: '', parentName: '', parentPhone: '', contactNumber: '' });

  useEffect(() => { fetchStudents(); fetchClasses(); }, []);

  const fetchStudents = async () => {
    try { const res = await api.get('/students', { params: { search } }); setStudents(res.data); }
    catch { toast.error('Failed to load students'); } finally { setLoading(false); }
  };

  const fetchClasses = async () => {
    try { const res = await api.get('/classes'); setClasses(res.data); } catch {}
  };

  useEffect(() => { if (search) { const t = setTimeout(fetchStudents, 500); return () => clearTimeout(t); } }, [search]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) { await api.put(`/students/${editingStudent._id}`, formData); toast.success('Updated!'); }
      else { await api.post('/students', formData); toast.success('Added!'); }
      setShowModal(false); setEditingStudent(null); resetForm(); fetchStudents();
    } catch { toast.error('Operation failed'); }
  };

  const handleEdit = (s) => { setEditingStudent(s); setFormData(s); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/students/${id}`); toast.success('Deleted!'); fetchStudents(); } catch {}
  };

  const resetForm = () => setFormData({ name: '', rollNo: '', class: '', section: '', dateOfBirth: '', gender: '', parentName: '', parentPhone: '', contactNumber: '' });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Students</h1><p className="page-subtitle">Manage all students</p></div>
        {user?.role === 'admin' && <button className="btn btn-primary" onClick={() => { setEditingStudent(null); resetForm(); setShowModal(true); }}>+ Add Student</button>}
      </div>
      <div className="search-bar">
        <input type="text" className="form-control search-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Roll No</th><th>Name</th><th>Class</th><th>Section</th><th>Parent</th><th>Contact</th>{user?.role === 'admin' && <th>Actions</th>}</tr></thead>
            <tbody>
              {students.length > 0 ? students.map(s => (
                <tr key={s._id}><td>{s.rollNo}</td><td>{s.name}</td><td>{s.class?.name}</td><td>{s.section}</td><td>{s.parentName}</td><td>{s.contactNumber}</td>
                  {user?.role === 'admin' && <td><button className="btn btn-sm btn-outline" onClick={() => handleEdit(s)}>Edit</button> <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s._id)}>Del</button></td>}
                </tr>
              )) : <tr><td colSpan="7" className="text-center">No students found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <StudentModal editingStudent={editingStudent} classes={classes} formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} setShowModal={setShowModal} />}
    </div>
  );
};

export default Students;

const GRADES = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
const SECTIONS = ['A', 'B', 'C', 'D'];

export const StudentModal = ({ editingStudent, classes, formData, handleChange, handleSubmit, setShowModal }) => (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header"><h3>{editingStudent ? 'Edit' : 'Add'} Student</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group"><label className="form-label">Name *</label><input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Roll No *</label><input type="text" name="rollNo" className="form-control" value={formData.rollNo} onChange={handleChange} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Class/Grade *</label><select name="class" className="form-control" value={formData.class} onChange={handleChange} required><option value="">Select Grade</option>{GRADES.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Section *</label><select name="section" className="form-control" value={formData.section} onChange={handleChange} required><option value="">Select Section</option>{SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">DOB *</label><input type="date" name="dateOfBirth" className="form-control" value={formData.dateOfBirth?.split('T')[0]} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Gender *</label><select name="gender" className="form-control" value={formData.gender} onChange={handleChange} required><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Parent Name *</label><input type="text" name="parentName" className="form-control" value={formData.parentName} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Parent Phone *</label><input type="tel" name="parentPhone" className="form-control" value={formData.parentPhone} onChange={handleChange} required /></div>
          </div>
          <div className="form-group"><label className="form-label">Contact *</label><input type="tel" name="contactNumber" className="form-control" value={formData.contactNumber} onChange={handleChange} required /></div>
        </div>
        <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editingStudent ? 'Update' : 'Add'}</button></div>
      </form>
    </div>
  </div>
);
