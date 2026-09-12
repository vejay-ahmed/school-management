import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Fees = () => {
  const { user } = useAuth();
  const location = useLocation();
  const childId = new URLSearchParams(location.search || '').get('child');
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [formData, setFormData] = useState({ student: '', class: '', feeType: 'tuition', amount: '', dueDate: '', academicYear: '2024-2025' });
  const [payData, setPayData] = useState({ amountPaid: '', paymentMethod: 'cash' });
  const [myFees, setMyFees] = useState(null);
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
        fetchChildFees(children[0]._id);
      } else if (activeChild) {
        fetchChildFees(activeChild);
      } else {
        setLoading(false);
      }
    } catch { toast.error('Failed to load your children'); setLoading(false); }
  };

  // Role-based loading
  useEffect(() => {
    if (user?.role === 'student') fetchMyFees();
    else if (user?.role === 'parent') fetchParentChildren();
    else { fetchAllFees(); fetchStudents(); fetchClasses(); }
  }, [user]);

  const handleChildSwitch = (id) => {
    setActiveChild(id);
    setMyFees(null);
    fetchChildFees(id);
  };

  const fetchAllFees = async () => {
    try { const res = await api.get('/fees'); setFees(res.data); }
    catch { toast.error('Failed to load fees'); } finally { setLoading(false); }
  };

  const fetchMyFees = async () => {
    try { const res = await api.get('/fees/me'); setMyFees(res.data); setFees(res.data.fees || []); }
    catch { toast.error('Failed to load fees'); } finally { setLoading(false); }
  };

  const fetchChildFees = async (id) => {
    try { const res = await api.get(`/parents/me/children/${id}/fees`); setMyFees({ ...res.data, fees: res.data.fees || [] }); setFees(res.data.fees || []); }
    catch { toast.error('Failed to load fees'); } finally { setLoading(false); }
  };

  // ----- STUDENT / PARENT VIEW -----
  if (user?.role === 'student' || user?.role === 'parent') return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">My Fees</h1><p className="page-subtitle">Your fee status</p></div>
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
        <div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-icon green">💰</div><div className="stat-info"><h3>${myFees?.totalAmount || 0}</h3><p>Total Fees</p></div></div>
            <div className="stat-card"><div className="stat-icon blue">✓</div><div className="stat-info"><h3>${myFees?.totalPaid || 0}</h3><p>Paid</p></div></div>
            <div className="stat-card"><div className="stat-icon red">⏳</div><div className="stat-info"><h3>${myFees?.pending || 0}</h3><p>Pending</p></div></div>
            <div className="stat-card"><div className="stat-icon purple">📋</div><div className="stat-info"><h3>{myFees?.status || (myFees?.pending > 0 ? 'pending' : 'paid')}</h3><p>Status</p></div></div>
          </div>
          <div className="card">
            <div className="table-container"><table className="table">
              <thead><tr><th>Type</th><th>Amount</th><th>Paid</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>{fees.length > 0 ? fees.map(f => (
                <tr key={f._id}><td>{f.feeType}</td><td>${f.amount}</td><td>${f.amountPaid}</td><td>{new Date(f.dueDate).toLocaleDateString()}</td><td><span className={`badge ${f.paymentStatus === 'paid' ? 'badge-success' : f.paymentStatus === 'partial' ? 'badge-info' : f.paymentStatus === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>{f.paymentStatus}</span></td></tr>
              )) : <tr><td colSpan="5" className="text-center">No fees found</td></tr>}</tbody>
            </table></div>
          </div>
        </div>
      )}
    </div>
  );

  // ----- ADMIN VIEW -----
  const fetchStudents = async () => { try { const res = await api.get('/students'); setStudents(res.data); } catch {} };
  const fetchClasses = async () => { try { const res = await api.get('/classes'); setClasses(res.data); } catch {} };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePayChange = (e) => setPayData({ ...payData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/fees', formData); toast.success('Fee added!'); setShowModal(false); resetForm(); fetchAllFees(); }
    catch { toast.error('Operation failed'); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try { await api.put(`/fees/${selectedFee._id}/pay`, payData); toast.success('Payment recorded!'); setShowPayModal(false); setSelectedFee(null); fetchAllFees(); }
    catch { toast.error('Payment failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/fees/${id}`); toast.success('Deleted!'); fetchAllFees(); } catch {}
  };

  const resetForm = () => setFormData({ student: '', class: '', feeType: 'tuition', amount: '', dueDate: '', academicYear: '2024-2025' });

  const getStatusBadge = (status) => {
    const colors = { paid: 'success', pending: 'warning', partial: 'info', overdue: 'danger' };
    return <span className={`badge badge-${colors[status] || 'secondary'}`}>{status}</span>;
  };

  const openPayModal = (fee) => { setSelectedFee(fee); setPayData({ amountPaid: fee.amount - fee.amountPaid, paymentMethod: 'cash' }); setShowPayModal(true); };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Fee Management</h1><p className="page-subtitle">Track fee payments</p></div>
        {user?.role === 'admin' && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Fee</button>}
      </div>
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Student</th><th>Type</th><th>Amount</th><th>Paid</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {fees.length > 0 ? fees.map(f => (
                <tr key={f._id}><td>{f.student?.name}</td><td>{f.feeType}</td><td>${f.amount}</td><td>${f.amountPaid}</td><td>{getStatusBadge(f.paymentStatus)}</td>
                  <td>
                    {user?.role === 'admin' && f.paymentStatus !== 'paid' && <button className="btn btn-sm btn-success" onClick={() => openPayModal(f)}>Pay</button>}
                    {user?.role === 'admin' && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f._id)}>Del</button>}
                  </td>
                </tr>
              )) : <tr><td colSpan="6" className="text-center">No fees found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <FeeModal {...{ formData, handleChange, handleSubmit, setShowModal, students, classes }} />}
      {showPayModal && selectedFee && <PayModal {...{ selectedFee, payData, handlePayChange, handlePayment, setShowPayModal }} />}
    </div>
  );
};

