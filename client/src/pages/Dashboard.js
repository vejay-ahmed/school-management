import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (user?.role === 'student') {
        const res = await api.get('/dashboard/student/me');
        setStats(res.data);
      } else if (user?.role === 'parent') {
        const res = await api.get('/dashboard/parent/me');
        setStats(res.data);
      } else {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  // ----- STUDENT DASHBOARD -----
  if (user?.role === 'student') return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">My Dashboard</h1><p className="page-subtitle">Welcome, {stats?.student?.name || user.name}!</p></div>
      </div>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="user-avatar" style={{ width: '64px', height: '64px', fontSize: '24px' }}>{(stats?.student?.name || user.name || '').charAt(0).toUpperCase()}</div>
          <div>
            <h3 style={{ margin: 0 }}>{stats?.student?.name}</h3>
            <p className="text-muted">Roll: {stats?.student?.rollNo} | Class: {stats?.student?.class} - {stats?.student?.section}</p>
          </div>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon green">📈</div><div className="stat-info"><h3>{stats?.avgResult || 0}%</h3><p>Average Result</p></div></div>
        <div className="stat-card"><div className="stat-icon blue">📝</div><div className="stat-info"><h3>{stats?.attendancePercentage || 0}%</h3><p>Attendance ({stats?.presentDays}/{stats?.totalDays})</p></div></div>
        <div className="stat-card"><div className="stat-icon yellow">💰</div><div className="stat-info"><h3>${stats?.fees?.pending || 0}</h3><p>Fees Pending</p></div></div>
        <div className="stat-card"><div className="stat-icon purple">✅</div><div className="stat-info"><h3>{stats?.fees?.status || 'pending'}</h3><p>Fee Status</p></div></div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Recent Results</h3><Link to="/results" className="btn btn-sm btn-outline">View All</Link></div>
        <div className="card-body">
          {stats?.recentResults?.length > 0 ? (
            <div className="table-container"><table className="table">
              <thead><tr><th>Exam</th><th>Subject</th><th>Marks</th><th>%</th><th>Grade</th></tr></thead>
              <tbody>{stats.recentResults.map(r => (
                <tr key={r._id}><td>{r.exam?.name}</td><td>{r.subject?.name}</td><td>{r.marksObtained}/{r.totalMarks}</td><td>{r.percentage?.toFixed(1)}%</td><td><span className={`badge ${r.grade === 'F' ? 'badge-danger' : r.grade === 'C' || r.grade === 'D' ? 'badge-warning' : 'badge-success'}`}>{r.grade}</span></td></tr>
              ))}</tbody>
            </table></div>
          ) : <div className="empty-state"><p>No results yet</p></div>}
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Upcoming Exams</h3></div>
        <div className="card-body">
          {stats?.upcomingExams?.length > 0 ? (
            <div className="table-container"><table className="table">
              <thead><tr><th>Exam</th><th>Subject</th><th>Date</th></tr></thead>
              <tbody>{stats.upcomingExams.map(e => (
                <tr key={e._id}><td>{e.name}</td><td>{e.subject?.name}</td><td>{new Date(e.date).toLocaleDateString()}</td></tr>
              ))}</tbody>
            </table></div>
          ) : <div className="empty-state"><p>No upcoming exams</p></div>}
        </div>
      </div>
    </div>
  );
  // ----- PARENT DASHBOARD -----
  if (user?.role === 'parent') return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Parent Dashboard</h1><p className="page-subtitle">Welcome, {user.name}! View your children's progress</p></div>
      </div>
      {stats?.children?.length > 0 ? stats.children.map(child => (
        <div key={child.student._id} className="card">
          <div className="card-header">
            <h3 className="card-title">🎓 {child.student.name} ({child.student.class}-{child.student.section})</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link to={`/results?child=${child.student._id}`} className="btn btn-sm btn-outline">Results</Link>
              <Link to={`/fees?child=${child.student._id}`} className="btn btn-sm btn-outline">Fees</Link>
              <Link to={`/attendance?child=${child.student._id}`} className="btn btn-sm btn-outline">Attendance</Link>
            </div>
          </div>
          <div className="card-body">
            <div className="stats-grid" style={{ marginBottom: 0 }}>
              <div className="stat-card"><div className="stat-icon green">📈</div><div className="stat-info"><h3>{child.avgResults || 0}%</h3><p>Average Result</p></div></div>
              <div className="stat-card"><div className="stat-icon blue">📝</div><div className="stat-info"><h3>{child.attendancePercentage || 0}%</h3><p>Attendance</p></div></div>
              <div className="stat-card"><div className="stat-icon yellow">💰</div><div className="stat-info"><h3>${child.fees?.pending || 0}</h3><p>Fees Pending</p></div></div>
              <div className="stat-card"><div className="stat-icon purple">📋</div><div className="stat-info"><h3>{child.resultCount || 0}</h3><p>Results Recorded</p></div></div>
            </div>
          </div>
        </div>
      )) : <div className="empty-state"><p>No children linked to this account yet. Please contact the school administrator.</p></div>}
    </div>
  );

  // ----- ADMIN / TEACHER DASHBOARD -----
  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Dashboard</h1><p className="page-subtitle">Welcome back, {user?.name}!</p></div>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue">🎓</div><div className="stat-info"><h3>{stats?.totalStudents || 0}</h3><p>Total Students</p></div></div>
        <div className="stat-card"><div className="stat-icon green">👨🏫</div><div className="stat-info"><h3>{stats?.totalTeachers || 0}</h3><p>Total Teachers</p></div></div>
        <div className="stat-card"><div className="stat-icon yellow">📚</div><div className="stat-info"><h3>{stats?.totalClasses || 0}</h3><p>Total Classes</p></div></div>
        <div className="stat-card"><div className="stat-icon purple">📊</div><div className="stat-info"><h3>{stats?.attendancePercentage || 0}%</h3><p>Today's Attendance</p></div></div>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon green">💰</div><div className="stat-info"><h3>${stats?.feeStats?.collected?.toLocaleString() || 0}</h3><p>Fees Collected</p></div></div>
        <div className="stat-card"><div className="stat-icon red">⏳</div><div className="stat-info"><h3>${stats?.feeStats?.pending?.toLocaleString() || 0}</h3><p>Fees Pending</p></div></div>
        <div className="stat-card"><div className="stat-icon blue">📅</div><div className="stat-info"><h3>{stats?.upcomingExams?.length || 0}</h3><p>Upcoming Exams</p></div></div>
        <div className="stat-card"><div className="stat-icon yellow">✅</div><div className="stat-info"><h3>{stats?.presentToday || 0}</h3><p>Present Today</p></div></div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Upcoming Exams</h3></div>
        <div className="card-body">
          {stats?.upcomingExams?.length > 0 ? (
            <div className="table-container"><table className="table">
              <thead><tr><th>Exam Name</th><th>Subject</th><th>Class</th><th>Date</th></tr></thead>
              <tbody>{stats.upcomingExams.map(exam => (
                <tr key={exam._id}><td>{exam.name}</td><td>{exam.subject?.name}</td><td>{exam.class?.name} - {exam.class?.section}</td><td>{new Date(exam.date).toLocaleDateString()}</td></tr>
              ))}</tbody>
            </table></div>
          ) : <div className="empty-state"><p>No upcoming exams</p></div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
