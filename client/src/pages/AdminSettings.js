import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CogIcon,
  ServerIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  BellIcon,
  KeyIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../services/api';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    eventName: 'Vibeathon 2025',
    eventDescription: 'The premier tech conference of the year',
    registrationOpen: true,
    speakerApplicationsOpen: true,
    organizerApplicationsOpen: true,
    maxSpeakersPerEvent: 50,
    maxOrganizersPerEvent: 20,
    emailNotifications: true,
    smsNotifications: false,
    autoApproveOrganizers: false,
    requireAdminApproval: true,
    backupFrequency: 'daily',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    database: 'healthy',
    email: 'healthy',
    storage: 'healthy',
    api: 'healthy'
  });

  useEffect(() => {
    fetchSettings();
    checkSystemStatus();
  }, []);

  const fetchSettings = async () => {
    try {
      // In a real app, this would fetch from an API
      // For demo, we'll use the default settings
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const checkSystemStatus = async () => {
    try {
      // In a real app, this would check actual system health
      // For demo, we'll simulate healthy status
      setSystemStatus({
        database: 'healthy',
        email: 'healthy',
        storage: 'healthy',
        api: 'healthy'
      });
    } catch (error) {
      console.error('Error checking system status:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure system-wide settings and monitor health
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <CogIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={settings.eventName}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Description
                </label>
                <textarea
                  name="eventDescription"
                  value={settings.eventDescription}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Speakers per Event
                  </label>
                  <input
                    type="number"
                    name="maxSpeakersPerEvent"
                    value={settings.maxSpeakersPerEvent}
                    onChange={handleChange}
                    min="1"
                    max="1000"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Organizers per Event
                  </label>
                  <input
                    type="number"
                    name="maxOrganizersPerEvent"
                    value={settings.maxOrganizersPerEvent}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Application Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Application Settings</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Registration Open
                  </label>
                  <p className="text-sm text-gray-500">Allow new user registrations</p>
                </div>
                <input
                  type="checkbox"
                  name="registrationOpen"
                  checked={settings.registrationOpen}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Speaker Applications Open
                  </label>
                  <p className="text-sm text-gray-500">Allow speaker role applications</p>
                </div>
                <input
                  type="checkbox"
                  name="speakerApplicationsOpen"
                  checked={settings.speakerApplicationsOpen}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Organizer Applications Open
                  </label>
                  <p className="text-sm text-gray-500">Allow organizer role applications</p>
                </div>
                <input
                  type="checkbox"
                  name="organizerApplicationsOpen"
                  checked={settings.organizerApplicationsOpen}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Require Admin Approval
                  </label>
                  <p className="text-sm text-gray-500">All applications need admin approval</p>
                </div>
                <input
                  type="checkbox"
                  name="requireAdminApproval"
                  checked={settings.requireAdminApproval}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Auto-approve Organizers
                  </label>
                  <p className="text-sm text-gray-500">Automatically approve organizer applications</p>
                </div>
                <input
                  type="checkbox"
                  name="autoApproveOrganizers"
                  checked={settings.autoApproveOrganizers}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Email Notifications
                  </label>
                  <p className="text-sm text-gray-500">Send email notifications to users</p>
                </div>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900">
                    SMS Notifications
                  </label>
                  <p className="text-sm text-gray-500">Send SMS notifications to users</p>
                </div>
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <ServerIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">System Settings</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Frequency
                </label>
                <select
                  name="backupFrequency"
                  value={settings.backupFrequency}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Maintenance Mode
                  </label>
                  <p className="text-sm text-gray-500">Put the system in maintenance mode</p>
                </div>
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <CircleStackIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">System Status</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CircleStackIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Database</span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(systemStatus.database)}
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(systemStatus.database)}`}>
                    {systemStatus.database}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">API Services</span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(systemStatus.api)}
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(systemStatus.api)}`}>
                    {systemStatus.api}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Email Service</span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(systemStatus.email)}
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(systemStatus.email)}`}>
                    {systemStatus.email}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ServerIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">File Storage</span>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(systemStatus.storage)}
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(systemStatus.storage)}`}>
                    {systemStatus.storage}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <div className="flex items-center">
                  <CircleStackIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Backup Database</span>
                </div>
              </button>
              
              <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <div className="flex items-center">
                  <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Test Email Service</span>
                </div>
              </button>
              
              <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <div className="flex items-center">
                  <ServerIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Clear Cache</span>
                </div>
              </button>
              
              <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <div className="flex items-center">
                  <KeyIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Regenerate API Keys</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSettings;