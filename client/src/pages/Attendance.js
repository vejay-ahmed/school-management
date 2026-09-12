import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Attendance = () => {
  const { user } = useAuth();
  const location = useLocation();
  const childId = new URLSearchParams(location.search || '').get('child');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [myAttendance, setMyAttendance] = useState(null);
  // Parent child-switcher state
  const [myChildren, setMyChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(childId || '');

  const fetchParentChildren = async () => {
    try {
      const res = await api.get('/parents/me');
      const children = res.data.children || [];
      setMyChildren(children);
      if (!activeChild && children.length > 0) {
        setActiveChild(children[0]._id);
        fetchChildAttendance(children[0]._id);
      } else if (activeChild) {
        fetchChildAttendance(activeChild);
      } else {
        setLoading(false);
      }
    } catch { toast.error('Failed to load your children'); setLoading(false); }
  };

  useEffect(() => {
    if (user?.role === 'student') fetchMyAttendance();
    else if (user?.role === 'parent') fetchParentChildren();
    else fetchClasses();
  }, [user]);

  const handleChildSwitch = (id) => {
    setActiveChild(id);
    setMyAttendance(null);
    fetchChildAttendance(id);
  };

  const fetchMyAttendance = async () => {
    setLoading(true);
    try { const res = await api.get('/attendance/me'); setMyAttendance(res.data); }
    catch { toast.error('Failed to load attendance'); } finally { setLoading(false); }
  };

  const fetchChildAttendance = async (id) => {
    setLoading(true);
    try { const res = await api.get(`/parents/me/children/${id}/attendance`); setMyAttendance(res.data); }
    catch { toast.error('Failed to load attendance'); } finally { setLoading(false); }
  };

  // ----- STUDENT / PARENT VIEW -----
  if (user?.role === 'student' || user?.role === 'parent') return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">My Attendance</h1><p className="page-subtitle">Your attendance record</p></div>
        {user?.role === 'parent' && myChildren.length > 0 && (
          <div className="form-group" style={{ margin: 0, width: '220px' }}>
            <label className="form-label">Select Child</label>
            <select className="form-control" value={activeChild} onChange={(e) => handleChildSwitch(e.target.value)}>
              {myChildren.map(c => <option key={c._id} value={c._id}>{c.name} ({c.class} - {c.section})</option>)}
            </select>
          </div>
        )}
      </div>
      {loading ? <div className="loading"><div className="spinner"></div></div> : (
        myAttendance ? (
          <div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon green">✓</div><div className="stat-info"><h3>{myAttendance.percentage || 0}%</h3><p>Attendance</p></div></div>
              <div className="stat-card"><div className="stat-icon blue">📅</div><div className="stat-info"><h3>{myAttendance.present || myAttendance.presentDays || 0}</h3><p>Present Days</p></div></div>
              <div className="stat-card"><div className="stat-icon red">✗</div><div className="stat-info"><h3>{myAttendance.absent || myAttendance.absentDays || 0}</h3><p>Absent Days</p></div></div>
              <div className="stat-card"><div className="stat-icon yellow">⏰</div><div className="stat-info"><h3>{myAttendance.late || myAttendance.lateDays || 0}</h3><p>Late</p></div></div>
            </div>
            <div className="card">
              <div className="table-container"><table className="table">
                <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
                <tbody>{myAttendance.attendance?.length > 0 ? myAttendance.attendance.map(a => (
                  <tr key={a._id}><td>{new Date(a.date).toLocaleDateString()}</td><td>{a.subject?.name || '-'}</td><td><span className={`badge ${a.status === 'present' || a.status === 'late' ? 'badge-success' : a.status === 'absent' ? 'badge-danger' : 'badge-warning'}`}>{a.status}</span></td></tr>
                )) : <tr><td colSpan="3" className="text-center">No attendance records</td></tr>}</tbody>
              </table></div>
            </div>
          </div>
        ) : <div className="empty-state"><p>No attendance data</p></div>
      )}
    </div>
  );

  // ----- ADMIN / TEACHER VIEW -----
  const fetchClasses = async () => {
    try { const res = await api.get('/classes'); setClasses(res.data); } catch {}
  };

  const fetchStudents = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const res = await api.get('/students', { params: { class: selectedClass } });
      setStudents(res.data);
      const initialAttendance = {};
      res.data.forEach(s => { initialAttendance[s._id] = 'present'; });
      setAttendance(initialAttendance);
    } catch { toast.error('Failed to load students'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [selectedClass]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSubmit = async () => {
    if (!selectedClass) return toast.error('Select a class');
    setSubmitting(true);
    try {
      const attendanceRecords = students.map(s => ({
        student: s._id,
        status: attendance[s._id] || 'present'
      }));
      await api.post('/attendance', {
        class: selectedClass,
        date: selectedDate,
        attendanceRecords
      });
      toast.success('Attendance marked!');
    } catch { toast.error('Failed to mark attendance'); } finally { setSubmitting(false); }
  };

  const viewAttendance = async () => {
    if (!selectedClass || !selectedDate) return;
    setLoading(true);
    try {
      const res = await api.get('/attendance', { params: { class: selectedClass, date: selectedDate } });
      const attMap = {};
      res.data.forEach(a => { attMap[a.student._id || a.student] = a.status; });
      setAttendance(attMap);
      setViewMode(true);
      setAttendanceStats(res.data.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {}));
    } catch { toast.error('Failed to load attendance'); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Attendance</h1><p className="page-subtitle">Mark and view attendance</p></div>
      </div>
      <div className="card mb-3">
        <div className="form-row">
          <div className="form-group"><label className="form-label">Class</label><select className="form-control" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}><option value="">Select Class</option>{classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-control" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} /></div>
          <div className="form-group d-flex align-center gap-2">
            <button className="btn btn-outline" onClick={viewAttendance}>View</button>
            {user?.role !== 'student' && <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>}
          </div>
        </div>
      </div>
      {loading ? <div className="loading"><div className="spinner"></div></div> : (
        <div className="card">
          {students.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Roll No</th><th>Name</th>{(viewMode ? ['present', 'absent', 'late', 'excused'] : ['present', 'absent', 'late']).map(s => <th key={s}>{s}</th>)}</tr></thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s._id}><td>{s.rollNo}</td><td>{s.name}</td>
                      {(viewMode ? ['present', 'absent', 'late', 'excused'] : ['present', 'absent', 'late']).map(status => (
                        <td key={status}><input type="radio" name={`att-${s._id}`} checked={attendance[s._id] === status} onChange={() => handleAttendanceChange(s._id, status)} disabled={viewMode} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="empty-state"><p>Select a class to view students</p></div>}
          {attendanceStats && (
            <div className="stats-grid mt-3">
              <div className="stat-card"><div className="stat-icon green">✓</div><div className="stat-info"><h3>{attendanceStats.present || 0}</h3><p>Present</p></div></div>
              <div className="stat-card"><div className="stat-icon red">✗</div><div className="stat-info"><h3>{attendanceStats.absent || 0}</h3><p>Absent</p></div></div>
              <div className="stat-card"><div className="stat-icon yellow">⏰</div><div className="stat-info"><h3>{attendanceStats.late || 0}</h3><p>Late</p></div></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;
