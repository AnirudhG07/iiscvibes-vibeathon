import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  QrCodeIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../services/api';

const AdminQRManagement = () => {
  const [users, setUsers] = useState([]);
  const [qrScans, setQrScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [generatedQR, setGeneratedQR] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, scansData] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getQRScans()
      ]);
      setUsers(usersData.filter(user => user.role !== 'admin'));
      setQrScans(scansData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (userId) => {
    setGenerating(true);
    try {
      const response = await adminAPI.generateQR(userId);
      setGeneratedQR(response);
      setSelectedUser(users.find(u => u.id === userId));
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    } finally {
      setGenerating(false);
    }
  };

  const handleScanQR = async (qrData) => {
    try {
      await adminAPI.scanQR(qrData);
      await fetchData(); // Refresh scan data
      alert('QR code scanned successfully!');
    } catch (error) {
      console.error('Error scanning QR code:', error);
      alert('Failed to scan QR code');
    }
  };

  const downloadQR = () => {
    if (generatedQR && generatedQR.qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = `qr-code-${selectedUser?.name || 'user'}.png`;
      link.href = generatedQR.qrCodeDataUrl;
      link.click();
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentScans = qrScans.slice(0, 10);

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
          <h1 className="text-3xl font-bold text-gray-900">QR Code Management</h1>
          <p className="mt-2 text-gray-600">
            Generate and manage QR codes for users and track scans
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Generation Section */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Generate QR Codes</h2>
            </div>
            <div className="p-6">
              {/* Search Users */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'speaker' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'organizer' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleGenerateQR(user.id)}
                      disabled={generating}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <QrCodeIcon className="h-4 w-4 mr-2" />
                          Generate QR
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search terms.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Generated QR Display & Recent Scans */}
        <div className="space-y-6">
          {/* Generated QR Code */}
          {generatedQR && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white shadow rounded-lg"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Generated QR Code</h3>
              </div>
              <div className="p-6 text-center">
                <div className="mb-4">
                  <img
                    src={generatedQR.qrCodeDataUrl}
                    alt="Generated QR Code"
                    className="mx-auto w-48 h-48 border border-gray-200 rounded-lg"
                  />
                </div>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">{selectedUser?.name}</h4>
                  <p className="text-sm text-gray-500">{selectedUser?.email}</p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={downloadQR}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Download QR
                  </button>
                  <button
                    onClick={() => handleScanQR(generatedQR.qrData)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Test Scan
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recent Scans */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Scans</h3>
            </div>
            <div className="p-6">
              {recentScans.length === 0 ? (
                <div className="text-center py-8">
                  <QrCodeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No scans yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    QR code scans will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentScans.map((scan) => {
                    const user = users.find(u => u.id === scan.userId);
                    return (
                      <div key={scan.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <QrCodeIcon className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(scan.scannedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scan Statistics */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Scan Statistics</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{qrScans.length}</div>
              <div className="text-sm text-gray-500">Total Scans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(qrScans.map(scan => scan.userId)).size}
              </div>
              <div className="text-sm text-gray-500">Unique Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {qrScans.filter(scan => {
                  const scanDate = new Date(scan.scannedAt);
                  const today = new Date();
                  return scanDate.toDateString() === today.toDateString();
                }).length}
              </div>
              <div className="text-sm text-gray-500">Today's Scans</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminQRManagement;