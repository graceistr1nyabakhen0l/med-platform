import axios from 'axios';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// Buat instance axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    // Hanya bisa diakses di client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('med_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk handle response error (seperti 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('med_token');
        localStorage.removeItem('med_user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('med_token', token);
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('med_token');
  }
  return null;
};

export const setUser = (user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('med_user', JSON.stringify(user));
  }
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('med_user');
    if (userStr) return JSON.parse(userStr);
  }
  return null;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('med_token');
    localStorage.removeItem('med_user');
    window.location.href = '/';
  }
};
