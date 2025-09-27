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
  updateAgenda: (data) => api.put('/agenda', data),
  publishAgenda: () => api.post('/agenda/publish'),
  addAgendaItem: (data) => api.post('/agenda/item', data),
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

export default api;