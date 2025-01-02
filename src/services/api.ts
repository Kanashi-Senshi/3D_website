// src/services/api.ts
import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dicomService = {
  uploadFiles: async (files: File[], patientId: string) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('patientId', patientId);
    const { data } = await api.post('/dicom/upload', formData);
    return data;
  },

  getOrders: async (status: 'current' | 'completed') => {
    const { data } = await api.get(`/dicom/orders?status=${status}`);
    return data;
  },

  getOrderDetails: async (orderId: string) => {
    const { data } = await api.get(`/dicom/orders/${orderId}`);
    return data;
  },

  updateOrderStatus: async (orderId: string, status: string, progress: number) => {
    const { data } = await api.patch(`/dicom/orders/${orderId}/status`, {
      status,
      progress
    });
    return data;
  },

  addCollaboratingDoctor: async (orderId: string, doctorId: string) => {
    const { data } = await api.post(`/dicom/orders/${orderId}/collaborators`, {
      doctorId
    });
    return data;
  }
};

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
