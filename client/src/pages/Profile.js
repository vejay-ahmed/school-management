import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || ''
      });
    }
  }, [user]);

  if (!profile) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Profile</h1><p className="page-subtitle">Your account information</p></div>
      </div>
      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          <div className="text-center mb-4">
            <div className="user-avatar" style={{ width: '80px', height: '80px', fontSize: '28px', margin: '0 auto' }}>
              {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <h3 className="mt-3">{profile.name}</h3>
            <span className="badge badge-info">{profile.role}</span>
          </div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" value={profile.name} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" value={profile.email} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <input type="text" className="form-control" value={profile.role} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="tel" className="form-control" value={profile.phone || 'Not provided'} disabled />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
