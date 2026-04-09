import axios from 'axios';

/**
 * api.js — Axios instance for secure cookie-based auth.
 */

// Helper to read Django's CSRF cookie
function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // MANDATORY: Sends cookies with every request
  headers: { 'Content-Type': 'application/json' },
});

// 1. CSRF INTERCEPTOR: Inject token for POST, PUT, PATCH, DELETE
api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  // Note: No more Authorization Bearer header needed! Cookies handle it now.
  return config;
});

// 2. AUTH ERROR INTERCEPTOR: Handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and NOT on auth pages, redirect to login
      const isAuthPage = ['/login', '/signup', '/'].includes(window.location.pathname);
      if (!isAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
