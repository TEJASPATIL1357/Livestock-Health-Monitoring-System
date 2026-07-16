import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8085/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
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

// Global Response Error Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Network/Server Error:', error.message);
      // Dispatch custom event so UI can show a global disconnected state
      window.dispatchEvent(new CustomEvent('sih-api-error', { detail: { message: 'Cannot connect to server', status: 0 } }));
      return Promise.reject(error);
    }
    
    const { status, data } = error.response;
    let errorMessage = data?.message || data || 'An error occurred';

    switch (status) {
      case 401:
        console.error('Unauthorized. Logging out.');
        // Don't redirect if it's the login endpoint itself
        if (error.config && error.config.url && !error.config.url.includes('/auth/login')) {
          logout();
          window.location.href = '/';
        }
        break;
      case 403:
        console.error('Forbidden access.');
        errorMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        console.error('Resource not found.');
        errorMessage = 'The requested data could not be found.';
        break;
      case 500:
        console.error('Internal Server Error.');
        errorMessage = 'A server error occurred. Please try again later.';
        break;
      default:
        console.error(`API Error [${status}]:`, errorMessage);
    }

    // Fire global event for toasts/banners if needed
    window.dispatchEvent(new CustomEvent('sih-api-error', { detail: { message: errorMessage, status } }));
    
    // Attach the friendly message to the original error object
    error.message = errorMessage;
    return Promise.reject(error);
  }
);

// Helper to check authentication
export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

// Log in
export async function login(username, password) {
  const response = await api.post('/auth/login', { username, password });
  if (response.data && response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('role', response.data.role || 'FARMER');
  }
  return response.data;
}

// Register
export async function register(name, phone, email, password) {
  const response = await api.post('/auth/register', { name, phone, email, password });
  return response.data;
}

// Forgot Password
export async function forgotPassword(email) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

// Log out
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
}

// Admin API
export async function getPendingUsers() {
  const response = await api.get('/admin/users/pending');
  return response.data;
}

export async function approveUser(id) {
  const response = await api.put(`/admin/users/${id}/approve`);
  return response.data;
}

export async function rejectUser(id) {
  const response = await api.put(`/admin/users/${id}/reject`);
  return response.data;
}

export async function getDevices() {
  const response = await api.get('/devices');
  return response.data;
}

export default api;
