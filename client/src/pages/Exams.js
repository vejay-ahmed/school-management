import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Exams = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({ name: '', examType: 'unit_test', class: '', subject: '', date: '', totalMarks: 100, passingMarks: 40, academicYear: '2024-2025' });

  useEffect(() => { fetchExams(); fetchClasses(); fetchSubjects(); }, []);

  const fetchExams = async () => {
    try { const res = await api.get('/exams'); setExams(res.data); }
    catch { toast.error('Failed to load exams'); } finally { setLoading(false); }
  };

  const fetchClasses = async () => { try { const res = await api.get('/classes'); setClasses(res.data); } catch {} };
  const fetchSubjects = async () => { try { const res = await api.get('/subjects'); setSubjects(res.data); } catch {} };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExam) { await api.put(`/exams/${editingExam._id}`, formData); toast.success('Updated!'); }
      else { await api.post('/exams', formData); toast.success('Added!'); }
      setShowModal(false); setEditingExam(null); resetForm(); fetchExams();
    } catch { toast.error('Operation failed'); }
  };

  const handleEdit = (ex) => { setEditingExam(ex); setFormData(ex); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/exams/${id}`); toast.success('Deleted!'); fetchExams(); } catch {}
  };

  const resetForm = () => setFormData({ name: '', examType: 'unit_test', class: '', subject: '', date: '', totalMarks: 100, passingMarks: 40, academicYear: '2024-2025' });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Examinations</h1><p className="page-subtitle">Manage exams</p></div>
        {user?.role === 'admin' && <button className="btn btn-primary" onClick={() => { setEditingExam(null); resetForm(); setShowModal(true); }}>+ Add Exam</button>}
      </div>
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Name</th><th>Type</th><th>Class</th><th>Subject</th><th>Date</th><th>Marks</th>{user?.role === 'admin' && <th>Actions</th>}</tr></thead>
            <tbody>
              {exams.length > 0 ? exams.map(ex => (
                <tr key={ex._id}><td>{ex.name}</td><td><span className="badge badge-info">{ex.examType?.replace('_', ' ')}</span></td><td>{ex.class?.name}</td><td>{ex.subject?.name}</td><td>{new Date(ex.date).toLocaleDateString()}</td><td>{ex.totalMarks}</td>
                  {user?.role === 'admin' && <td><button className="btn btn-sm btn-outline" onClick={() => handleEdit(ex)}>Edit</button> <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ex._id)}>Del</button></td>}
                </tr>
              )) : <tr><td colSpan="7" className="text-center">No exams found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <ExamModal editingExam={editingExam} classes={classes} subjects={subjects} formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} setShowModal={setShowModal} />}
    </div>
  );
};

export default Exams;

export const ExamModal = ({ editingExam, classes, subjects, formData, handleChange, handleSubmit, setShowModal }) => (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header"><h3>{editingExam ? 'Edit' : 'Add'} Exam</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group"><label className="form-label">Name *</label><input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Type</label><select name="examType" className="form-control" value={formData.examType} onChange={handleChange}><option value="unit_test">Unit Test</option><option value="mid_term">Mid Term</option><option value="final">Final</option></select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Class *</label><select name="class" className="form-control" value={formData.class} onChange={handleChange} required><option value="">Select</option>{classes.map(c => <option key={c._id} value={c._id}>{c.name}-{c.section}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Subject *</label><select name="subject" className="form-control" value={formData.subject} onChange={handleChange} required><option value="">Select</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Date *</label><input type="date" name="date" className="form-control" value={formData.date?.split('T')[0]} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Year *</label><input type="text" name="academicYear" className="form-control" value={formData.academicYear} onChange={handleChange} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Total *</label><input type="number" name="totalMarks" className="form-control" value={formData.totalMarks} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Passing *</label><input type="number" name="passingMarks" className="form-control" value={formData.passingMarks} onChange={handleChange} required /></div>
          </div>
        </div>
        <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editingExam ? 'Update' : 'Add'}</button></div>
      </form>
    </div>
  </div>
);
