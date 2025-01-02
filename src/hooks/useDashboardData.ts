// src/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardData } from '../types/dashboard';
import axios from 'axios';
import { API_URL } from '../config';

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token || !user?.id) {
        throw new Error('Authentication required');
      }

      console.log('Fetching dashboard data');

      const response = await axios.get(`${API_URL}/api/users/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Dashboard response:', response.data);

      if (!response.data) {
        throw new Error('No data received from server');
      }

      setData(response.data);
    } catch (err) {
      console.error('Dashboard data error:', err);
      if (axios.isAxiosError(err)) {
        const errMsg = err.response?.data?.error || err.response?.data?.details || err.message;
        setError(new Error(errMsg));
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          window.location.href = '/';
        }
      } else {
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  return { data, loading, error, refetch: fetchData };
