import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'student', phone: '',
    rollNo: '', class: '', section: '', dateOfBirth: '', gender: '', parentName: '', parentPhone: '', contactNumber: '',
    employeeId: '', qualification: '', experience: '', relation: 'guardian', occupation: '', parentEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const err = {};
    if (!formData.name.trim()) err.name = 'Name is required';
    if (!formData.email.trim()) err.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) err.email = 'Email is invalid';
    if (!formData.password) err.password = 'Password is required';
    else if (formData.password.length < 6) err.password = 'Min 6 characters';
    if (formData.password !== formData.confirmPassword) err.confirmPassword = 'Passwords do not match';
    if (formData.role === 'student') {
      if (!formData.rollNo?.trim()) err.rollNo = 'Required';
      if (!formData.class?.trim()) err.class = 'Required';
      if (!formData.section?.trim()) err.section = 'Required';
      if (!formData.dateOfBirth) err.dateOfBirth = 'Required';
      if (!formData.gender) err.gender = 'Required';
      if (!formData.parentName?.trim()) err.parentName = 'Required';
      if (!formData.parentPhone?.trim()) err.parentPhone = 'Required';
      if (!formData.contactNumber?.trim()) err.contactNumber = 'Required';
    }
    if (formData.role === 'teacher') {
      if (!formData.employeeId?.trim()) err.employeeId = 'Required';
      if (!formData.qualification?.trim()) err.qualification = 'Required';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error('Please fix errors');
    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = 'text', placeholder, required, error, options }) => (
    <div className="form-group">
      <label className="form-label">{label} {required && <span style={{ color: 'red' }}>*</span>}</label>
      {options ? (
        <select name={name} className={`form-control ${error ? 'is-invalid' : ''}`} value={formData[name]} onChange={handleChange}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} name={name} className={`form-control ${error ? 'is-invalid' : ''}`} placeholder={placeholder} value={formData[name]} onChange={handleChange} />
      )}
      {error && <span style={{ color: 'red', fontSize: '12px' }}>{error}</span>}
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '550px' }}>
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join School Management System</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <InputField label="Full Name" name="name" placeholder="Enter your name" required error={errors.name} />
            <InputField label="Email" name="email" type="email" placeholder="Enter your email" required error={errors.email} />
          </div>
          <div className="form-row">
            <InputField label="Password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" required error={errors.password} />
            <InputField label="Confirm Password" name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirm password" required error={errors.confirmPassword} />
          </div>
          <div className="form-group">
            <label className="form-label">
              <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} style={{ marginRight: '8px' }} />
              Show Password
            </label>
          </div>
          <div className="form-row">
            <InputField label="Role" name="role" options={[
              { value: 'student', label: 'Student' },
              { value: 'parent', label: 'Parent' },
              { value: 'teacher', label: 'Teacher' },
              { value: 'admin', label: 'Admin' }
            ]} />
            <InputField label="Phone" name="phone" type="tel" placeholder="Enter phone number" error={errors.phone} />
          </div>
          {formData.role === 'student' && (
            <React.Fragment>
              <div className="form-row">
                <InputField label="Roll Number" name="rollNo" placeholder="Enter roll number" required error={errors.rollNo} />
                <InputField label="Class" name="class" placeholder="Enter class" required error={errors.class} />
              </div>
              <div className="form-row">
                <InputField label="Section" name="section" placeholder="Enter section" required error={errors.section} />
                <InputField label="Date of Birth" name="dateOfBirth" type="date" required error={errors.dateOfBirth} />
              </div>
              <div className="form-row">
                <InputField label="Gender" name="gender" options={[
                  { value: '', label: 'Select Gender' },
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' }
                ]} required error={errors.gender} />
                <InputField label="Contact Number" name="contactNumber" type="tel" placeholder="Enter contact number" required error={errors.contactNumber} />
              </div>
              <div className="form-row">
                <InputField label="Parent Name" name="parentName" placeholder="Enter parent name" required error={errors.parentName} />
                <InputField label="Parent Phone" name="parentPhone" type="tel" placeholder="Enter parent phone" required error={errors.parentPhone} />
              </div>
            </React.Fragment>
          )}
          {formData.role === 'parent' && (
            <React.Fragment>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Relation *</label><select name="relation" className="form-control" value={formData.relation} onChange={handleChange}><option value="guardian">Guardian</option><option value="father">Father</option><option value="mother">Mother</option><option value="other">Other</option></select></div>
                <div className="form-group"><label className="form-label">Occupation</label><input type="text" name="occupation" className="form-control" placeholder="Enter occupation" value={formData.occupation} onChange={handleChange} /></div>
              </div>
              <div className="form-group">
                <label className="form-label">Parent Email *</label>
                <input type="email" name="parentEmail" className="form-control" placeholder="Enter the email you used in your child's student record" value={formData.parentEmail} onChange={handleChange} />
                <small className="text-muted">Use the SAME email you gave the school â€” your account is linked to students with this email on file</small>
              </div>
            </React.Fragment>
          )}
          {formData.role === 'teacher' && (
            <React.Fragment>
              <div className="form-row">
                <InputField label="Employee ID" name="employeeId" placeholder="Enter employee ID" required error={errors.employeeId} />
                <InputField label="Qualification" name="qualification" placeholder="Enter qualification" required error={errors.qualification} />
              </div>
              <InputField label="Experience (Years)" name="experience" type="number" placeholder="Enter years of experience" />
            </React.Fragment>
          )}
          {formData.role === 'admin' && (
            <div className="form-group">
              <label className="form-label">Admin Code (Optional)</label>
              <input type="text" name="adminCode" className="form-control" placeholder="Enter admin registration code" />
              <small className="text-muted">Contact system administrator for code</small>
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-link">Already have an account? <Link to="/login">Sign In</Link></div>
      </div>
    </div>
  );
};

export default Register;
