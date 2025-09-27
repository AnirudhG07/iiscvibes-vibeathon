import React, { useState } from 'react';
import { EnvelopeIcon, ExclamationCircleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const EmailDemo = () => {
  const [testEmail, setTestEmail] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('test');

  const handleInputChange = (e) => {
    setTestEmail({ ...testEmail, [e.target.name]: e.target.value });
  };

  const sendTestEmail = async () => {
    if (!testEmail.to || !testEmail.subject || !testEmail.message) {
      setResult({
        success: false,
        message: 'Please fill in all fields'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testEmail)
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setTestEmail({ to: '', subject: '', message: '' });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to send test email'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMailtoLink = async () => {
    if (!testEmail.to || !testEmail.subject || !testEmail.message) {
      setResult({
        success: false,
        message: 'Please fill in all fields'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/email/mailto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testEmail)
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to generate mailto link'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <EnvelopeIcon className="w-8 h-8 mr-3 text-blue-600" />
            Email Functionality Demo
          </h2>
          <p className="text-gray-600 mt-1">
            Test the email system without API keys - emails will be logged and can be sent via mailto links
          </p>
        </div>

        {/* Information Card */}
        <div className="p-6 bg-blue-50 border-l-4 border-blue-400">
          <div className="flex">
            <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">How this works without API keys:</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Demo Mode:</strong> All emails are logged to a file instead of being sent</li>
                  <li><strong>Mailto Links:</strong> Generate links that open the user's default email client</li>
                  <li><strong>Email Logs:</strong> View all emails that would have been sent in the Email Logs tab</li>
                  <li><strong>Production Ready:</strong> Add SMTP credentials to .env file to send real emails</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('test')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'test'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Test Email
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'setup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Production Setup
            </button>
          </nav>
        </div>

        {activeTab === 'test' && (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Email
                </label>
                <input
                  type="email"
                  name="to"
                  value={testEmail.to}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="recipient@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={testEmail.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={testEmail.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your message here..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={sendTestEmail}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                  )}
                  Log Email (Demo)
                </button>

                <button
                  onClick={generateMailtoLink}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Generate Mailto Link
                </button>
              </div>

              {result && (
                <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex">
                    {result.success ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    ) : (
                      <ExclamationCircleIcon className="w-5 h-5 text-red-400" />
                    )}
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                        {result.message}
                      </p>
                      {result.mailtoLink && (
                        <div className="mt-2">
                          <a
                            href={result.mailtoLink}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            Click here to open your email client
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Production Email Setup</h3>
                <p className="text-gray-600 mb-4">
                  To send real emails in production, add these environment variables to your .env file:
                </p>
              </div>

              <div className="bg-gray-900 rounded-lg p-4">
                <code className="text-green-400 text-sm">
                  {`# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Or use other providers:
# EMAIL_HOST=smtp-mail.outlook.com (for Outlook)
# EMAIL_HOST=smtp.mailgun.org (for Mailgun)
# EMAIL_HOST=smtp.sendgrid.net (for SendGrid)`}
                </code>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Popular Email Services:</h4>
                  <ul className="mt-2 space-y-2 text-sm text-gray-600">
                    <li><strong>Gmail:</strong> Use App Passwords instead of your regular password</li>
                    <li><strong>Outlook:</strong> Use your regular Microsoft account credentials</li>
                    <li><strong>SendGrid:</strong> Create API key and use with SMTP</li>
                    <li><strong>Mailgun:</strong> Use SMTP credentials from your domain settings</li>
                    <li><strong>AWS SES:</strong> Use SMTP credentials from SES console</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Alternative: Serverless Email</h4>
                  <p className="mt-2 text-sm text-gray-600">
                    For serverless deployments, consider using:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• Resend (modern email API)</li>
                    <li>• Postmark (transactional emails)</li>
                    <li>• EmailJS (client-side email sending)</li>
                    <li>• Formspree (form-to-email service)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationCircleIcon className="w-5 h-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Security Note:</strong> Never commit email credentials to version control. 
                      Always use environment variables and add .env to your .gitignore file.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailDemo;