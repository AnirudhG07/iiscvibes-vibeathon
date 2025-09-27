import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedbackForm from './pages/FeedbackForm';

// Protected pages
import SpeakerDashboard from './pages/speaker/Dashboard';
import SpeakerProfile from './pages/speaker/Profile';
import SessionSubmission from './pages/speaker/SessionSubmission';
import MySessions from './pages/speaker/MySessions';
import Agenda from './pages/speaker/Agenda';
import SpeakerApplications from './pages/SpeakerApplications';
import Documents from './pages/speaker/Documents';

import EventManagerDashboard from './pages/eventManager/Dashboard';
import SessionReview from './pages/eventManager/SessionReview';
import AgendaBuilder from './pages/eventManager/AgendaBuilder';
import SpeakerManagement from './pages/eventManager/SpeakerManagement';
import ChangeRequests from './pages/eventManager/ChangeRequests';
import FeedbackAnalytics from './pages/eventManager/FeedbackAnalytics';
import QRScanner from './pages/eventManager/QRScanner';
import Communications from './pages/eventManager/Communications';

// Admin routes are now handled by Event Manager components

// Layout components
import SpeakerLayout from './components/layout/SpeakerLayout';
import EventManagerLayout from './components/layout/EventManagerLayout';
import PublicLayout from './components/layout/PublicLayout';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
            <Route path="/feedback" element={<PublicLayout><FeedbackForm /></PublicLayout>} />
            
            {/* Speaker Routes */}
            <Route path="/speaker" element={
              <ProtectedRoute allowedRoles={['speaker']}>
                <SpeakerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<SpeakerDashboard />} />
              <Route path="profile" element={<SpeakerProfile />} />
              <Route path="sessions/submit" element={<SessionSubmission />} />
              <Route path="sessions" element={<MySessions />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="applications" element={<SpeakerApplications />} />
              <Route path="documents" element={<Documents />} />
            </Route>

            {/* Event Manager Routes - Accessible by both event managers and admins */}
            <Route path="/event-manager" element={
              <ProtectedRoute allowedRoles={['event_manager', 'admin']}>
                <EventManagerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<EventManagerDashboard />} />
              <Route path="sessions" element={<SessionReview />} />
              <Route path="agenda" element={<AgendaBuilder />} />
              <Route path="speakers" element={<SpeakerManagement />} />
              <Route path="change-requests" element={<ChangeRequests />} />
              <Route path="feedback" element={<FeedbackAnalytics />} />
              <Route path="qr-scanner" element={<QRScanner />} />
              <Route path="communications" element={<Communications />} />
            </Route>

            {/* Admin Routes - Redirected to Event Manager */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Navigate to="/event-manager" replace />
              </ProtectedRoute>
            } />

            {/* Utility Routes */}
            <Route path="/unauthorized" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
                  <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
              </div>
            } />
            
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                  <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;