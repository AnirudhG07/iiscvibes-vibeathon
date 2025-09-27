import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Scan, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  User,
  Calendar,
  MapPin,
  Clock,
  Ticket
} from 'lucide-react';
import api from '../services/api';

const AdminQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [location, setLocation] = useState('event-entrance');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    fetchScanHistory();
    return () => {
      stopCamera();
    };
  }, []);

  const fetchScanHistory = async () => {
    try {
      const response = await api.get('/admin/qr-scans');
      setScanHistory(response.data.scans || []);
    } catch (error) {
      console.error('Error fetching scan history:', error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      alert('Unable to access camera. Please check permissions or use manual input.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      // In a real implementation, you would use a QR code library here
      // For demo purposes, we'll simulate QR code detection
      const imageData = canvas.toDataURL();
      processQRCode(imageData);
    }
  };

  const processQRCode = async (qrData) => {
    // In a real implementation, you would decode the QR code from the image
    // For demo purposes, we'll use manual input
    alert('QR Code detected! Please use manual input for demo.');
  };

  const scanTicket = async (ticketData) => {
    if (!ticketData.trim()) {
      alert('Please provide ticket data');
      return;
    }

    setLoading(true);
    setScanResult(null);

    try {
      const response = await api.post('/events/tickets/scan', {
        ticketData: ticketData.trim(),
        location
      });

      setScanResult({
        success: true,
        ...response.data
      });

      // Refresh scan history
      fetchScanHistory();
      setManualInput('');
    } catch (error) {
      setScanResult({
        success: false,
        message: error.response?.data?.message || 'Scan failed',
        error: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualScan = () => {
    scanTicket(manualInput);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // In a real implementation, you would decode QR from the image
        alert('File uploaded! Please use manual input for demo.');
      };
      reader.readAsDataURL(file);
    }
  };

  const getResultIcon = (result) => {
    if (result.success) {
      return <CheckCircle2 className="w-8 h-8 text-green-500" />;
    }
    return <XCircle className="w-8 h-8 text-red-500" />;
  };

  const getResultColor = (result) => {
    if (result.success) {
      return 'border-green-500 bg-green-50';
    }
    return 'border-red-500 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">QR Ticket Scanner</h1>
          <p className="text-purple-200">Scan event tickets for check-in</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div className="space-y-6">
            {/* Location Selection */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Scan Location</h3>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="event-entrance">Event Entrance</option>
                <option value="registration-desk">Registration Desk</option>
                <option value="session-hall">Session Hall</option>
                <option value="networking-area">Networking Area</option>
                <option value="food-court">Food Court</option>
              </select>
            </div>

            {/* Camera Scanner */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Camera Scanner
              </h3>
              
              {!isScanning ? (
                <div className="text-center">
                  <button
                    onClick={startCamera}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center mx-auto"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Start Camera
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={captureFrame}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Scan className="w-4 h-4 mr-2" />
                      Capture
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      Stop
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Manual Input */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Manual Input</h3>
              <div className="space-y-4">
                <textarea
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste ticket QR data here..."
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                />
                <button
                  onClick={handleManualScan}
                  disabled={!manualInput.trim() || loading}
                  className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Scan className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Scanning...' : 'Scan Ticket'}
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Upload QR Image</h3>
              <label className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Scan Result */}
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`border-2 rounded-xl p-6 ${getResultColor(scanResult)}`}
              >
                <div className="flex items-center mb-4">
                  {getResultIcon(scanResult)}
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {scanResult.success ? 'Scan Successful' : 'Scan Failed'}
                    </h3>
                    <p className="text-gray-600">{scanResult.message}</p>
                  </div>
                </div>

                {scanResult.success && scanResult.user && (
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-500 mr-2" />
                      <span className="font-medium">{scanResult.user.name}</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {scanResult.user.role}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Ticket className="w-5 h-5 text-gray-500 mr-2" />
                      <span className="text-gray-600">{scanResult.user.email}</span>
                    </div>
                    {scanResult.event && (
                      <>
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                          <span className="text-gray-600">{scanResult.event.name}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                          <span className="text-gray-600">{scanResult.event.location}</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-500 mr-2" />
                      <span className="text-gray-600">
                        Scanned at {new Date(scanResult.scan?.scannedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {!scanResult.success && scanResult.error && (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{JSON.stringify(scanResult.error, null, 2)}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Scan History */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Scans</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {scanHistory.length === 0 ? (
                  <p className="text-purple-200 text-center py-4">No scans yet</p>
                ) : (
                  scanHistory.slice(0, 10).map((scan, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">
                            {scan.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-purple-200 text-sm">
                            {scan.location} • {new Date(scan.scannedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminQRScanner;