import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Intercept responses — if 401, token expired → auto logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;