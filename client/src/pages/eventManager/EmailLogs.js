import React, { useState, useEffect } from 'react';
import { EnvelopeIcon, ClockIcon, UserIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const EmailLogs = () => {
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const fetchEmailLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email/logs');
      const data = await response.json();
      
      if (data.success) {
        setEmailLogs(data.logs);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch email logs');
      console.error('Email logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'logged_demo_mode':
        return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'sent':
        return 'Sent';
      case 'logged_demo_mode':
        return 'Demo Mode';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <EnvelopeIcon className="w-8 h-8 mr-3 text-blue-600" />
                Email Logs
              </h2>
              <p className="text-gray-600 mt-1">
                View all emails that have been sent or would be sent by the system
              </p>
            </div>
            <button
              onClick={fetchEmailLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {emailLogs.length === 0 ? (
          <div className="p-12 text-center">
            <EnvelopeIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No emails yet</h3>
            <p className="text-gray-600">
              Email logs will appear here when emails are sent or logged by the system.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {emailLogs.map((email) => (
              <div
                key={email.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedEmail(email)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {getStatusIcon(email.status)}
                        <span className="ml-2 text-sm font-medium text-gray-600">
                          {getStatusText(email.status)}
                        </span>
                      </div>
                      <div className="ml-4 flex items-center text-sm text-gray-500">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatDate(email.timestamp)}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {email.subject}
                    </h3>
                    
                    <div className="flex items-center mb-2">
                      <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">To: {email.to}</span>
                    </div>
                    
                    {email.html && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {email.html.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Email Details</h3>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex items-center">
                    {getStatusIcon(selectedEmail.status)}
                    <span className="ml-2 text-sm font-medium">
                      {getStatusText(selectedEmail.status)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedEmail.timestamp)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <p className="text-sm text-gray-900">{selectedEmail.to}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-sm text-gray-900">{selectedEmail.subject}</p>
                </div>
                
                {selectedEmail.html && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content Preview</label>
                    <div 
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                    />
                  </div>
                )}
                
                {selectedEmail.attachments && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                    <p className="text-sm text-gray-600">{selectedEmail.attachments}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailLogs;