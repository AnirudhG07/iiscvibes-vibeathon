import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  FileText,
  MessageSquare,
  Filter
} from 'lucide-react';
import { sessionAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ChangeRequests = () => {
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    action: 'approve',
    adminComments: ''
  });

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
  };

  const typeConfig = {
    title: { label: 'Title Change', icon: FileText },
    abstract: { label: 'Abstract Change', icon: FileText },
    duration: { label: 'Duration Change', icon: Clock },
    requirements: { label: 'Requirements Change', icon: FileText },
    timeSlot: { label: 'Time Slot Change', icon: Calendar },
    room: { label: 'Room Change', icon: Calendar },
    other: { label: 'Other Change', icon: AlertTriangle }
  };

  useEffect(() => {
    fetchChangeRequests();
  }, [filter]);

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      const response = await sessionAPI.getChangeRequests({ status: filter });
      setChangeRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching change requests:', error);
      // Use sample data for demo
      setChangeRequests([
        {
          id: 'cr-001',
          sessionId: 'session-001',
          sessionTitle: 'The Future of AI in Enterprise Applications',
          speakerName: 'Demo Speaker',
          type: 'timeSlot',
          currentValue: '10:00 AM - 10:45 AM',
          requestedValue: '2:00 PM - 2:45 PM',
          reason: 'I have a conflict with my flight schedule and need to present later in the day.',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'cr-002', 
          sessionId: 'ad156e6b-d4aa-44c4-8437-d36973bd2ceb',
          sessionTitle: 'bruh bruh bruh bruh bruh',
          speakerName: 'Demo Speaker',
          type: 'title',
          currentValue: 'bruh bruh bruh bruh bruh',
          requestedValue: 'Advanced Machine Learning Techniques',
          reason: 'I realized the title was not professional and would like to change it to something more appropriate.',
          status: 'pending',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async (e) => {
    e.preventDefault();
    try {
      await sessionAPI.handleChangeRequest(selectedRequest.id, reviewData);
      toast.success(`Change request ${reviewData.action}d successfully`);
      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewData({ action: 'approve', adminComments: '' });
      fetchChangeRequests();
    } catch (error) {
      console.error('Error reviewing change request:', error);
      toast.error('Failed to process change request');
    }
  };

  const getStatusConfig = (status) => statusConfig[status] || statusConfig.pending;
  const getTypeConfig = (type) => typeConfig[type] || typeConfig.other;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Change Requests</h1>
          <p className="text-gray-600 mt-1">Review and manage session change requests from speakers</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {changeRequests.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-gray-600">Pending</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {changeRequests.filter(r => r.status === 'approved').length}
          </div>
          <div className="text-gray-600">Approved</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {changeRequests.filter(r => r.status === 'rejected').length}
          </div>
          <div className="text-gray-600">Rejected</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{changeRequests.length}</div>
          <div className="text-gray-600">Total Requests</div>
        </div>
      </div>

      {/* Change Requests List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Change Requests</h2>
        
        {changeRequests.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No change requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {changeRequests.map((request) => {
              const statusInfo = getStatusConfig(request.status);
              const typeInfo = getTypeConfig(request.type);
              const StatusIcon = statusInfo.icon;
              const TypeIcon = typeInfo.icon;
              
              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <TypeIcon className="w-5 h-5 text-gray-500" />
                        <h3 className="font-semibold text-gray-900">{typeInfo.label}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="font-medium text-gray-900">{request.sessionTitle}</p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <User className="w-4 h-4 mr-1" />
                          <span>{request.speakerName}</span>
                          <Calendar className="w-4 h-4 ml-4 mr-1" />
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Current Value:</p>
                          <p className="text-sm text-gray-600 bg-red-50 p-2 rounded border-l-4 border-red-200">
                            {request.currentValue}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Requested Value:</p>
                          <p className="text-sm text-gray-600 bg-green-50 p-2 rounded border-l-4 border-green-200">
                            {request.requestedValue}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">Reason:</p>
                        <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewData({ action: 'approve', adminComments: '' });
                            setShowReviewModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewData({ action: 'reject', adminComments: '' });
                            setShowReviewModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-4">
              Review Change Request
            </h2>
            
            {/* Request Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-2">{selectedRequest.sessionTitle}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Current:</p>
                  <p className="text-gray-600">{selectedRequest.currentValue}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Requested:</p>
                  <p className="text-gray-600">{selectedRequest.requestedValue}</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="font-medium text-gray-700">Reason:</p>
                <p className="text-gray-600">{selectedRequest.reason}</p>
              </div>
            </div>
            
            <form onSubmit={handleReviewRequest} className="space-y-4">
              <div>
                <label className="form-label">Action</label>
                <select
                  className="form-input"
                  value={reviewData.action}
                  onChange={(e) => setReviewData({...reviewData, action: e.target.value})}
                  required
                >
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Comments (optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={reviewData.adminComments}
                  onChange={(e) => setReviewData({...reviewData, adminComments: e.target.value})}
                  placeholder="Add any comments for the speaker..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedRequest(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn-primary ${reviewData.action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  {reviewData.action === 'approve' ? 'Approve' : 'Reject'} Request
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ChangeRequests;