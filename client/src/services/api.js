import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  createAdmin: () => api.post('/auth/create-admin'),
};

// Speaker API
export const speakerAPI = {
  getProfile: () => api.get('/speakers/profile'),
  updateProfile: (data) => api.put('/speakers/profile', data),
  confirmParticipation: (sessionId) => api.post('/speakers/confirm-participation', { sessionId }),
  getDashboard: () => api.get('/speakers/dashboard'),
};

// Session API
export const sessionAPI = {
  submit: (sessionData) => api.post('/sessions/submit', sessionData),
  getMySessions: () => api.get('/sessions/my-sessions'),
  updateSession: (sessionId, data) => api.put(`/sessions/${sessionId}`, data),
  getAllSessions: (params) => api.get('/sessions/all', { params }),
  reviewSession: (sessionId, reviewData) => api.put(`/sessions/${sessionId}/review`, reviewData),
  submitChangeRequest: (data) => api.post('/sessions/change-request', data),
  getChangeRequests: (params) => api.get('/sessions/change-requests', { params }),
  handleChangeRequest: (requestId, data) => api.put(`/sessions/change-requests/${requestId}`, data),
};

// Event Manager API
export const eventManagerAPI = {
  getDashboard: () => api.get('/event-manager/dashboard'),
  getSpeakers: () => api.get('/event-manager/speakers'),
  enableDocumentUpload: (data) => api.post('/event-manager/enable-document-upload', data),
  sendBulkEmail: (data) => api.post('/event-manager/send-bulk-email', data),
  exportSpeakers: () => api.get('/event-manager/export-speakers'),
};

// Agenda API
export const agendaAPI = {
  getAgenda: () => api.get('/agenda'),
  getDraftAgenda: () => api.get('/agenda/draft'),
  getBuilder: () => api.get('/agenda/builder'),
  updateAgenda: (data) => api.put('/agenda', data),
  publishAgenda: () => api.post('/agenda/publish'),
  addAgendaItem: (data) => api.post('/agenda/item', data),
  updateAgendaItem: (id, data) => api.put(`/agenda/item/${id}`, data),
  deleteAgendaItem: (id) => api.delete(`/agenda/item/${id}`),
  importSessions: () => api.post('/agenda/import-sessions'),
};

// QR Code API
export const qrAPI = {
  generateQR: () => api.get('/qr/generate'),
  generateTshirtQR: () => api.get('/qr/tshirt-qr'),
  scanQR: (qrData) => api.post('/qr/scan', { qrData }),
  getScanHistory: () => api.get('/qr/scan-history'),
};

// Notifications API
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  createSystemNotification: (data) => api.post('/notifications/system', data),
  sendReminders: (data) => api.post('/notifications/send-reminders', data),
  getStats: () => api.get('/notifications/stats'),
};

// Feedback API
export const feedbackAPI = {
  submit: (data) => api.post('/feedback/submit', data),
  getSessionFeedback: (sessionId) => api.get(`/feedback/session/${sessionId}`),
  getAllFeedback: (params) => api.get('/feedback/all', { params }),
  getStats: () => api.get('/feedback/stats'),
  export: () => api.get('/feedback/export'),
};

// Events API
export const eventsAPI = {
  getEvents: () => api.get('/events'),
  getEvent: (eventId) => api.get(`/events/${eventId}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (eventId, eventData) => api.put(`/events/${eventId}`, eventData),
  deleteEvent: (eventId) => api.delete(`/events/${eventId}`),
  registerForEvent: (eventId, registrationData) => api.post(`/events/${eventId}/register`, registrationData),
  getEventRegistrations: (eventId) => api.get(`/events/${eventId}/registrations`),
  getUpcoming: () => api.get('/events/upcoming'),
  getMyRegistrations: () => api.get('/events/my/registrations'),
};

// Admin API
export const adminAPI = {
  getPendingApprovals: () => api.get('/admin/pending-approvals'),
  approveRole: (userId, action, reason) => api.put(`/admin/approve-role/${userId}`, { action, reason }),
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, isActive) => api.put(`/admin/users/${userId}/status`, { isActive }),
  generateQR: (userId, eventId) => api.post(`/admin/generate-qr/${userId}`, { eventId }),
  scanQR: (qrData, location) => api.post('/admin/scan-qr', { qrData, location }),
  getQRScans: () => api.get('/admin/qr-scans'),
  
  // User Management
  getUsers: () => api.get('/admin/users'),
  approveUser: (userId) => api.put(`/admin/users/${userId}/approve`),
  rejectUser: (userId) => api.put(`/admin/users/${userId}/reject`),
  deactivateUser: (userId) => api.put(`/admin/users/${userId}/deactivate`),
};

// Event Applications API
export const eventApplicationsAPI = {
  applySpeaker: (eventId, applicationData) => api.post(`/event-applications/apply-speaker/${eventId}`, applicationData),
  applyOrganizer: (eventId, applicationData) => api.post(`/event-applications/apply-organizer/${eventId}`, applicationData),
  getMyApplications: () => api.get('/event-applications/my-applications'),
  getAllApplications: () => api.get('/event-applications/all'),
  getEventApplications: (eventId, params) => api.get(`/event-applications/event/${eventId}`, { params }),
  reviewApplication: (applicationId, reviewData) => api.put(`/event-applications/review/${applicationId}`, reviewData),
  getPendingCount: () => api.get('/event-applications/pending-count'),
};

export default api;