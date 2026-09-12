import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Admission from './pages/public/Admission';
import NewsEvents from './pages/public/NewsEvents';
import PublicNavbar from './pages/public/PublicNavbar';
import PublicFooter from './pages/public/PublicFooter';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin/Dashboard Pages
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';
import Attendance from './pages/Attendance';
import Exams from './pages/Exams';
import Results from './pages/Results';
import Fees from './pages/Fees';
import Profile from './pages/Profile';
import News from './pages/News';
import Events from './pages/Events';
import Admissions from './pages/Admissions';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function PublicLayout({ children }) {
  return (
    <div className="public-layout">
      <PublicNavbar />
      <main className="public-main">{children}</main>
      <PublicFooter />
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/admission" element={<PublicLayout><Admission /></PublicLayout>} />
      <Route path="/news-events" element={<PublicLayout><NewsEvents /></PublicLayout>} />

      {/* Auth Routes (no layout) */}
      {!user && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </>
      )}

      {/* Protected Dashboard Routes */}
      {user ? (
        <Route path="*" element={
          <div className="app-container">
            <Sidebar />
            <div className="main-content">
              <Navbar />
              <div className="content-area">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/teachers" element={<Teachers />} />
                  <Route path="/classes" element={<Classes />} />
                  <Route path="/subjects" element={<Subjects />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/exams" element={<Exams />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/fees" element={<Fees />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/admissions" element={<Admissions />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </div>
            </div>
          </div>
        } />
      ) : (
        <Route path="*" element={<Navigate to="/" />} />
      )}
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
