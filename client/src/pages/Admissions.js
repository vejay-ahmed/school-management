import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Admissions = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewData, setReviewData] = useState({ status: '', reviewNotes: '' });
  const [search, setSearch] = useState('');

  useEffect(() => { fetchApplications(); }, [filter]);

  const fetchApplications = async () => {
    try { const res = await api.get(`/admissions?status=${filter === 'all' ? '' : filter}&search=${search}`); setApplications(res.data.applications || []); }
    catch { toast.error('Failed to load applications'); } finally { setLoading(false); }
  };

  const handleReview = async (id) => {
    try { await api.put(`/admissions/${id}/review`, reviewData); toast.success('Review updated!'); setSelectedApp(null); fetchApplications(); }
    catch { toast.error('Review failed'); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/admissions/${id}`); toast.success('Deleted!'); fetchApplications(); } catch {} };

  const getStatusBadge = (status) => {
    const colors = { pending: 'warning', under_review: 'info', approved: 'success', rejected: 'danger', waitlisted: 'secondary' };
    return <span className={`badge badge-${colors[status] || 'secondary'}`}>{status?.replace('_', ' ')}</span>;
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Admission Applications</h1><p className="page-subtitle">Review and manage applications</p></div></div>
      <div className="card">
        <div className="search-bar">
          <input type="text" className="form-control search-input" placeholder="Search by name, email, or ID..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && fetchApplications()} />
          <select className="form-control" style={{ width: '150px' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option><option value="pending">Pending</option><option value="under_review">Under Review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="waitlisted">Waitlisted</option>
          </select>
          <button className="btn btn-primary" onClick={fetchApplications}>Search</button>
        </div>
        <div className="table-container"><table className="table">
          <thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Email</th><th>Phone</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>{applications.length > 0 ? applications.map(app => (
            <tr key={app._id}><td>{app.applicationId}</td><td>{app.firstName} {app.lastName}</td><td>Grade {app.applyingForClass}</td><td>{app.email}</td><td>{app.phone}</td><td>{getStatusBadge(app.status)}</td><td>{new Date(app.createdAt).toLocaleDateString()}</td>
              <td><button className="btn btn-sm btn-outline" onClick={() => { setSelectedApp(app); setReviewData({ status: app.status, reviewNotes: app.reviewNotes }); }}>Review</button> <button className="btn btn-sm btn-danger" onClick={() => handleDelete(app._id)}>Del</button></td>
            </tr>)) : <tr><td colSpan="8" className="text-center">No applications found</td></tr>}</tbody>
        </table></div>
      </div>
      {selectedApp && (<div className="modal-overlay" onClick={() => setSelectedApp(null)}><div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header"><h3>Review Application</h3><button className="modal-close" onClick={() => setSelectedApp(null)}>X</button></div>
        <div className="modal-body">
          <div className="application-details">
            <div className="detail-row"><strong>ID:</strong> {selectedApp.applicationId}</div>
            <div className="detail-row"><strong>Name:</strong> {selectedApp.firstName} {selectedApp.lastName}</div>
            <div className="detail-row"><strong>DOB:</strong> {new Date(selectedApp.dateOfBirth).toLocaleDateString()}</div>
            <div className="detail-row"><strong>Gender:</strong> {selectedApp.gender}</div>
            <div className="detail-row"><strong>Class:</strong> Grade {selectedApp.applyingForClass}</div>
            <div className="detail-row"><strong>Email:</strong> {selectedApp.email}</div>
            <div className="detail-row"><strong>Phone:</strong> {selectedApp.phone}</div>
            <div className="detail-row"><strong>Father:</strong> {selectedApp.parentInfo?.fatherName}</div>
            <div className="detail-row"><strong>Mother:</strong> {selectedApp.parentInfo?.motherName}</div>
            {selectedApp.selectedSubjects?.length > 0 && <div className="detail-row"><strong>Subjects:</strong> {selectedApp.selectedSubjects.join(', ')}</div>}
          </div>
          <div className="form-row"><div className="form-group"><label className="form-label">Status</label><select className="form-control" value={reviewData.status} onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}><option value="pending">Pending</option><option value="under_review">Under Review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="waitlisted">Waitlisted</option></select></div></div>
          <div className="form-group"><label className="form-label">Review Notes</label><textarea className="form-control" rows="3" value={reviewData.reviewNotes} onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })} /></div>
        </div>
        <div className="modal-footer"><button className="btn btn-outline" onClick={() => setSelectedApp(null)}>Cancel</button><button className="btn btn-primary" onClick={() => handleReview(selectedApp._id)}>Save Review</button></div>
      </div></div>)}
    </div>
  );
};

export default Admissions;
