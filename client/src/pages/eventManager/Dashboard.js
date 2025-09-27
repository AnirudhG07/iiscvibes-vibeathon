import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  ChartBarIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { eventManagerAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: dashboardData, isLoading } = useQuery(
    'event-manager-dashboard',
    eventManagerAPI.getDashboard,
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
      name: 'Total Speakers',
      value: dashboardData?.totalSpeakers || 0,
      icon: UsersIcon,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Total Sessions',
      value: dashboardData?.totalSessions || 0,
      icon: DocumentTextIcon,
      color: 'from-green-600 to-green-700',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      name: 'Approved Sessions',
      value: dashboardData?.approvedSessions || 0,
      icon: CheckCircleIcon,
      color: 'from-emerald-600 to-emerald-700',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
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
    },
    {
      name: 'Speakers Checked In',
      value: dashboardData?.speakersCheckedIn || 0,
      icon: QrCodeIcon,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const quickActions = [
    {
      name: 'Review Sessions',
      description: 'Review and approve pending session submissions',
      href: '/event-manager/sessions',
      icon: DocumentTextIcon,
      color: 'from-primary-600 to-blue-600',
      urgent: dashboardData?.pendingSessions > 0
    },
    {
      name: 'Build Agenda',
      description: 'Create and manage the event schedule',
      href: '/event-manager/agenda',
      icon: CalendarIcon,
      color: 'from-green-600 to-emerald-600'
    },
    {
      name: 'Manage Speakers',
      description: 'View and coordinate with registered speakers',
      href: '/event-manager/speakers',
      icon: UsersIcon,
      color: 'from-purple-600 to-indigo-600'
    },
    {
      name: 'Handle Requests',
      description: 'Process speaker change requests',
      href: '/event-manager/change-requests',
      icon: ExclamationTriangleIcon,
      color: 'from-orange-600 to-red-600',
      urgent: dashboardData?.pendingChangeRequests > 0
    },
    {
      name: 'View Analytics',
      description: 'Analyze feedback and event metrics',
      href: '/event-manager/feedback',
      icon: ChartBarIcon,
      color: 'from-indigo-600 to-purple-600'
    },
    {
      name: 'QR Scanner',
      description: 'Scan QR codes for check-in and t-shirts',
      href: '/event-manager/qr-scanner',
      icon: QrCodeIcon,
      color: 'from-pink-600 to-rose-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Event Manager Dashboard 🚀
            </h1>
            <p className="text-purple-100 text-lg">
              Welcome back, {user?.name}! You're doing great managing Vibeathon 2025.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <SparklesIcon className="h-12 w-12 text-yellow-300" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="relative"
              >
                <Link
                  to={action.href}
                  className="block card hover:shadow-strong transition-all duration-300 group"
                >
                  {action.urgent && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Urgent
                    </div>
                  )}
                  <div className={`bg-gradient-to-r ${action.color} p-3 rounded-lg inline-block mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                  <div className="flex items-center text-purple-600 text-sm font-medium group-hover:text-purple-700">
                    Access
                    <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Event Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Event Preparation Progress
          </h3>
          <div className="text-sm text-blue-600 font-medium">
            {Math.round(((dashboardData?.approvedSessions || 0) / Math.max(dashboardData?.totalSessions || 1, 1)) * 100)}% Complete
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
              dashboardData?.agendaPublished ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <CalendarIcon className={`h-6 w-6 ${
                dashboardData?.agendaPublished ? 'text-green-600' : 'text-gray-400'
              }`} />
            </div>
            <p className="text-sm font-medium text-gray-900">Agenda Published</p>
            <p className="text-xs text-gray-500">
              {dashboardData?.agendaPublished ? 'Published' : 'Draft'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Speakers Confirmed</p>
            <p className="text-xs text-gray-500">
              {dashboardData?.participationConfirmed || 0} confirmed
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Documents Uploaded</p>
            <p className="text-xs text-gray-500">
              {dashboardData?.documentsUploaded || 0} uploaded
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <QrCodeIcon className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">T-shirts Collected</p>
            <p className="text-xs text-gray-500">
              {dashboardData?.tshirtsCollected || 0} collected
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;