export default Fees;

export const FeeModal = ({ formData, handleChange, handleSubmit, setShowModal, students, classes }) => (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header"><h3>Add Fee</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group"><label className="form-label">Student *</label><select name="student" className="form-control" value={formData.student} onChange={handleChange} required><option value="">Select</option>{students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Class *</label><select name="class" className="form-control" value={formData.class} onChange={handleChange} required><option value="">Select</option>{classes.map(c => <option key={c._id} value={c._id}>{c.name}-{c.section}</option>)}</select></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Type</label><select name="feeType" className="form-control" value={formData.feeType} onChange={handleChange}><option value="tuition">Tuition</option><option value="transport">Transport</option><option value="hostel">Hostel</option><option value="exam">Exam</option></select></div>
            <div className="form-group"><label className="form-label">Amount *</label><input type="number" name="amount" className="form-control" value={formData.amount} onChange={handleChange} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Due Date *</label><input type="date" name="dueDate" className="form-control" value={formData.dueDate} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Year *</label><input type="text" name="academicYear" className="form-control" value={formData.academicYear} onChange={handleChange} required /></div>
          </div>
        </div>
        <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add</button></div>
      </form>
    </div>
  </div>
);

export const PayModal = ({ selectedFee, payData, handlePayChange, handlePayment, setShowPayModal }) => (
  <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header"><h3>Record Payment</h3><button className="modal-close" onClick={() => setShowPayModal(false)}>×</button></div>
      <form onSubmit={handlePayment}>
        <div className="modal-body">
          <p><strong>Student:</strong> {selectedFee.student?.name}</p>
          <p><strong>Due:</strong> ${selectedFee.amount - selectedFee.amountPaid}</p>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Amount *</label><input type="number" name="amountPaid" className="form-control" value={payData.amountPaid} onChange={handlePayChange} required /></div>
            <div className="form-group"><label className="form-label">Method</label><select name="paymentMethod" className="form-control" value={payData.paymentMethod} onChange={handlePayChange}><option value="cash">Cash</option><option value="card">Card</option><option value="online">Online</option></select></div>
          </div>
        </div>
        <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowPayModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Pay</button></div>
      </form>
    </div>
  </div>
);
