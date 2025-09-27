import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const MySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get('/api/sessions/my-sessions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSessions(response.data.sessions);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch sessions. Please try again later.');
        setLoading(false);
      }
    };

    fetchSessions();
  }, [token]);

  // Status Badge component
  const StatusBadge = ({ status }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'approved':
          return 'bg-green-100 text-green-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'on_hold':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor()}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
          <Link
            to="/speaker/session-submission"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Submit New Session
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
            <p className="text-gray-500 mb-4">Submit your first session to get started</p>
            <Link
              to="/speaker/session-submission"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-primary-600 bg-white hover:bg-gray-50 border-primary-600"
            >
              Submit a Session
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <li key={session.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{session.title}</h3>
                        <StatusBadge status={session.status} />
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500 mb-4">{session.abstract}</div>
                      
                      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Category</dt>
                          <dd className="mt-1 text-sm text-gray-900">{session.category}</dd>
                        </div>
                        
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Track</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {session.assignedTrack || session.track || 'Not assigned'}
                          </dd>
                        </div>
                        
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Duration</dt>
                          <dd className="mt-1 text-sm text-gray-900">{session.duration} minutes</dd>
                        </div>
                        
                        {session.timeSlot && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Time Slot</dt>
                            <dd className="mt-1 text-sm text-gray-900">{session.timeSlot}</dd>
                          </div>
                        )}
                        
                        {session.room && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Room</dt>
                            <dd className="mt-1 text-sm text-gray-900">{session.room}</dd>
                          </div>
                        )}
                        
                        {session.coSpeaker && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Co-Speaker</dt>
                            <dd className="mt-1 text-sm text-gray-900">{session.coSpeaker}</dd>
                          </div>
                        )}
                      </dl>

                      {session.reviewFeedback && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Review Feedback</h4>
                          <p className="text-sm text-gray-600">{session.reviewFeedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-4">
                    {session.status === 'pending' && (
                      <Link
                        to={`/speaker/edit-session/${session.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Edit Session
                      </Link>
                    )}
                    <Link
                      to={`/speaker/session/${session.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      View Details
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
  );
};

export default MySessions;