// src/services/api.ts

import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {}; // Ensure headers is not undefined
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dashboardService = {
  async getDashboardStats(userId: string) {
    const { data } = await api.get(`/users/${userId}/dashboard/stats`);
    return data;
  },
  async getAppointments(userId: string) {
    const { data } = await api.get(`/users/${userId}/appointments`);
    return data;
  },
  async getFiles(userId: string) {
    const { data } = await api.get(`/users/${userId}/files`);
    return data;
  },
};
