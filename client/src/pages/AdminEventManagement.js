import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { eventsAPI, adminAPI } from '../services/api';

const AdminEventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    expectedAttendees: '',
    tracks: '',
    speakerApplicationOpen: true,
    organizerApplicationOpen: true,
    registrationOpen: true
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventsAPI.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsEditing(false);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      expectedAttendees: '',
      tracks: '',
      speakerApplicationOpen: true,
      organizerApplicationOpen: true,
      registrationOpen: true
    });
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setIsEditing(true);
    setFormData({
      title: event.title,
      description: event.description,
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      location: event.location,
      expectedAttendees: event.expectedAttendees.toString(),
      tracks: event.tracks.join(', '),
      speakerApplicationOpen: event.speakerApplicationOpen,
      organizerApplicationOpen: event.organizerApplicationOpen,
      registrationOpen: event.registrationOpen
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...formData,
        expectedAttendees: parseInt(formData.expectedAttendees),
        tracks: formData.tracks.split(',').map(track => track.trim()).filter(track => track),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      if (isEditing) {
        await eventsAPI.updateEvent(selectedEvent.id, eventData);
      } else {
        await eventsAPI.createEvent(eventData);
      }

      await fetchEvents();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await eventsAPI.deleteEvent(eventId);
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="mt-2 text-gray-600">
            Create and manage events for Vibeathon 2025
          </p>
        </div>
        <button
          onClick={handleCreateEvent}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <motion.div
            key={event.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
              </div>
              <div className="flex space-x-1 ml-2">
                <button
                  onClick={() => handleEditEvent(event)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
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

            {/* Status Indicators */}
            <div className="flex flex-wrap gap-2 mb-4">
              {event.speakerApplicationOpen && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Speaker Apps Open
                </span>
              )}
              {event.organizerApplicationOpen && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Organizer Apps Open
                </span>
              )}
              {event.registrationOpen && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Registration Open
                </span>
              )}
            </div>

            {/* Tracks */}
            {event.tracks && event.tracks.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Tracks:</p>
                <div className="flex flex-wrap gap-1">
                  {event.tracks.slice(0, 3).map((track, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
          </motion.div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first event.
          </p>
          <div className="mt-6">
            <button
              onClick={handleCreateEvent}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Event
            </button>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditing ? 'Edit Event' : 'Create New Event'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Attendees *
                  </label>
                  <input
                    type="number"
                    name="expectedAttendees"
                    value={formData.expectedAttendees}
                    onChange={handleChange}
                    required
                    min="1"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracks (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tracks"
                    value={formData.tracks}
                    onChange={handleChange}
                    placeholder="e.g., Technology, AI & ML, Web Development"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="speakerApplicationOpen"
                        checked={formData.speakerApplicationOpen}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Speaker applications open
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="organizerApplicationOpen"
                        checked={formData.organizerApplicationOpen}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Organizer applications open
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="registrationOpen"
                        checked={formData.registrationOpen}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Event registration open
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isEditing ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminEventManagement;