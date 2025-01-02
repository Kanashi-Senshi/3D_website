// Edit 17-12-2024 User Management/useDashboardData.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.id) return;
        
        setLoading(true);
        const data = await userService.getDashboardData(user.id);
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  return { loading, error, dashboardData };
};

const Dashboard = () => {
  const { loading, error, dashboardData } = useDashboardData();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div>
      <h2>Welcome {dashboardData.user.name}</h2>
      <StatsSection stats={dashboardData.stats} />
      {/* Other sections */}
    </div>
  );
