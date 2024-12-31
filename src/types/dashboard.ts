// src/types/dashboard.ts
import { ReactNode } from 'react';

export interface DashboardData {
  activeFiles: number;
  newFiles: number;
  appointments: number;
  nextAppointment?: string;
  connections: number;
  newConnections: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  icon: ReactNode;
  description: string;
  time: string;
  type: 'file' | 'appointment' | 'team';
}