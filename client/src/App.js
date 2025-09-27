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
import UserDashboard from './pages/UserDashboard';
import UserTickets from './pages/UserTickets';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminQRManagement from './pages/AdminQRManagement';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminEventManagement from './pages/AdminEventManagement';
import AdminApplicationManagement from './pages/AdminApplicationManagement';
import AdminSettings from './pages/AdminSettings';
import AdminQRScanner from './pages/AdminQRScanner';

// Layout components
import AdminLayout from './components/layout/AdminLayout';
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
            
            {/* User Routes */}
            <Route path="/user" element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/user/tickets" element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserTickets />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUserManagement />} />
              <Route path="events" element={<AdminEventManagement />} />
              <Route path="applications" element={<AdminApplicationManagement />} />
              <Route path="qr" element={<AdminQRManagement />} />
              <Route path="qr-scanner" element={<AdminQRScanner />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

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