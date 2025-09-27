import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Award, 
  BookOpen, 
  UserPlus,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Ticket,
  Download,
  QrCode
} from 'lucide-react';
import api from '../services/api';

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);

        const [eventsRes, applicationsRes, ticketsRes] = await Promise.all([
          api.get('/events'),
          api.get('/event-applications/my-applications'),
          api.get('/events/my/tickets')
        ]);

        setEvents(Array.isArray(eventsRes.data.events) ? eventsRes.data.events : []);
        setApplications(Array.isArray(applicationsRes.data.applications) ? applicationsRes.data.applications : []);
        setTickets(Array.isArray(ticketsRes.data.tickets) ? ticketsRes.data.tickets : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApplyForRole = async (eventId, role) => {
    try {
      const applicationData = {
        motivation: `I would like to contribute as a ${role} for this event.`,
        experience: 'Passionate about technology and eager to contribute.',
        availability: 'Available for the entire event duration.',
        previousExperience: role === 'speaker' ? 'Previous speaking experience at local meetups.' : 'Experience in event organization and management.'
      };

      if (role === 'speaker') {
        applicationData.proposedSession = {
          title: 'My Proposed Session',
          description: 'Detailed session description will be provided.',
          duration: 45,
          sessionType: 'Talk',
          track: events.find(e => e.id === eventId)?.tracks[0] || 'General'
        };
      }

      const endpoint = role === 'speaker' 
        ? `/event-applications/apply-speaker/${eventId}`
        : `/event-applications/apply-organizer/${eventId}`;

      await api.post(endpoint, applicationData);

      // Refresh applications
      const applicationsRes = await api.get('/event-applications/my-applications');
      setApplications(Array.isArray(applicationsRes.data.applications) ? applicationsRes.data.applications : []);
      
      alert(`Successfully applied as ${role}!`);
    } catch (error) {
      console.error('Error applying for role:', error);
      alert(error.response?.data?.message || 'Error submitting application. Please try again.');
    }
  };

  const handleEventRegistration = async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/register`);
      
      // Refresh tickets after registration
      const ticketsRes = await api.get('/events/my/tickets');
      setTickets(Array.isArray(ticketsRes.data.tickets) ? ticketsRes.data.tickets : []);
      
      alert('Successfully registered! Your ticket has been generated.');
    } catch (error) {
      console.error('Error registering for event:', error);
      alert(error.response?.data?.message || 'Error registering for event. Please try again.');
    }
  };

  const getApplicationStatus = (eventId, role) => {
    return applications.find(app => app.eventId === eventId && app.applicationType === role);
  };

  const isRegisteredForEvent = (eventId) => {
    return tickets.some(ticket => ticket.eventId === eventId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const downloadTicket = (ticket) => {
    // Create a downloadable ticket image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 600;
    canvas.height = 800;
    
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(0, 0, canvas.width, 100);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EVENT TICKET', canvas.width / 2, 45);
    
    // Event info
    ctx.textAlign = 'left';
    ctx.font = '18px Arial';
    ctx.fillText(`Event: ${ticket.event?.name || 'Event'}`, 50, 150);
    ctx.fillText(`Name: ${ticket.userName}`, 50, 180);
    ctx.fillText(`Email: ${ticket.userEmail}`, 50, 210);
    ctx.fillText(`Ticket ID: ${ticket.id}`, 50, 240);
    
    if (ticket.event) {
      ctx.fillText(`Date: ${new Date(ticket.event.startDate).toLocaleDateString()}`, 50, 280);
      ctx.fillText(`Venue: ${ticket.event.venue || ticket.event.location}`, 50, 310);
    }
    
    // QR Code placeholder
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(200, 350, 200, 200);
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = '14px Arial';
    ctx.fillText('QR CODE', 300, 460);
    
    // Status
    ctx.fillStyle = ticket.isUsed ? '#ef4444' : '#10b981';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(ticket.isUsed ? 'USED' : 'VALID', canvas.width / 2, 600);
    
    // Download
    const link = document.createElement('a');
    link.download = `ticket-${ticket.id}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Welcome, {user?.name || 'User'}</h1>
                <p className="text-purple-200">User Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'events', label: 'Available Events', icon: Calendar },
            { id: 'applications', label: 'My Applications', icon: FileText },
            { id: 'tickets', label: 'My Tickets', icon: Ticket }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white text-purple-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {events.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Calendar className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Events Available</h3>
                <p className="text-purple-200">Check back later for upcoming events.</p>
              </div>
            ) : (
              events.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{event.name || event.title}</h3>
                    <p className="text-purple-200 text-sm mb-4">{event.description}</p>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-purple-200 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-purple-200 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-purple-200 text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      {event.currentAttendees || 0}/{event.maxAttendees || 'N/A'} attendees
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {/* Speaker Application */}
                    {event.speakerApplicationOpen && (
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">Speaker</span>
                        {(() => {
                          const app = getApplicationStatus(event.id, 'speaker');
                          if (app) {
                            return (
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(app.status)}
                                <span className="text-xs text-purple-200 capitalize">{app.status}</span>
                              </div>
                            );
                          }
                          return (
                            <button
                              onClick={() => handleApplyForRole(event.id, 'speaker')}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors"
                            >
                              Apply
                            </button>
                          );
                        })()}
                      </div>
                    )}

                    {/* Organizer Application */}
                    {event.organizerApplicationOpen && (
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">Organizer</span>
                        {(() => {
                          const app = getApplicationStatus(event.id, 'organizer');
                          if (app) {
                            return (
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(app.status)}
                                <span className="text-xs text-purple-200 capitalize">{app.status}</span>
                              </div>
                            );
                          }
                          return (
                            <button
                              onClick={() => handleApplyForRole(event.id, 'organizer')}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                            >
                              Apply
                            </button>
                          );
                        })()}
                      </div>
                    )}

                    {/* General Registration */}
                    {event.registrationOpen && (
                      <div className="mt-2">
                        {isRegisteredForEvent(event.id) ? (
                          <div className="flex items-center justify-center px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-200 text-sm rounded-lg">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Registered
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleEventRegistration(event.id)}
                            className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
                          >
                            Register to Attend
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
                <p className="text-purple-200">Apply for speaker or organizer roles in the events tab.</p>
              </div>
            ) : (
              applications.map((application) => {
                const event = events.find(e => e.id === application.eventId);
                return (
                  <motion.div
                    key={application.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{event?.name}</h3>
                        <p className="text-purple-200">Applied as: <span className="capitalize">{application.applicationType}</span></p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(application.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          application.status === 'approved' ? 'bg-green-500/20 text-green-200' :
                          application.status === 'rejected' ? 'bg-red-500/20 text-red-200' :
                          'bg-yellow-500/20 text-yellow-200'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div>
                          <span className="text-purple-300">Motivation:</span>
                          <p className="text-white">{application.applicationData?.motivation || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-purple-300">Experience:</span>
                          <p className="text-white">{application.applicationData?.experience || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-purple-300">Applied:</span>
                          <p className="text-white">{new Date(application.appliedAt).toLocaleDateString()}</p>
                        </div>
                        {application.reviewedAt && (
                          <div>
                            <span className="text-purple-300">Reviewed:</span>
                            <p className="text-white">{new Date(application.reviewedAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {application.applicationData?.proposedSession && (
                      <div className="mt-4 p-4 bg-black/20 rounded-lg">
                        <h4 className="text-white font-semibold mb-2">Proposed Session</h4>
                        <p className="text-purple-200 text-sm">{application.applicationData.proposedSession.title}</p>
                        <p className="text-purple-300 text-xs mt-1">{application.applicationData.proposedSession.description}</p>
                      </div>
                    )}

                    {application.feedback && (
                      <div className="mt-4 p-4 bg-black/20 rounded-lg">
                        <h4 className="text-white font-semibold mb-2">Feedback</h4>
                        <p className="text-purple-200 text-sm">{application.feedback}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Tickets Yet</h3>
                <p className="text-purple-200">Register for events to get your tickets here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {ticket.event?.name || 'Event Ticket'}
                        </h3>
                        <p className="text-purple-200 text-sm">
                          Ticket #{ticket.id.split('-').pop()}
                        </p>
                      </div>
                      <div className={`flex items-center space-x-2 ${
                        ticket.isUsed ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {ticket.isUsed ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        <span className="text-sm font-medium">
                          {ticket.isUsed ? 'Used' : 'Valid'}
                        </span>
                      </div>
                    </div>

                    {ticket.event && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-purple-200 text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(ticket.event.startDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center text-purple-200 text-sm">
                          <Clock className="w-4 h-4 mr-2" />
                          {new Date(ticket.event.startDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center text-purple-200 text-sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          {ticket.event.venue || ticket.event.location}
                        </div>
                      </div>
                    )}

                    {ticket.qrCode && (
                      <div className="bg-white rounded-lg p-3 mb-4 text-center">
                        <img 
                          src={ticket.qrCode} 
                          alt="QR Code" 
                          className="w-24 h-24 mx-auto"
                        />
                        <p className="text-gray-600 text-xs mt-2">
                          Scan at venue
                        </p>
                      </div>
                    )}

                    {ticket.isUsed && ticket.usedAt && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                        <p className="text-red-200 text-sm">
                          Used on {new Date(ticket.usedAt).toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadTicket(ticket)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                      <button className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors">
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;