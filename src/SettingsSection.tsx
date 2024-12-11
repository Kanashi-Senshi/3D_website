// src/SettingsSection.tsx
import React, { useState } from "react";
import { User, Mail, Lock, Bell, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";

// Define an interface for the notifications state
interface NotificationSettings {
  email: boolean;
  appointments: boolean;
  updates: boolean;
}

const SettingsSection = () => {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    appointments: true,
    updates: false,
  });
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Settings</h2>
        {showAlert && (
          <Alert>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Settings updated successfully</AlertDescription>
          </Alert>
        )}
      </div>

      <div
        style={{
          backgroundColor: "#1E293B",
          borderRadius: "0.5rem",
          padding: "1.5rem",
        }}
      >
        <div className="space-y-6">
          {/* Profile Information section remains the same */}
          <div className="space-y-4">
            <h3
              style={{
                fontSize: "1.125rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <User size={20} />
              Profile Information
            </h3>
            <form onSubmit={handleSubmit}>
              {/* Form content remains the same */}
            </form>
          </div>

          {/* Notifications section with fixed typing */}
          <div className="space-y-4">
            <h3
              style={{
                fontSize: "1.125rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Bell size={20} />
              Notification Preferences
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {(
                Object.entries(notifications) as [
                  keyof NotificationSettings,
                  boolean
                ][]
              ).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ color: "#94A3B8", textTransform: "capitalize" }}
                  >
                    {key}
                  </span>
                  <button
                    onClick={() => handleNotificationToggle(key)}
                    style={{
                      width: "2.75rem",
                      height: "1.5rem",
                      backgroundColor: value ? "#4F46E5" : "#4A5568",
                      borderRadius: "9999px",
                      position: "relative",
                      transition: "background-color 0.2s",
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        width: "1rem",
                        height: "1rem",
                        backgroundColor: "white",
                        borderRadius: "50%",
                        transition: "transform 0.2s",
                        transform: `translateX(${
                          value ? "1.5rem" : "0.25rem"
                        })`,
                        top: "0.25rem",
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Security section remains the same */}
          <div className="space-y-4">
            <h3
              style={{
                fontSize: "1.125rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Shield size={20} />
              Privacy & Security
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <button
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#2D3748",
                  border: "none",
                  borderRadius: "0.375rem",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <span>Change Password</span>
                <Lock size={16} />
              </button>
              <button
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#2D3748",
                  border: "none",
                  borderRadius: "0.375rem",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <span>Two-Factor Authentication</span>
                <Shield size={16} />
              </button>
            </div>
          </div>

          {/* Buttons section remains the same */}
          <div
            style={{
              paddingTop: "1rem",
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
            }}
          >
            <button
              type="button"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#2D3748",
                color: "white",
                borderRadius: "0.375rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#4F46E5",
                color: "white",
                borderRadius: "0.375rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
