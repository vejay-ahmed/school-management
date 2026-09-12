import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Admission = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', dateOfBirth: '', gender: '', phone: '', email: '', applyingForClass: '', selectedSubjects: [], parentInfo: { fatherName: '', motherName: '' } });

  useEffect(() => {
    const fetchData = async () => {
      try { const [s, c] = await Promise.all([api.get('/public/subjects'), api.get('/public/classes')]); setSubjects(s.data); setClasses(c.data); } catch (e) {}
    };
    fetchData();
  }, []);

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });
  const toggleSubject = (name) => { setFormData({ ...formData, selectedSubjects: formData.selectedSubjects.includes(name) ? formData.selectedSubjects.filter(s => s !== name) : [...formData.selectedSubjects, name] }); };
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); try { const res = await api.post('/admissions/apply', formData); setApplicationId(res.data.applicationId); setSubmitted(true); } catch (error) { console.error('Submission error:', error); if (error.response) { const data = error.response.data; if (data.errors) { alert('Validation errors:\n' + data.errors.join('\n')); } else { alert('Error: ' + (data.message || data.error || 'Server error')); } } else if (error.request) { alert('Cannot connect to server. Please make sure the backend is running.'); } else { alert('Error: ' + error.message); } } finally { setLoading(false); } };
  const subjectsByCategory = subjects.reduce((acc, s) => { if (!acc[s.category]) acc[s.category] = []; acc[s.category].push(s); return acc; }, {});

  if (submitted) return (<div className="public-page"><section className="success-section"><div className="container"><div className="success-card"><div className="success-icon">OK</div><h2>Application Submitted!</h2><div className="application-id">{applicationId}</div><button className="btn btn-primary" onClick={() => { setSubmitted(false); setStep(1); }}>Submit Another</button></div></div></section></div>);

  return (
    <div className="public-page">
      <section className="page-header-section"><div className="container"><h1>Admission Application</h1></div></section>
      <section className="admission-section"><div className="container"><div className="admission-grid">
        <div className="admission-form-container">
          <div className="form-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`} onClick={() => setStep(1)}>1. Personal</div>
            <div className={`step ${step >= 2 ? 'active' : ''}`} onClick={() => setStep(2)}>2. Parent</div>
            <div className={`step ${step >= 3 ? 'active' : ''}`} onClick={() => setStep(3)}>3. Academic</div>
            <div className={`step ${step >= 4 ? 'active' : ''}`} onClick={() => setStep(4)}>4. Subjects</div>
          </div>
          <form onSubmit={handleSubmit}>
            {step === 1 && (<div className="form-step-content"><h3>Personal Info</h3><div className="form-row"><div className="form-group"><label className="form-label">First Name *</label><input type="text" className="form-control" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required /></div><div className="form-group"><label className="form-label">Last Name *</label><input type="text" className="form-control" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required /></div></div><div className="form-row"><div className="form-group"><label className="form-label">Date of Birth *</label><input type="date" className="form-control" value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} required /></div><div className="form-group"><label className="form-label">Gender *</label><select className="form-control" value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)} required><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div></div><div className="form-row"><div className="form-group"><label className="form-label">Phone *</label><input type="tel" className="form-control" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} required /></div><div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-control" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required /></div></div><button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Next</button></div>)}
            {step === 2 && (<div className="form-step-content"><h3>Parent Info</h3><div className="form-row"><div className="form-group"><label className="form-label">Father Name *</label><input type="text" className="form-control" value={formData.parentInfo.fatherName} onChange={(e) => setFormData({ ...formData, parentInfo: { ...formData.parentInfo, fatherName: e.target.value } })} required /></div><div className="form-group"><label className="form-label">Mother Name *</label><input type="text" className="form-control" value={formData.parentInfo.motherName} onChange={(e) => setFormData({ ...formData, parentInfo: { ...formData.parentInfo, motherName: e.target.value } })} required /></div></div><div className="form-row"><button type="button" className="btn btn-outline" onClick={() => setStep(1)}>Back</button><button type="button" className="btn btn-primary" onClick={() => setStep(3)}>Next</button></div></div>)}
            {step === 3 && (<div className="form-step-content"><h3>Academic Info</h3><div className="form-group"><label className="form-label">Applying for Class *</label><select className="form-control" value={formData.applyingForClass} onChange={(e) => handleChange('applyingForClass', e.target.value)} required><option value="">Select</option>{classes.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}</select></div><div className="form-row"><button type="button" className="btn btn-outline" onClick={() => setStep(2)}>Back</button><button type="button" className="btn btn-primary" onClick={() => setStep(4)}>Next</button></div></div>)}
            {step === 4 && (<div className="form-step-content"><h3>Select Subjects</h3>{Object.entries(subjectsByCategory).map(([cat, list]) => (<div key={cat} className="subject-category"><h4>{cat}</h4><div className="subjects-grid">{list.map(s => (<label key={s.code} className={`subject-checkbox ${formData.selectedSubjects.includes(s.name) ? 'selected' : ''}`}><input type="checkbox" checked={formData.selectedSubjects.includes(s.name)} onChange={() => toggleSubject(s.name)} /><span>{s.name}</span></label>))}</div></div>))}<div className="form-row"><button type="button" className="btn btn-outline" onClick={() => setStep(3)}>Back</button><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button></div></div>)}
          </form>
        </div>
        <div className="admission-sidebar">
          <div className="sidebar-card"><h3>Requirements</h3><ul><li>Birth certificate</li><li>Report card</li><li>Transfer certificate</li><li>4 photos</li></ul></div>
          <div className="sidebar-card"><h3>Contact</h3><p>Phone: +1 (555) 123-4567</p></div>
        </div>
      </div></div></section>
    </div>
  );
};

export default Admission;
