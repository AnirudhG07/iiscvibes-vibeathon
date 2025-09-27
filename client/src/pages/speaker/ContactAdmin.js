import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, User, Mail, Phone, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ContactAdmin = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'session', label: 'Session Related' },
    { value: 'payment', label: 'Payment/Registration' },
    { value: 'venue', label: 'Venue Information' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/messages/contact-admin', {
        ...formData,
        senderName: user.name,
        senderEmail: user.email,
        senderRole: user.role
      });

      toast.success('Message sent successfully! Admin will respond soon.');
      setFormData({
        subject: '',
        message: '',
        priority: 'medium',
        category: 'general'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Contact Admin</h1>
        <p className="text-gray-600 mt-2">
          Need help? Send a message to the event administrators
        </p>
      </div>

      {/* Contact Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>{user.name}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Priority</label>
              <select
                className="form-input"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                required
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-input"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="Brief description of your inquiry"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="form-label">Message</label>
            <textarea
              className="form-input"
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Please describe your inquiry in detail..."
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="loading-spinner" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Help Section */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <HelpCircle className="w-5 h-5 mr-2" />
          Quick Help
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium text-gray-900">Session Issues</h4>
            <p className="text-gray-600">For session-related problems, please include your session ID and specific details.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Technical Problems</h4>
            <p className="text-gray-600">Include browser information and steps to reproduce the issue.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Response Time</h4>
            <p className="text-gray-600">We typically respond within 24 hours during business days.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactAdmin;