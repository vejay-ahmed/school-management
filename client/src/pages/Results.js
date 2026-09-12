import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Results = () => {
  const { user } = useAuth();
  const location = useLocation();
  const childId = new URLSearchParams(location.search || '').get('child');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({ student: '', exam: '', subject: '', class: '', marksObtained: '', totalMarks: '', academicYear: '2024-2025' });
  // Parent child-switcher state
  const [myChildren, setMyChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(childId || '');

  const fetchParentChildren = async () => {
    try {
      const res = await api.get('/parents/me');
      const children = res.data.children || [];
      setMyChildren(children);
      // If no child selected from URL, default to the first child
      if (!activeChild && children.length > 0) {
        setActiveChild(children[0]._id);
        fetchChildResults(children[0]._id);
      } else if (activeChild) {
        fetchChildResults(activeChild);
      } else {
        setLoading(false);
      }
    } catch { toast.error('Failed to load your children'); setLoading(false); }
  };

  // Role-based loading
  useEffect(() => {
    if (user?.role === 'student') fetchMyResults();
    else if (user?.role === 'parent') fetchParentChildren();
    else { fetchAllResults(); fetchExams(); fetchClasses(); fetchSubjects(); }
  }, [user]);

  const handleChildSwitch = (id) => {
    setActiveChild(id);
    setLoading(true);
    fetchChildResults(id);
  };

  const fetchAllResults = async () => {
    try { const res = await api.get('/results'); setResults(res.data); }
    catch { toast.error('Failed to load results'); } finally { setLoading(false); }
  };

  const fetchMyResults = async () => {
    try { const res = await api.get('/results/me'); setResults(res.data); }
    catch { toast.error('Failed to load your results'); } finally { setLoading(false); }
  };

  const fetchChildResults = async (id) => {
    try { const res = await api.get(`/parents/me/children/${id}/results`); setResults(res.data.results || res.data); }
    catch { toast.error('Failed to load results'); } finally { setLoading(false); }
  };

  const fetchExams = async () => { try { const res = await api.get('/exams'); setExams(res.data); } catch {} };
  const fetchClasses = async () => { try { const res = await api.get('/classes'); setClasses(res.data); } catch {} };
  const fetchSubjects = async () => { try { const res = await api.get('/subjects'); setSubjects(res.data); } catch {} };

  const fetchStudents = async (classId) => {
    if (!classId) return;
    try { const res = await api.get('/students', { params: { class: classId } }); setStudents(res.data); } catch {}
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'class') fetchStudents(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/results', formData); toast.success('Result added!'); setShowModal(false); resetForm(); fetchAllResults(); }
    catch { toast.error('Operation failed'); }
  };

  const resetForm = () => setFormData({ student: '', exam: '', subject: '', class: '', marksObtained: '', totalMarks: '', academicYear: '2024-2025' });

  const getGradeBadge = (grade) => {
    const colors = { 'A+': 'success', 'A': 'success', 'B+': 'info', 'B': 'info', 'C': 'warning', 'D': 'warning', 'F': 'danger' };
    return <span className={`badge badge-${colors[grade] || 'secondary'}`}>{grade}</span>;
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const isStudentView = user?.role === 'student' || user?.role === 'parent';

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">{isStudentView ? 'My Results' : 'Results'}</h1><p className="page-subtitle">{isStudentView ? 'View your exam results' : 'Manage exam results'}</p></div>
        {user?.role === 'parent' && myChildren.length > 0 && (
          <div className="form-group" style={{ margin: 0, width: '220px' }}>
            <label className="form-label">Select Child</label>
            <select className="form-control" value={activeChild} onChange={(e) => handleChildSwitch(e.target.value)}>
              {myChildren.map(c => <option key={c._id} value={c._id}>{c.name} ({c.class} - {c.section})</option>)}
            </select>
          </div>
        )}
        {user?.role !== 'student' && user?.role !== 'parent' && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Result</button>}
      </div>
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr>{!isStudentView && <th>Student</th>}<th>Exam</th><th>Subject</th><th>Marks</th><th>%</th><th>Grade</th></tr></thead>
            <tbody>
              {results.length >  0 ? results.map(r => (
                <tr key={r._id}>{!isStudentView && <td>{r.student?.name || r.student?.rollNo}</td>}<td>{r.exam?.name}</td><td>{r.subject?.name}</td><td>{r.marksObtained}/{r.totalMarks}</td><td>{r.percentage?.toFixed(1)}%</td><td>{getGradeBadge(r.grade)}</td></tr>
              )) : <tr><td colSpan={isStudentView ? 5 : 6} className="text-center">No results found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <ResultModal formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} setShowModal={setShowModal} classes={classes} students={students} exams={exams} subjects={subjects} />}
    </div>
  );
};

export default Results;

export const ResultModal = ({ formData, handleChange, handleSubmit, setShowModal, classes, students, exams, subjects }) => (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header"><h3>Add Result</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group"><label className="form-label">Class *</label><select name="class" className="form-control" value={formData.class} onChange={handleChange} required><option value="">Select</option>{classes.map(c => <option key={c._id} value={c._id}>{c.name}-{c.section}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Student *</label><select name="student" className="form-control" value={formData.student} onChange={handleChange} required><option value="">Select</option>{students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Exam *</label><select name="exam" className="form-control" value={formData.exam} onChange={handleChange} required><option value="">Select</option>{exams.map(ex => <option key={ex._id} value={ex._id}>{ex.name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Subject *</label><select name="subject" className="form-control" value={formData.subject} onChange={handleChange} required><option value="">Select</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Marks *</label><input type="number" name="marksObtained" className="form-control" value={formData.marksObtained} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Total *</label><input type="number" name="totalMarks" className="form-control" value={formData.totalMarks} onChange={handleChange} required /></div>
          </div>
          <div className="form-group"><label className="form-label">Year *</label><input type="text" name="academicYear" className="form-control" value={formData.academicYear} onChange={handleChange} required /></div>
        </div>
        <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add</button></div>
      </form>
    </div>
  </div>
);
