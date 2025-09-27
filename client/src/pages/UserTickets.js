import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Ticket, 
  Download, 
  Share2, 
  Calendar, 
  MapPin, 
  Clock,
  QrCode,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';

const UserTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/events/my/tickets');
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = (ticket) => {
    // Create a downloadable image of the ticket
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 600;
    canvas.height = 800;
    
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(0, 0, canvas.width, 100);
    
    // Event name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(ticket.event?.name || 'Event Ticket', canvas.width / 2, 45);
    
    // Ticket ID
    ctx.font = '16px Arial';
    ctx.fillText(`Ticket ID: ${ticket.id}`, canvas.width / 2, 70);
    
    // User info
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.fillText(`Name: ${ticket.userName}`, 50, 150);
    ctx.fillText(`Email: ${ticket.userEmail}`, 50, 180);
    
    // Event info
    if (ticket.event) {
      ctx.fillText(`Date: ${new Date(ticket.event.startDate).toLocaleDateString()}`, 50, 220);
      ctx.fillText(`Venue: ${ticket.event.venue || ticket.event.location}`, 50, 250);
    }
    
    // QR Code placeholder (in a real implementation, you'd render the actual QR code)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(200, 300, 200, 200);
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR CODE', 300, 410);
    
    // Status
    ctx.textAlign = 'center';
    ctx.fillStyle = ticket.isUsed ? '#ef4444' : '#10b981';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(ticket.isUsed ? 'USED' : 'VALID', canvas.width / 2, 550);
    
    // Download
    const link = document.createElement('a');
    link.download = `ticket-${ticket.id}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const shareTicket = async (ticket) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ticket.event?.name || 'Event'} Ticket`,
          text: `My ticket for ${ticket.event?.name || 'the event'}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Ticket link copied to clipboard!');
    }
  };

  const getStatusColor = (ticket) => {
    if (ticket.isUsed) return 'text-red-400';
    if (ticket.status === 'active') return 'text-green-400';
    return 'text-yellow-400';
  };

  const getStatusIcon = (ticket) => {
    if (ticket.isUsed) return <XCircle className="w-5 h-5" />;
    if (ticket.status === 'active') return <CheckCircle className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Tickets</h1>
          <p className="text-purple-200">Your event tickets and QR codes</p>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">No Tickets Yet</h3>
            <p className="text-purple-200">Register for events to get your tickets here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {ticket.event?.name || 'Event Ticket'}
                    </h3>
                    <p className="text-purple-200 text-sm">
                      Ticket ID: {ticket.id.split('-').pop()}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-2 ${getStatusColor(ticket)}`}>
                    {getStatusIcon(ticket)}
                    <span className="text-sm font-medium capitalize">
                      {ticket.isUsed ? 'Used' : ticket.status}
                    </span>
                  </div>
                </div>

                {ticket.event && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-purple-200 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(ticket.event.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-purple-200 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(ticket.event.startDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center text-purple-200 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      {ticket.event.venue || ticket.event.location}
                    </div>
                  </div>
                )}

                {ticket.qrCode && (
                  <div className="bg-white rounded-lg p-4 mb-4 text-center">
                    <img 
                      src={ticket.qrCode} 
                      alt="QR Code" 
                      className="w-32 h-32 mx-auto mb-2"
                    />
                    <p className="text-gray-600 text-xs">
                      Show this QR code at the event entrance
                    </p>
                  </div>
                )}

                {ticket.isUsed && ticket.usedAt && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                    <p className="text-red-200 text-sm">
                      Used on {new Date(ticket.usedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    View QR
                  </button>
                  <button
                    onClick={() => downloadTicket(ticket)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => shareTicket(ticket)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* QR Code Modal */}
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {selectedTicket.event?.name || 'Event Ticket'}
                </h3>
                
                {selectedTicket.qrCode && (
                  <div className="mb-4">
                    <img 
                      src={selectedTicket.qrCode} 
                      alt="QR Code" 
                      className="w-48 h-48 mx-auto border rounded-lg"
                    />
                  </div>
                )}
                
                <div className="text-left space-y-2 mb-4 bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {selectedTicket.userName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {selectedTicket.userEmail}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Ticket ID:</strong> {selectedTicket.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> 
                    <span className={`ml-1 ${selectedTicket.isUsed ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedTicket.isUsed ? 'Used' : 'Valid'}
                    </span>
                  </p>
                </div>
                
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default UserTickets;