const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const speakerRoutes = require('./routes/speakers');
const sessionRoutes = require('./routes/sessions');
const eventManagerRoutes = require('./routes/eventManager');
const agendaRoutes = require('./routes/agenda');
const notificationRoutes = require('./routes/notifications');
const qrRoutes = require('./routes/qr');
const feedbackRoutes = require('./routes/feedback');
const messagesRoutes = require('./routes/messages');
const emailRoutes = require('./routes/email');
const eventsRoutes = require('./routes/events');
const adminRoutes = require('./routes/admin');
const eventApplicationsRoutes = require('./routes/eventApplications');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/speakers', speakerRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/event-manager', eventManagerRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/event-applications', eventApplicationsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});