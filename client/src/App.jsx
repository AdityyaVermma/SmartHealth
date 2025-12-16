import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import Alerts from './components/Alerts';
import Resources from './components/Resources';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';


import Users from './components/Users';
import VillageReports from './components/VillageReports';
import SupportChat from './components/SupportChat';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/village-reports" element={<VillageReports />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/report"
                  element={
                    <ProtectedRoute allowedRoles={['health_worker', 'admin', 'national_admin']}>
                      <ReportForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/alerts"
                  element={
                    <ProtectedRoute allowedRoles={['community', 'health_worker', 'admin', 'national_admin']}>
                      <Alerts />
                    </ProtectedRoute>
                  }
                />
                <Route path="/resources" element={<Resources />} />
                <Route path="/users" element={
                  <ProtectedRoute allowedRoles={['admin', 'national_admin']}>
                    <Users />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <SupportChat />
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

