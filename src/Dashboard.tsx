// src/Dashboard.tsx
import React, { useState } from 'react';
import { DashboardData, ActivityItem } from './types/dashboard';
import {
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Upload,
} from 'lucide-react';
import { useDashboardData } from './hooks/useDashboardData';
// import AppointmentsSection from "./AppointmentsSection";
import DicomUploadsSection from './DicomUploadsSection';
import SettingsSection from './SettingsSection';
import SocialSection from './SocialSection';
import STLFilesSection from './STLFilesSection';
// import TeamsSection from "./TeamsSection";
import { useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { DashboardStyles } from './types/styles';

interface DashboardProps {
  onLogout: () => void;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
}

interface Activity {
  id: string;
  type: 'file' | 'appointment' | 'team';
  description: string;
  time: string;
  icon: React.ReactNode;
}

const styles: DashboardStyles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #1F2937, #111827)',
    color: 'white',
  },
  zIndexContainer: {
    zIndex: 1000,
  },
  trendText: {
    color: '#94A3B8',
    fontSize: '0.875rem',
  },
  menuContainer: {
    padding: '1rem',
  },
  userIcon: {
    width: '2.5rem',
    height: '2.5rem',
  },
  userName: {
    fontWeight: '600',
    color: 'white',
  },
  userRole: {
    color: '#94A3B8',
    fontSize: '0.875rem',
  },
  navigation: {
    padding: '1rem',
  },
  menuItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    transition: 'all 0.2s ease',
    color: '#94A3B8',
  },
  menuItemLabel: {
    marginLeft: '0.75rem',
  },
  subMenu: {
    marginLeft: '1.5rem',
  },
  subMenuItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    transition: 'all 0.2s ease',
    color: '#94A3B8',
  },
  subMenuText: {
    marginLeft: '0.5rem',
  },
  signOutLabel: {
    marginLeft: '0.75rem',
    color: '#EF4444',
  },
  gradientBackground: {
    backgroundImage: 'linear-gradient(to right, #60A5FA, #A78BFA)',
    backgroundClip: 'text',
    color: 'transparent',
  },
  mobileHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  menuButton: {
    padding: '0.5rem',
    borderRadius: '0.375rem',
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    color: 'white',
    transition: 'background-color 0.2s ease',
  },
  appTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(to right, #60A5FA, #A78BFA)',
    backgroundClip: 'text',
    color: 'transparent',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 50,
    width: '16rem',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.3s ease',
  },
  userInfo: {
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  userInfoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  avatarContainer: {
    width: '3rem',
    height: '3rem',
    borderRadius: '9999px',
    background: 'linear-gradient(to right, #60A5FA, #A78BFA)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemActive: {
    background: 'linear-gradient(to right, #60A5FA, #A78BFA)',
    color: 'white',
  },
  menuItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: '500',
  },
  subMenuContainer: {
    marginLeft: '1rem',
  },
  subMenuItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#60A5FA',
  },
  signOutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    color: '#EF4444',
    transition: 'all 0.2s ease',
  },
  mainContent: {
    minHeight: '100vh',
    transition: 'margin-left 0.3s ease',
    padding: '2rem',
  },
  welcomeTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(to right, #60A5FA, #A78BFA)',
    backgroundClip: 'text',
    color: 'transparent',
    marginBottom: '1.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    gap: '1.5rem',
  },
  statsCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(45, 55, 72, 0.5)',
    backdropFilter: 'blur(10px)',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'border-color 0.3s ease',
  },
  statsCardContent: {
    position: 'relative',
    zIndex: 10,
  },
  statsTitle: {
    color: '#94A3B8',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  statsValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
    backgroundImage: 'linear-gradient(to right, #60A5FA, #A78BFA)',
    backgroundClip: 'text',
    color: 'transparent',
  },
  statsTrend: {
    color: '#94A3B8',
    fontSize: '0.875rem',
  },
  statsGradientOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
  },
  statsIconContainer: {
    width: '3rem',
    height: '3rem',
    borderRadius: '0.5rem',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  activityFeed: {
    marginTop: '2rem',
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
  },
  activityTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: 'white',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    color: '#94A3B8',
    fontSize: '0.875rem',
  },
  activityTime: {
    color: '#64748B',
    fontSize: '0.75rem',
  },
};

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMedicalDataExpanded, setIsMedicalDataExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);
  const { user } = useAuth();
  const { data, loading, error, refetch } = useDashboardData();

  const isDoctor = user?.role === 'doctor';

  const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, icon }) => (
    <div style={styles.statsCard}>
      <div style={styles.statsCardContent}>
        <div style={styles.statsIconContainer}>{icon}</div>
        <h3 style={styles.statsTitle}>{title}</h3>
        <p style={styles.statsValue}>{value}</p>
        {trend && <p style={styles.statsTrend}>{trend}</p>}
      </div>
      <div style={styles.statsGradientOverlay} />
    </div>
  );

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Users },
    { id: 'medical-data', label: 'Medical Data', icon: FileText },
    // { id: "appointments", label: "Appointments", icon: Calendar },
    // { id: "settings", label: "Settings", icon: Settings },
    // ...(isDoctor ? [{ id: "teams", label: "Teams", icon: Users }] : []),
  ];

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return <ErrorDisplay error={error} onRetry={refetch} />;
    }

    switch (activeSection) {
      case 'medical-data':
        if (activeSubSection === 'dicom') {
          return <DicomUploadsSection />;
        } else if (activeSubSection === 'stl') {
          return <STLFilesSection />;
        }
        return <STLFilesSection />;

      // case "appointments":
      //   return (
      //     <AppointmentsSection
      //       userType={isDoctor ? "doctor" : "patient"}
      //       currentUserName={user?.name || ""}
      //     />
      //   );

      // case "settings":
      //   return <SettingsSection />;

      // case "teams":
      //   return isDoctor ? <TeamsSection /> : null;

      case 'dashboard':
      default:
        return (
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={styles.welcomeTitle}>
              Welcome Back, {isDoctor ? `Dr. ${user?.name}` : user?.name}!
            </h2>
            <div style={styles.statsGrid}>
              <StatsCard
                title="Active Files"
                value={data?.activeFiles || 0}
                trend={`${data?.newFiles || 0} new this week`}
                icon={<FileText size={24} />}
              />
              {/* <StatsCard 
                title="Appointments" 
                value={data?.appointments || 0}
                trend={data?.nextAppointment ? `Next: ${data.nextAppointment}` : 'No upcoming appointments'}
                icon={<Calendar size={24} />}
              />
              <StatsCard 
                title={isDoctor ? "Patients" : "Doctors"} 
                value={data?.connections || 0}
                trend={`${data?.newConnections || 0} new this month`}
                icon={<Users size={24} />}
              /> */}
            </div>

            <div style={styles.activityFeed}>
              <h3 style={styles.activityTitle}>Recent Activity</h3>
              {data?.recentActivity?.map((activity: ActivityItem, index: number) => (
                <div key={index} style={styles.activityItem}>
                  {activity.icon}
                  <div style={styles.activityContent}>
                    <p style={styles.activityText}>{activity.description}</p>
                    <span style={styles.activityTime}>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div style={styles.container}>
      {/* Mobile Header */}
      <div style={styles.mobileHeader} className="mobile-header">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={styles.menuButton}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 style={styles.appTitle}>Dashboard</h1>
      </div>

      {/* Sidebar */}
      <aside
        style={{
          ...styles.sidebar,
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        className="sidebar"
      >
        {/* User Info */}
        <div style={styles.userInfo}>
          <div style={styles.userInfoContainer}>
            <div style={styles.avatarContainer}>
              <Users size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <h2 style={styles.userName}>{isDoctor ? `Dr. ${user?.name}` : user?.name}</h2>
              <p style={styles.userRole}>{isDoctor ? 'Doctor' : 'Patient'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={styles.navigation}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            if (item.id === 'medical-data') {
              return (
                <div key={item.id} style={{ marginBottom: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setIsMedicalDataExpanded(!isMedicalDataExpanded);
                      setActiveSection(item.id);
                    }}
                    style={{
                      ...styles.menuItem,
                      ...(isActive ? styles.menuItemActive : {}),
                    }}
                  >
                    <div style={styles.menuItemContent}>
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {isMedicalDataExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {isMedicalDataExpanded && (
                    <div style={styles.subMenuContainer}>
                      <button
                        onClick={() => {
                          setActiveSection('medical-data');
                          setActiveSubSection('stl');
                        }}
                        style={{
                          ...styles.subMenuItem,
                          ...(activeSubSection === 'stl' ? styles.subMenuItemActive : {}),
                        }}
                      >
                        <FileText size={18} />
                        <span>STL Files</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveSection('medical-data');
                          setActiveSubSection('dicom');
                        }}
                        style={{
                          ...styles.subMenuItem,
                          ...(activeSubSection === 'dicom' ? styles.subMenuItemActive : {}),
                        }}
                      >
                        <Upload size={18} />
                        <span>DICOM Uploads</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setActiveSubSection(null);
                }}
                style={{
                  ...styles.menuItem,
                  ...(isActive ? styles.menuItemActive : {}),
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button onClick={onLogout} style={styles.signOutButton}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        style={{
          ...styles.mainContent,
          marginLeft: isSidebarOpen ? '16rem' : '0',
        }}
      >
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
