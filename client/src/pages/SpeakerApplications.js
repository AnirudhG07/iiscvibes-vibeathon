import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { eventsAPI, eventApplicationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SpeakerApplications = () => {
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsData, applicationsData] = await Promise.all([
        eventsAPI.getEvents(),
        eventApplicationsAPI.getMyApplications()
      ]);
      setEvents(eventsData);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySpeaker = async (eventId) => {
    setApplying(prev => ({ ...prev, [eventId]: true }));
    try {
      await eventApplicationsAPI.applySpeaker(eventId, {
        motivation: `I would like to speak at this event and share my expertise.`,
        experience: 'Experienced speaker with relevant background.'
      });
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error applying as speaker:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const getApplicationStatus = (eventId, role) => {
    const application = applications.find(app => 
      app.eventId === eventId && app.role === role && app.userId === user.id
    );
    return application?.status || null;
  };

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
            <PendingIcon className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
      default:
        return null;
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
          <h1 className="text-3xl font-bold text-gray-900">Speaker Applications</h1>
          <p className="mt-2 text-gray-600">
            Apply to speak at events and track your application status
          </p>
        </div>
      </div>

      {/* My Applications Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">My Applications</h2>
        </div>
        <div className="p-6">
          {applications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No applications submitted yet. Apply to events below!
            </p>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const event = events.find(e => e.id === application.eventId);
                if (!event) return null;
                
                return (
                  <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">Applied as: {application.role}</p>
                      <p className="text-sm text-gray-500">
                        Applied on: {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Available Events */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Available Events</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.filter(event => event.speakerApplicationOpen).map((event) => {
              const speakerStatus = getApplicationStatus(event.id, 'speaker');
              const canApply = !speakerStatus;
              
              return (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <UserGroupIcon className="h-4 w-4 mr-2" />
                          {event.expectedAttendees} expected attendees
                        </div>
                      </div>

                      {/* Track Information */}
                      {event.tracks && event.tracks.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Tracks:</p>
                          <div className="flex flex-wrap gap-1">
                            {event.tracks.slice(0, 3).map((track, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {track}
                              </span>
                            ))}
                            {event.tracks.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                +{event.tracks.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Application Status or Apply Button */}
                      {speakerStatus ? (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">Speaker Application:</p>
                          {getStatusBadge(speakerStatus)}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApplySpeaker(event.id)}
                          disabled={applying[event.id]}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center"
                        >
                          {applying[event.id] ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Applying...
                            </>
                          ) : (
                            <>
                              <PlusIcon className="h-4 w-4 mr-2" />
                              Apply as Speaker
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {events.filter(event => event.speakerApplicationOpen).length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events available</h3>
              <p className="mt-1 text-sm text-gray-500">
                No events are currently accepting speaker applications.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SpeakerApplications;