import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  UserIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { eventApplicationsAPI, eventsAPI } from '../services/api';

const AdminApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [applicationsData, eventsData] = await Promise.all([
        eventApplicationsAPI.getAllApplications(),
        eventsAPI.getEvents()
      ]);
      setApplications(applicationsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (applicationId, status, reviewNotes = '') => {
    setReviewing(true);
    try {
      await eventApplicationsAPI.reviewApplication(applicationId, {
        status,
        reviewNotes
      });
      await fetchData();
      setShowModal(false);
    } catch (error) {
      console.error('Error reviewing application:', error);
      alert('Failed to review application');
    } finally {
      setReviewing(false);
    }
  };

  const getEventTitle = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.title : `Event ${eventId}`;
  };

  const filteredApplications = applications.filter(application => {
    const eventTitle = getEventTitle(application.eventId);
    const matchesSearch = eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = filterEvent === 'all' || application.eventId === filterEvent;
    const matchesRole = filterRole === 'all' || application.role === filterRole;
    const matchesStatus = filterStatus === 'all' || application.status === filterStatus;
    
    return matchesSearch && matchesEvent && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      speaker: 'bg-blue-100 text-blue-800',
      organizer: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
          <p className="mt-2 text-gray-600">
            Review and manage event role applications
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
            >
              <option value="all">All Events</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="speaker">Speaker</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterEvent('all');
                setFilterRole('all');
                setFilterStatus('all');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Applications ({filteredApplications.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          User {application.userId}
                        </div>
                        <div className="text-sm text-gray-500">
                          Application #{application.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {getEventTitle(application.eventId)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(application.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(application.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleReviewApplication(application.id, 'approved')}
                            disabled={reviewing}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReviewApplication(application.id, 'rejected')}
                            disabled={reviewing}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Event</label>
                    <p className="mt-1 text-sm text-gray-900">{getEventTitle(selectedApplication.eventId)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1">{getRoleBadge(selectedApplication.role)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">{getStatusBadge(selectedApplication.status)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Applied</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedApplication.appliedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {selectedApplication.motivation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Motivation</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {selectedApplication.motivation}
                    </p>
                  </div>
                )}
                
                {selectedApplication.experience && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experience</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {selectedApplication.experience}
                    </p>
                  </div>
                )}
                
                {selectedApplication.reviewNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Review Notes</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {selectedApplication.reviewNotes}
                    </p>
                  </div>
                )}
                
                {selectedApplication.reviewedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reviewed</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedApplication.reviewedAt).toLocaleString()} by {selectedApplication.reviewedBy}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                {selectedApplication.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleReviewApplication(selectedApplication.id, 'rejected')}
                      disabled={reviewing}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {reviewing ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleReviewApplication(selectedApplication.id, 'approved')}
                      disabled={reviewing}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {reviewing ? 'Processing...' : 'Approve'}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminApplicationManagement;