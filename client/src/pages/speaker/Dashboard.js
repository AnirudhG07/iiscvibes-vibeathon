import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  CalendarIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FolderIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { speakerAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: dashboardData, isLoading } = useQuery(
    'speaker-dashboard',
    speakerAPI.getDashboard,
    {
      select: (response) => response.data.dashboard
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Sessions',
      value: dashboardData?.totalSessions || 0,
      icon: DocumentTextIcon,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Approved Sessions',
      value: dashboardData?.approvedSessions || 0,
      icon: CheckCircleIcon,
      color: 'from-green-600 to-green-700',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      name: 'Pending Review',
      value: dashboardData?.pendingSessions || 0,
      icon: ClockIcon,
      color: 'from-yellow-600 to-yellow-700',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      name: 'Change Requests',
      value: dashboardData?.pendingChangeRequests || 0,
      icon: ExclamationTriangleIcon,
      color: 'from-orange-600 to-orange-700',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      name: 'Submit New Session',
      description: 'Propose a new session for the event',
      href: '/speaker/sessions/submit',
      icon: DocumentTextIcon,
      color: 'from-primary-600 to-blue-600'
    },
    {
      name: 'View My Sessions',
      description: 'Manage your submitted sessions',
      href: '/speaker/sessions',
      icon: CalendarIcon,
      color: 'from-green-600 to-emerald-600'
    },
    {
      name: 'Generate QR Code',
      description: 'Get your check-in and t-shirt QR codes',
      href: '/speaker/qr-code',
      icon: QrCodeIcon,
      color: 'from-purple-600 to-indigo-600'
    },
    {
      name: 'Upload Documents',
      description: 'Share your presentation materials',
      href: '/speaker/documents',
      icon: FolderIcon,
      color: 'from-red-600 to-pink-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to make Vibeathon 2025 amazing? Let's get your sessions ready!
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <StarIcon className="h-12 w-12 text-yellow-300" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-strong transition-all duration-300"
            >
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-600 text-sm">{stat.name}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link
                  to={action.href}
                  className="block card hover:shadow-strong transition-all duration-300 group"
                >
                  <div className={`bg-gradient-to-r ${action.color} p-3 rounded-lg inline-block mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                  <div className="flex items-center text-primary-600 text-sm font-medium group-hover:text-primary-700">
                    Get Started
                    <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions */}
      {dashboardData?.recentSessions?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Sessions</h2>
            <Link to="/speaker/sessions" className="text-primary-600 hover:text-primary-700 font-medium">
              View All Sessions
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData.recentSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {session.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {session.category} • {session.track}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Submitted on {new Date(session.submissionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className={`badge ${
                      session.status === 'approved' ? 'badge-success' :
                      session.status === 'rejected' ? 'badge-error' :
                      session.status === 'on_hold' ? 'badge-warning' :
                      'badge-secondary'
                    }`}>
                      {session.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Event Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Event Day Readiness
            </h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircleIcon className={`h-4 w-4 mr-2 ${
                  dashboardData?.qrCodeGenerated ? 'text-green-600' : 'text-gray-400'
                }`} />
                <span className={dashboardData?.qrCodeGenerated ? 'text-green-800' : 'text-gray-600'}>
                  QR Code Generated
                </span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircleIcon className={`h-4 w-4 mr-2 ${
                  dashboardData?.checkedIn ? 'text-green-600' : 'text-gray-400'
                }`} />
                <span className={dashboardData?.checkedIn ? 'text-green-800' : 'text-gray-600'}>
                  Checked In
                </span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircleIcon className={`h-4 w-4 mr-2 ${
                  dashboardData?.tshirtCollected ? 'text-green-600' : 'text-gray-400'
                }`} />
                <span className={dashboardData?.tshirtCollected ? 'text-green-800' : 'text-gray-600'}>
                  T-shirt Collected
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;