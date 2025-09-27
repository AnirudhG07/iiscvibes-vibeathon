import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Tag,
  FileText,
  Users,
  Edit,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { sessionAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [changeRequest, setChangeRequest] = useState({
    type: 'title',
    currentValue: '',
    requestedValue: '',
    reason: ''
  });

  useEffect(() => {
    fetchSession();
  }, [id]);

  const fetchSession = async () => {
    try {
      const sessions = await sessionAPI.getMySessions();
      const foundSession = sessions.data.sessions.find(s => s.id === id);
      if (!foundSession) {
        toast.error('Session not found');
        navigate('/speaker/sessions');
        return;
      }
      setSession(foundSession);
    } catch (error) {
      console.error('Error fetching session:', error);
      toast.error('Failed to fetch session details');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRequest = async (e) => {
    e.preventDefault();
    try {
      await sessionAPI.submitChangeRequest({
        sessionId: id,
        ...changeRequest
      });
      toast.success('Change request submitted successfully');
      setShowChangeRequestModal(false);
      setChangeRequest({
        type: 'title',
        currentValue: '',
        requestedValue: '',
        reason: ''
      });
    } catch (error) {
      console.error('Error submitting change request:', error);
      toast.error('Failed to submit change request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Session not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/speaker/sessions')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Sessions
        </button>
        <div className="flex space-x-3">
          {session.status === 'approved' && (
            <button
              onClick={() => setShowChangeRequestModal(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Request Changes</span>
            </button>
          )}
          {session.status === 'pending' && (
            <button
              onClick={() => navigate(`/speaker/edit-session/${session.id}`)}
              className="btn-primary flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Session Details Card */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{session.title}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Session Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <User className="w-5 h-5 mr-3" />
              <div>
                <p className="font-medium">Speaker</p>
                <p className="text-sm">{session.speakerName}</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Tag className="w-5 h-5 mr-3" />
              <div>
                <p className="font-medium">Category</p>
                <p className="text-sm">{session.category}</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-3" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-sm">{session.duration} minutes</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {session.assignedTrack && (
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Track</p>
                  <p className="text-sm">{session.assignedTrack}</p>
                </div>
              </div>
            )}
            
            {session.timeSlot && (
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Time Slot</p>
                  <p className="text-sm">{session.timeSlot}</p>
                </div>
              </div>
            )}
            
            {session.room && (
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Room</p>
                  <p className="text-sm">{session.room}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Abstract */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Abstract
          </h3>
          <p className="text-gray-700 leading-relaxed">{session.abstract}</p>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {session.targetAudience && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Target Audience
              </h4>
              <p className="text-gray-600 text-sm">{session.targetAudience}</p>
            </div>
          )}
          
          {session.requirements && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
              <p className="text-gray-600 text-sm">{session.requirements}</p>
            </div>
          )}
          
          {session.coSpeaker && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Co-Speaker</h4>
              <p className="text-gray-600 text-sm">{session.coSpeaker}</p>
            </div>
          )}
        </div>

        {/* Review Feedback */}
        {session.reviewFeedback && session.status !== 'pending' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Review Feedback
            </h4>
            <div className={`p-4 rounded-lg ${session.status === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-gray-700">{session.reviewFeedback}</p>
            </div>
          </div>
        )}

        {/* Submission Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Submitted: {new Date(session.submissionDate).toLocaleDateString()}</span>
            {session.lastModified && (
              <span>Last Modified: {new Date(session.lastModified).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Change Request Modal */}
      {showChangeRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-4">Request Session Changes</h2>
            
            <form onSubmit={handleChangeRequest} className="space-y-4">
              <div>
                <label className="form-label">Change Type</label>
                <select
                  className="form-input"
                  value={changeRequest.type}
                  onChange={(e) => setChangeRequest({...changeRequest, type: e.target.value})}
                  required
                >
                  <option value="title">Title</option>
                  <option value="abstract">Abstract</option>
                  <option value="duration">Duration</option>
                  <option value="requirements">Requirements</option>
                  <option value="timeSlot">Time Slot</option>
                  <option value="room">Room</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Current Value</label>
                <input
                  type="text"
                  className="form-input"
                  value={changeRequest.currentValue}
                  onChange={(e) => setChangeRequest({...changeRequest, currentValue: e.target.value})}
                  placeholder="Current value you want to change"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Requested Value</label>
                <input
                  type="text"
                  className="form-input"
                  value={changeRequest.requestedValue}
                  onChange={(e) => setChangeRequest({...changeRequest, requestedValue: e.target.value})}
                  placeholder="New value you want"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Reason for Change</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={changeRequest.reason}
                  onChange={(e) => setChangeRequest({...changeRequest, reason: e.target.value})}
                  placeholder="Please explain why this change is needed"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowChangeRequestModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SessionDetails;