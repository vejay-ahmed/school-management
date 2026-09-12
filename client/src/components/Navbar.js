import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/students':
        return 'Students';
      case '/teachers':
        return 'Teachers';
      case '/classes':
        return 'Classes';
      case '/subjects':
        return 'Subjects';
      case '/attendance':
        return 'Attendance';
      case '/exams':
        return 'Examinations';
      case '/results':
        return 'Results';
      case '/fees':
        return 'Fee Management';
      case '/profile':
        return 'Profile';
      case '/news':
        return 'News';
      case '/events':
        return 'Events';
      case '/admissions':
        return 'Admissions';
      default:
        return 'Dashboard';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{getPageTitle()}</h1>
      </div>
      <div className="navbar-right">
        <div className="navbar-user" onClick={logout} style={{ cursor: 'pointer' }}>
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
