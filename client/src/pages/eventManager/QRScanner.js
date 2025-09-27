import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Camera, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Calendar,
  MapPin,
  Clock,
  ScanLine
} from 'lucide-react';
import api from '../../services/api';

const QRScanner = () => {
  const [scanMethod, setScanMethod] = useState('manual'); // 'camera', 'upload', 'manual'
  const [manualInput, setManualInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  const fileInputRef = useRef(null);

  const handleManualScan = async () => {
    if (!manualInput.trim()) {
      setError('Please enter QR code data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/sessions/scan-qr', {
        qrData: manualInput
      });

      const result = {
        ...response.data,
        scannedAt: new Date().toISOString(),
        method: 'manual'
      };

      setScanResult(result);
      setScanHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 scans
      setManualInput('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to scan QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      // In a real application, you would use a QR code reader library to decode the image
      // For now, we'll simulate this with a placeholder
      setError('File upload QR scanning is not yet implemented. Please use manual input.');
    } catch (error) {
      setError('Failed to read QR code from file');
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setScanResult(null);
    setError('');
  };

  const getStatusIcon = (success) => {
    return success ? (
      <CheckCircle className="w-8 h-8 text-green-500" />
    ) : (
      <XCircle className="w-8 h-8 text-red-500" />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Session QR Scanner</h1>
        <p className="text-gray-600">Scan session QR codes to verify speaker check-ins</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan QR Code</h2>
          
          {/* Scan Method Selector */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setScanMethod('manual')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                scanMethod === 'manual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ScanLine className="w-4 h-4 inline mr-2" />
              Manual Input
            </button>
            <button
              onClick={() => setScanMethod('upload')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                scanMethod === 'upload'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Image
            </button>
            <button
              onClick={() => setScanMethod('camera')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                scanMethod === 'camera'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              disabled
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Camera (Soon)
            </button>
          </div>

          {/* Manual Input */}
          {scanMethod === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste QR Code Data
                </label>
                <textarea
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste the QR code JSON data here..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleManualScan}
                disabled={loading || !manualInput.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="loading-spinner mr-2" />
                ) : (
                  <QrCode className="w-4 h-4 mr-2" />
                )}
                Scan QR Code
              </button>
            </div>
          )}

          {/* File Upload */}
          {scanMethod === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Click to upload QR code image</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, or other image formats</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Camera Scanner */}
          {scanMethod === 'camera' && (
            <div className="text-center py-8">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Camera scanning coming soon...</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Scan Result</h2>
            {scanResult && (
              <button
                onClick={clearResult}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>

          {scanResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                {getStatusIcon(scanResult.message.includes('successfully'))}
              </div>

              <div className="text-center mb-4">
                <p className={`font-medium ${
                  scanResult.message.includes('successfully') ? 'text-green-700' : 'text-red-700'
                }`}>
                  {scanResult.message}
                </p>
              </div>

              {scanResult.session && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{scanResult.session.title}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      {scanResult.session.speakerName}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {scanResult.session.timeSlot || 'Time TBD'}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {scanResult.session.room || 'Room TBD'}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Track: {scanResult.session.track || 'Not assigned'}
                    </div>
                  </div>

                  {scanResult.session.checkedIn && (
                    <div className="mt-3 p-2 bg-green-100 rounded border border-green-200">
                      <p className="text-green-700 text-sm font-medium">
                        ✓ Checked in at {new Date(scanResult.session.checkedInAt).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Scan a QR code to see results here</p>
            </div>
          )}
        </div>
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Scans</h2>
          <div className="space-y-3">
            {scanHistory.map((scan, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {getStatusIcon(scan.message.includes('successfully'))}
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      {scan.session?.title || 'Unknown Session'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {scan.session?.speakerName} • {new Date(scan.scannedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    scan.message.includes('successfully') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {scan.message.includes('successfully') ? 'Verified' : 'Failed'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default QRScanner;