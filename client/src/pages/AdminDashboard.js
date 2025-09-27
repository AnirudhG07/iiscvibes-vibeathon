import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { adminAPI, eventsAPI, eventApplicationsAPI } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalEvents: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalScans: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [users, events, applications, scans] = await Promise.all([
        adminAPI.getUsers(),
        eventsAPI.getEvents(),
        eventApplicationsAPI.getAllApplications(),
        adminAPI.getQRScans()
      ]);

      setStats({
        totalUsers: users.length,
        pendingUsers: users.filter(user => user.roleStatus === 'pending').length,
        totalEvents: events.length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        totalScans: scans.length
      });

      setRecentApplications(applications.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApplicationStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getApplicationStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of system statistics and recent activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-orange-600 font-medium">{stats.pendingUsers}</span>
              <span className="text-gray-500"> pending approval</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Events
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalEvents}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium">Active</span>
              <span className="text-gray-500"> event management</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Applications
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalApplications}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-orange-600 font-medium">{stats.pendingApplications}</span>
              <span className="text-gray-500"> pending review</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <QrCodeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    QR Scans
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalScans}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-blue-600 font-medium">Track</span>
              <span className="text-gray-500"> attendance</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    System Health
                  </dt>
                  <dd className="text-lg font-medium text-green-600">
                    Operational
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium">All systems</span>
              <span className="text-gray-500"> running smoothly</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
        </div>
        <div className="p-6">
          {recentApplications.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Event applications will appear here when submitted.
              </p>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentApplications.map((application, index) => (
                  <motion.li
                    key={application.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="py-5"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getApplicationStatusIcon(application.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {application.role} Application
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={getApplicationStatusBadge(application.status)}>
                              {application.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          Event: {application.eventTitle || `Event ${application.eventId}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          Applied: {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => window.location.href = '/admin/users'}
            >
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Manage Users
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={() => window.location.href = '/admin/events'}
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              Manage Events
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              onClick={() => window.location.href = '/admin/applications'}
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Review Applications
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              onClick={() => window.location.href = '/admin/qr'}
            >
              <QrCodeIcon className="h-5 w-5 mr-2" />
              QR Management
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;