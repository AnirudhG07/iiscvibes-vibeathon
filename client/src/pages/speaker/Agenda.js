import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const Agenda = () => {
  const [agenda, setAgenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState('all');
  const { token } = useAuth();

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const response = await axios.get('/api/agenda', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAgenda(response.data.agenda); // Access the agenda from the response
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Agenda has not been published yet.');
        } else {
          setError('Failed to load agenda. Please try again later.');
        }
        setLoading(false);
      }
    };

    fetchAgenda();
  }, [token]);

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getItemColor = (type) => {
    switch (type) {
      case 'keynote':
        return 'bg-purple-50 border-purple-200';
      case 'session':
        return 'bg-blue-50 border-blue-200';
      case 'break':
        return 'bg-green-50 border-green-200';
      case 'registration':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'keynote':
        return '🎯';
      case 'session':
        return '💡';
      case 'break':
        return '☕';
      case 'registration':
        return '📝';
      default:
        return '📅';
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-4 py-8"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading agenda...</div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-4 py-8"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">{error}</div>
        </div>
      </motion.div>
    );
  }

  if (!agenda) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-4 py-8"
      >
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Agenda</h1>
          <p className="text-gray-600">No agenda available at the moment.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 py-8"
    >
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{agenda.eventName}</h1>
            <p className="text-gray-600 mt-1">
              {new Date(agenda.eventDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Tracks</option>
              {agenda.tracks.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {agenda.schedule
            .filter(item => selectedTrack === 'all' || item.track === selectedTrack)
            .map((item) => (
              <div
                key={item.id}
                className={`border rounded-lg p-4 ${getItemColor(item.type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getItemIcon(item.type)}</div>
                  <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.sessionDetails ? item.sessionDetails.title : item.title}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-2">
                      {(item.description || (item.sessionDetails && item.sessionDetails.abstract)) && (
                        <p className="text-sm text-gray-600">
                          {item.sessionDetails ? item.sessionDetails.abstract : item.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.track && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.track}
                          </span>
                        )}
                        {item.room && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            📍 {item.room}
                          </span>
                        )}
                        {item.sessionDetails && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            👤 {item.sessionDetails.speakerName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Agenda;