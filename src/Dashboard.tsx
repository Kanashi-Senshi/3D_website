// src/Dashboard.tsx
import React, { useState } from "react";
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
} from "lucide-react";
import AppointmentsSection from "./AppointmentsSection";
import DicomUploadsSection from "./DicomUploadsSection";
import SettingsSection from "./SettingsSection";
import SocialSection from "./SocialSection";
import STLFilesSection from "./STLFilesSection";
import TeamsSection from "./TeamsSection";
import { useAuth } from "./contexts/AuthContext";

interface DashboardProps {
  onLogout: () => void;
}

interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMedicalDataExpanded, setIsMedicalDataExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Users },
    { id: "medical-data", label: "Medical Data", icon: FileText },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "settings", label: "Settings", icon: Settings },
    ...(isDoctor ? [{ id: "teams", label: "Teams", icon: Users }] : []),
  ];

  const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend }) => (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "rgba(45, 55, 72, 0.5)",
        backdropFilter: "blur(10px)",
        padding: "1.5rem",
        borderRadius: "0.75rem",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        transition: "border-color 0.3s ease",
        "&:hover": {
          borderColor: "rgba(255, 255, 255, 0.3)",
        },
      }}
    >
      <div style={{ position: "relative", zIndex: 10 }}>
        <h3
          style={{
            color: "#94A3B8",
            fontSize: "0.875rem",
            marginBottom: "0.5rem",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "0.25rem",
            backgroundImage: "linear-gradient(to right, #60A5FA, #A78BFA)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {value}
        </p>
        <p style={{ color: "#94A3B8", fontSize: "0.875rem" }}>{trend}</p>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))",
        }}
      />
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "medical-data":
        if (activeSubSection === "dicom") {
          return <DicomUploadsSection />;
        } else if (activeSubSection === "stl") {
          return <STLFilesSection />;
        }
        return <STLFilesSection />;

      case "appointments":
        return (
          <AppointmentsSection
            userType={isDoctor ? "doctor" : "patient"}
            currentUserName={user?.name || ""}
          />
        );

      case "settings":
        return <SettingsSection />;

      case "teams":
        return isDoctor ? <TeamsSection /> : null;

      case "dashboard":
      default:
        return (
          <div style={{ space: "6" }}>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                backgroundImage: "linear-gradient(to right, #60A5FA, #A78BFA)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Welcome Back, {isDoctor ? `Dr. ${user?.name}` : user?.name}!
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
                gap: "1.5rem",
                "@media (min-width: 768px)": {
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                },
                "@media (min-width: 1024px)": {
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                },
              }}
            >
              <StatsCard title="Active Files" value="12" trend="+2 this week" />
              <StatsCard
                title="Appointments"
                value="5"
                trend="Next: Tomorrow"
              />
              <StatsCard
                title={isDoctor ? "Patients" : "Retailers"}
                value={isDoctor ? "28" : "3"}
                trend={isDoctor ? "+3 this month" : "1 new connection"}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #1F2937, #111827)",
        color: "white",
      }}
    >
      {/* Mobile Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem",
          backgroundColor: "rgba(31, 41, 55, 0.8)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          "@media (min-width: 1024px)": {
            display: "none",
          },
        }}
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            padding: "0.5rem",
            borderRadius: "0.375rem",
            backgroundColor: "rgba(55, 65, 81, 0.5)",
            color: "white",
            transition: "background-color 0.2s ease",
          }}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1
          style={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            backgroundImage: "linear-gradient(to right, #60A5FA, #A78BFA)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          TechRetail Hub
        </h1>
      </div>

      {/* Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          width: "16rem",
          backgroundColor: "rgba(31, 41, 55, 0.8)",
          backdropFilter: "blur(10px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "transform 0.3s ease",
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          "@media (min-width: 1024px)": {
            transform: "translateX(0)",
          },
        }}
      >
        {/* User Info */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "9999px",
                background: "linear-gradient(to right, #60A5FA, #A78BFA)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={20} style={{ color: "white" }} />
            </div>
            <div>
              <h2 style={{ fontWeight: "semibold", color: "white" }}>
                {isDoctor ? `Dr. ${user?.name}` : user?.name}
              </h2>
              <p style={{ color: "#94A3B8", fontSize: "0.875rem" }}>
                {isDoctor ? "Doctor" : "Patient"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: "1rem" }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            if (item.id === "medical-data") {
              return (
                <div key={item.id} style={{ space: "1" }}>
                  <button
                    onClick={() => {
                      setIsMedicalDataExpanded(!isMedicalDataExpanded);
                      setActiveSection(item.id);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.375rem",
                      transition: "all 0.2s ease",
                      backgroundColor: isActive
                        ? "linear-gradient(to right, #60A5FA, #A78BFA)"
                        : "transparent",
                      color: isActive ? "white" : "#94A3B8",
                      "&:hover": {
                        backgroundColor: "rgba(55, 65, 81, 0.5)",
                      },
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <Icon size={20} />
                      <span style={{ fontWeight: "medium" }}>{item.label}</span>
                    </div>
                    {isMedicalDataExpanded ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  {isMedicalDataExpanded && (
                    <div style={{ marginLeft: "1rem", space: "1" }}>
                      <button
                        onClick={() => {
                          setActiveSection("medical-data");
                          setActiveSubSection("stl");
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.375rem",
                          transition: "all 0.2s ease",
                          backgroundColor:
                            activeSubSection === "stl"
                              ? "rgba(99, 102, 241, 0.2)"
                              : "transparent",
                          color:
                            activeSubSection === "stl" ? "#60A5FA" : "#94A3B8",
                          "&:hover": {
                            backgroundColor: "rgba(55, 65, 81, 0.5)",
                          },
                        }}
                      >
                        <FileText size={18} />
                        <span style={{ fontSize: "0.875rem" }}>STL Files</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveSection("medical-data");
                          setActiveSubSection("dicom");
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.375rem",
                          transition: "all 0.2s ease",
                          backgroundColor:
                            activeSubSection === "dicom"
                              ? "rgba(99, 102, 241, 0.2)"
                              : "transparent",
                          color:
                            activeSubSection === "dicom"
                              ? "#60A5FA"
                              : "#94A3B8",
                          "&:hover": {
                            backgroundColor: "rgba(55, 65, 81, 0.5)",
                          },
                        }}
                      >
                        <Upload size={18} />
                        <span style={{ fontSize: "0.875rem" }}>
                          DICOM Uploads
                        </span>
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
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.375rem",
                  transition: "all 0.2s ease",
                  backgroundColor: isActive
                    ? "linear-gradient(to right, #60A5FA, #A78BFA)"
                    : "transparent",
                  color: isActive ? "white" : "#94A3B8",
                  "&:hover": {
                    backgroundColor: "rgba(55, 65, 81, 0.5)",
                  },
                }}
              >
                <Icon size={20} />
                <span style={{ fontWeight: "medium" }}>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={onLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.375rem",
              color: "#EF4444",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(239, 68, 68, 0.1)",
              },
            }}
          >
            <LogOut size={20} />
            <span style={{ fontWeight: "medium" }}>Sign Out</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        style={{
          minHeight: "100vh",
          marginLeft: isSidebarOpen ? "16rem" : "0",
          transition: "margin-left 0.3s ease",
          padding: "2rem",
        }}
      >
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
