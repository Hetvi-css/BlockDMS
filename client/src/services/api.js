import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('dms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dms_token');
      localStorage.removeItem('dms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (data) => API.post('/auth/login', data);
export const logout = () => API.post('/auth/logout');
export const getMe = () => API.get('/auth/me');

// Users
export const getUsers = (params) => API.get('/users', { params });
export const createUser = (data) => API.post('/users', data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const getUserStats = () => API.get('/users/stats');

// Documents
export const uploadDocument = (data) => API.post('/documents/upload', data);
export const getDocuments = (params) => API.get('/documents', { params });
export const getDocumentById = (id) => API.get(`/documents/${id}`);
export const approveDocument = (id, data) => API.patch(`/documents/${id}/approve`, data);
export const rejectDocument = (id, data) => API.patch(`/documents/${id}/reject`, data);
export const escalateDocument = (id, data) => API.patch(`/documents/${id}/escalate`, data);
export const verifyDocument = (id, data) => API.post(`/documents/${id}/verify`, data);
export const getDocumentStats = () => API.get('/documents/stats');

// Audit
export const getAuditLogs = (params) => API.get('/audit', { params });

// Blockchain
export const getBlockchainStats = () => API.get('/blockchain/stats');
export const getBlockchainRecords = (params) => API.get('/blockchain/records', { params });
export const getDocumentChain = (docId) => API.get(`/blockchain/document/${docId}`);

// Reports
export const getOverviewReport = () => API.get('/reports/overview');

export default API;
