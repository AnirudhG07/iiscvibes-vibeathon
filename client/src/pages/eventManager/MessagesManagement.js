import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  User, 
  Calendar, 
  Tag, 
  AlertCircle,
  CheckCircle,
  Clock,
  Reply,
  Archive,
  Mail,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const MessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  const priorities = {
    low: { color: 'bg-green-100 text-green-800', icon: Clock },
    medium: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    high: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    urgent: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
  };

  const statuses = {
    new: { color: 'bg-blue-100 text-blue-800', icon: Mail },
    in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    archived: { color: 'bg-gray-100 text-gray-800', icon: Archive }
  };

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/messages/admin?filter=${filter}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Use sample data for demo
      setMessages([
        {
          id: 'msg-001',
          subject: 'Session Time Change Request',
          message: 'Hello, I need to request a time change for my session "AI in Healthcare" due to a scheduling conflict.',
          category: 'session',
          priority: 'high',
          status: 'new',
          senderName: 'Demo Speaker',
          senderEmail: 'demo.speaker@vibeathon.com',
          senderRole: 'speaker',
          createdAt: new Date().toISOString(),
          lastReply: null
        },
        {
          id: 'msg-002',
          subject: 'Technical Issue with QR Code',
          message: 'I am unable to download my QR code. The download button is not working properly.',
          category: 'technical',
          priority: 'medium',
          status: 'in_progress',
          senderName: 'Jane Smith',
          senderEmail: 'jane.smith@example.com',
          senderRole: 'speaker',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastReply: new Date(Date.now() - 43200000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      await api.put(`/messages/${messageId}/status`, { status: newStatus });
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: newStatus } : msg
      ));
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/messages/${selectedMessage.id}/reply`, {
        message: replyMessage
      });
      toast.success('Reply sent successfully');
      setShowReplyModal(false);
      setReplyMessage('');
      handleStatusChange(selectedMessage.id, 'in_progress');
      fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const getPriorityConfig = (priority) => priorities[priority] || priorities.medium;
  const getStatusConfig = (status) => statuses[status] || statuses.new;

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
          <h1 className="text-3xl font-bold text-gray-900">Messages & Support</h1>
          <p className="text-gray-600 mt-1">Manage user inquiries and support requests</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input"
          >
            <option value="all">All Messages</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="high_priority">High Priority</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {messages.filter(m => m.status === 'new').length}
          </div>
          <div className="text-gray-600">New Messages</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {messages.filter(m => m.status === 'in_progress').length}
          </div>
          <div className="text-gray-600">In Progress</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {messages.filter(m => m.priority === 'high' || m.priority === 'urgent').length}
          </div>
          <div className="text-gray-600">High Priority</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {messages.filter(m => m.status === 'resolved').length}
          </div>
          <div className="text-gray-600">Resolved</div>
        </div>
      </div>

      {/* Messages List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
        
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No messages found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const priorityConfig = getPriorityConfig(message.priority);
              const statusConfig = getStatusConfig(message.status);
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{message.subject}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                          {message.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          {message.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{message.message}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          <span>{message.senderName}</span>
                        </div>
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 mr-1" />
                          <span className="capitalize">{message.category}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <select
                        value={message.status}
                        onChange={(e) => handleStatusChange(message.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                      </select>
                      
                      <button
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowReplyModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-4">Reply to Message</h2>
            
            {/* Original Message */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-2">{selectedMessage.subject}</h3>
              <p className="text-gray-600 text-sm mb-2">{selectedMessage.message}</p>
              <div className="text-xs text-gray-500">
                From: {selectedMessage.senderName} ({selectedMessage.senderEmail})
              </div>
            </div>
            
            <form onSubmit={handleReply} className="space-y-4">
              <div>
                <label className="form-label">Your Reply</label>
                <textarea
                  className="form-input"
                  rows={6}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Reply className="w-4 h-4" />
                  <span>Send Reply</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MessagesManagement;