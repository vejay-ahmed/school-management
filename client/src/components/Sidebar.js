import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const adminMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admissions', label: 'Admissions', icon: '📝' },
    { path: '/students', label: 'Students', icon: '🎓' },
    { path: '/teachers', label: 'Teachers', icon: '👨‍🏫' },
    { path: '/classes', label: 'Classes', icon: '📚' },
    { path: '/subjects', label: 'Subjects', icon: '📖' },
    { path: '/attendance', label: 'Attendance', icon: '✅' },
    { path: '/exams', label: 'Exams', icon: '📋' },
    { path: '/results', label: 'Results', icon: '📈' },
    { path: '/fees', label: 'Fees', icon: '💳' },
    { path: '/news', label: 'News', icon: '📰' },
    { path: '/events', label: 'Events', icon: '📅' },
  ];

  const teacherMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/attendance', label: 'Attendance', icon: '📝' },
    { path: '/results', label: 'Results', icon: '📈' },
    { path: '/exams', label: 'Exams', icon: '📋' },
  ];

  const studentMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/attendance', label: 'My Attendance', icon: '📝' },
    { path: '/results', label: 'My Results', icon: '📈' },
    { path: '/fees', label: 'My Fees', icon: '💳' },
  ];

  const parentMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/attendance', label: 'My Child Attendance', icon: '📝' },
    { path: '/results', label: 'My Child Results', icon: '📈' },
    { path: '/fees', label: 'My Child Fees', icon: '💳' },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminMenuItems;
      case 'teacher':
        return teacherMenuItems;
      case 'student':
        return studentMenuItems;
      case 'parent':
        return parentMenuItems;
      default:
        return [];
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">S</div>
        <h2>SMS</h2>
      </div>
      <nav className="sidebar-menu">
        <div className="menu-category">Main Menu</div>
        {getMenuItems().map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          >
            <span className="menu-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
        <div className="menu-category">Account</div>
        <NavLink to="/profile" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <span className="menu-item-icon">👤</span>
          <span>Profile</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
